'use client'

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useImageValidation } from '@/lib/utils/imageValidation'
import Image from 'next/image'
import { saveFile, deleteFile } from '@/lib/utils/OPFS'
import store from '@/stores/store'
import { invalidateAvatarAtom, isDraftNoAvatarAtom } from '@/stores/avatar'
import { useAtom } from 'jotai'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onAvatarChange?: (URL: string | null) => void
  onError?: (error: string) => void
  disabled?: boolean
  role?: "buyer" | "seller"
  className?: string
  hasGlobalChanges?: boolean
}

export interface AvatarUploadRef {
  reset: () => void
}

export const AvatarUpload = forwardRef<AvatarUploadRef, AvatarUploadProps>(({
  currentAvatar,
  onError,
  disabled = false,
  role = "buyer",
  className,
  hasGlobalChanges
}, ref) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { validateFile } = useImageValidation() // Uses avatar preset
  const [isDraftNoAvatar, setIsDraftNoAvatar] = useAtom(isDraftNoAvatarAtom)
  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      // 1. Validate file with our comprehensive validator
      const validation = await validateFile(file)
      
      if (!validation.isValid) {
        setError(validation.errors[0]) // Show first error
        onError?.(validation.errors[0])
        return
      }

      // 2. Compress image for optimal size (max 256px for avatar storage)
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // Max 500KB after compression
        maxWidthOrHeight: 256, // Store at 256px max - perfect for avatars
        useWebWorker: true,
        fileType: 'image/webp', 
        initialQuality: 0.85
      })

      // 3. Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreview(previewUrl)
      console.log('Preview URL created:', previewUrl) 
      await saveFile(`drafts-${role}-avatars`, "avatar.webp", compressedFile);
      
      // 🔥 Trigger atom re-evaluation
      store.set(invalidateAvatarAtom)
      if(isDraftNoAvatar)
        setIsDraftNoAvatar(false);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process image'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }, [validateFile,role, onError,isDraftNoAvatar,setIsDraftNoAvatar])

  const handleFileSelect = useCallback((file: File) => {
    processFile(file)
  }, [processFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0])
    }
  }, [handleFileSelect])

  const handleRemove = useCallback(async () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setError(null)
    
    // 🔥 Smart change detection: Only mark as changed if we had a currentAvatar to remove from
    const hadOriginalAvatar = currentAvatar !== null && currentAvatar !== undefined
    if(hasGlobalChanges){
      const result= await deleteFile(`drafts-${role}-avatars`, "avatar.webp")
    // 🔥 Trigger atom re-evaluation
      store.set(invalidateAvatarAtom)
      console.log('Avatar removed:', { hadOriginalAvatar, result })
    }
    else {
      setIsDraftNoAvatar(true);}
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [preview,role, currentAvatar, hasGlobalChanges, setIsDraftNoAvatar])

  // Reset function exposed to parent
  const resetAvatar = useCallback(async () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setError(null)
    setIsProcessing(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Delete draft file from OPFS
    if(!isDraftNoAvatar){
      await deleteFile(`drafts-${role}-avatars`, "avatar.webp")
    
    // 🔥 Trigger atom re-evaluation  
      store.set(invalidateAvatarAtom)
    }
    else {
      setIsDraftNoAvatar(false) ;
    }
  }, [preview, role,isDraftNoAvatar,setIsDraftNoAvatar])

  // Expose reset function to parent component
  useImperativeHandle(ref, () => ({
    reset: resetAvatar
  }), [resetAvatar])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: disabled || isProcessing,
    noClick: true // We handle click manually
  })

  const displayAvatar = preview || currentAvatar
  return (
    <div className={cn('', className)}>
      {/* Ultra-Minimal Avatar Section - Form Field Style */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Profile Photo</Label>
        <div className="flex items-center gap-3">
          {/* Tiny Avatar Display */}
          <div className="relative shrink-0">
            <div
              className={cn(
                'relative w-10 h-10 rounded-full border overflow-hidden bg-gray-100',
                ( hasGlobalChanges) && 'ring-2 ring-green-400',
                error && 'ring-2 ring-red-300',
                isProcessing && 'ring-2 ring-blue-500'
              )}
            >
              {(displayAvatar && !isDraftNoAvatar) ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-gray-400" />
                </div>
              )}

              {/* Tiny Status Indicator */}
              {hasGlobalChanges && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-2.5 w-2.5 border border-white border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Inline Controls - Like Form Elements */}
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {displayAvatar ? 'Current photo' : 'No photo yet'}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                className="text-xs h-8 px-3"
              >
                <Camera className="w-3 h-3 mr-1" />
                {displayAvatar ? 'Change' : 'Upload'}
              </Button>

              {(hasGlobalChanges || (displayAvatar && !isDraftNoAvatar)) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isProcessing }
                  className="text-xs h-8 px-2 text-gray-500 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input
          {...getInputProps()}
          ref={fileInputRef}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {/* Drag Drop Zone - Only for empty state and very minimal */}
        {!displayAvatar && (
          <div
            {...getRootProps()}
            className={cn(
              'mt-1 py-2 px-3 border border-dashed border-gray-300 rounded text-center cursor-pointer hover:border-gray-400 transition-colors',
              isDragActive && 'border-blue-400 bg-blue-50',
              error && 'border-red-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          >
            <p className="text-xs text-gray-500">
              {isDragActive ? 'Drop here' : 'Click or drag to upload'}
            </p>
          </div>
        )}

        {/* Minimal Status Messages */}
        {error && (
          <div className="text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </div>
        )}

        {hasGlobalChanges && !error && (
          <div className="text-xs text-green-600 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready to save
          </div>
        )}

        {isProcessing && (
          <div className="text-xs text-blue-600 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
            Processing...
          </div>
        )}
      </div>
    </div>
  )
})

AvatarUpload.displayName = 'AvatarUpload'