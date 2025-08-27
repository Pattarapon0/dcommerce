"use client"

import {useState,useRef,useEffect} from "react"
import Image from "next/image"
import { X, Plus, Image as ImageIcon, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/util"
import { validateProductFile } from "@/lib/utils/imageValidation"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
  error?: string
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  className,
  error,
  disabled = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [draggedIndex, setDraggedIndex] =useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const nonImageFiles = files.filter(file => !file.type.startsWith('image/'))
    
    // Show error for non-image files
    if (nonImageFiles.length > 0) {
      const errorMessage = `${nonImageFiles.length} file(s) rejected: Only image files are allowed`
      toast.error(errorMessage)
    }
    
    const remainingSlots = maxImages - value.length
    const filesToProcess = imageFiles.slice(0, remainingSlots)

    // Show warning if trying to add too many images
    if (imageFiles.length > remainingSlots) {
      const errorMessage = `Can only add ${remainingSlots} more image(s). ${imageFiles.length - remainingSlots} file(s) ignored.`
      toast.warning(errorMessage)
    }

    if (filesToProcess.length === 0) return

    setIsProcessing(true)
    const processedImages: string[] = []

    try {
      for (const file of filesToProcess) {
        // Validate the file using your existing validation
        const validation = await validateProductFile(file)
        if (!validation.isValid) {
          const errorMessage = validation.errors[0]
          toast.error(errorMessage)
          continue
        }

        // Compress the image - lazy load imageCompression
        const { default: imageCompression } = await import('browser-image-compression')
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.85
        })
        console.log(`Compressed ${file.name} from ${file.size} to ${compressedFile.size} bytes`)
        // Create blob URL for preview
        const blobUrl = URL.createObjectURL(compressedFile)
        processedImages.push(blobUrl)
      }

      if (processedImages.length > 0) {
        const newImages = [...value, ...processedImages]
        onChange(newImages)
        toast.success(`${processedImages.length} image(s) added successfully`)
      }
    } catch {
      const errorMessage = 'Failed to process image'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = value[index]
    // Revoke blob URL to free memory
    if (imageToRemove && imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove)
    }
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  // Move image to different position
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= value.length) return
    
    const newImages = [...value]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOverImage = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnImage = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      value.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const canAddMore = value.length < maxImages && !disabled && !isProcessing

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((image, index) => (
            <div 
              key={index} 
              className={cn(
                "relative group cursor-move",
                draggedIndex === index && "opacity-50"
              )}
              draggable={!disabled && !isProcessing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOverImage}
              onDrop={(e) => handleDropOnImage(e, index)}
            >
              {/* Changed from square to landscape aspect ratio */}
              <div className="aspect-[4/3] w-full rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 relative">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized={image.startsWith('blob:')} // Don't optimize blob URLs
                />
                
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white p-1 rounded">
                    <GripVertical className="h-3 w-3" />
                  </div>
                </div>

                {/* Reorder Controls */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={disabled || isProcessing}
                      className="h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-0"
                    >
                      <ChevronLeft className="h-3 w-3 text-white" />
                    </Button>
                  )}
                  {index < value.length - 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={disabled || isProcessing}
                      className="h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-0"
                    >
                      <ChevronRight className="h-3 w-3 text-white" />
                    </Button>
                  )}
                </div>

                {/* Remove Button */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={disabled || isProcessing}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Main
                </div>
              )}
              
              {/* Image Number */}
              <div className="absolute -bottom-2 -left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              {value.length === 0 ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  {value.length === 0 ? "Upload product images" : "Add more images"}
                </span>
                <p className="text-gray-500 mt-1">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {value.length} of {maxImages} images • PNG, JPG up to 8MB each
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-blue-600 text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    Processing images...
                  </div>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled || isProcessing}
          />
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Help Text */}
      {value.length === 0 && !error && (
        <p className="text-xs text-gray-500">
          The first image will be used as the main product image. You can reorder images by dragging or using arrow buttons. Upload up to {maxImages} images.
        </p>
      )}
      
      {/* Reorder Instructions */}
      {value.length > 1 && (
        <p className="text-xs text-gray-500">
          💡 Drag images to reorder, or use arrow buttons on hover. The first image is your main product photo.
        </p>
      )}
    </div>
  )
}