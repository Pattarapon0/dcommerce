import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface SellerAvatarSectionProps {
  currentAvatar: string | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  error?: string
  disabled?: boolean
  isProcessing?: boolean
}

export default function SellerAvatarSection({
  currentAvatar,
  onFileSelect,
  onRemove,
  error,
  disabled = false,
  isProcessing = false
}: SellerAvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveClick = () => {
    if (!disabled && !isProcessing && currentAvatar) {
      onRemove()
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-900">Business Logo/Avatar</Label>
      
      {/* Avatar Display */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Business logo or avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={disabled || isProcessing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {currentAvatar ? 'Change Logo' : 'Upload Logo'}
          </Button>
          
          {currentAvatar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveClick}
              disabled={disabled || isProcessing}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
        title="Upload business logo or avatar"
      />

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        Upload a logo or image for your business. Max 5MB. Formats: JPEG, PNG, WebP, GIF
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Processing Text */}
      {isProcessing && (
        <div className="text-sm text-blue-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
          Processing image...
        </div>
      )}
    </div>
  )
}