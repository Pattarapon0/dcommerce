

// Validation configuration for different image types
export interface ImageValidationConfig {
  maxSizeBytes: number
  minDimensions: { width: number; height: number }
  maxDimensions: { width: number; height: number }
  allowedFormats: string[]
  maxAspectRatio?: number // Optional: max width/height ratio
  minAspectRatio?: number // Optional: min width/height ratio
  requireSquare?: boolean // Optional: enforce square images
}

// Pre-defined configurations for common use cases (matching backend appsettings.json)
export const IMAGE_VALIDATION_PRESETS = {
  avatar: {
    maxSizeBytes: 5242880, // 5MB - matches backend MaxFileSizeBytes
    minDimensions: { width: 50, height: 50 }, // Matches backend AvatarMinWidth/Height
    maxDimensions: { width: 2048, height: 2048 }, // Matches backend AvatarMaxWidth/Height
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Matches backend AllowedMimeTypes
    maxAspectRatio: 3.0, // Matches backend AvatarMaxAspectRatio
    minAspectRatio: 0.33 // Matches backend AvatarMinAspectRatio
  } as ImageValidationConfig,

  product: {
    maxSizeBytes: 8388608, // 8MB - matches backend ProductMaxFileSizeBytes
    minDimensions: { width: 100, height: 100 }, // Matches backend ProductMinWidth/Height
    maxDimensions: { width: 2048, height: 2048 }, // Matches backend ProductMaxWidth/Height
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Matches backend AllowedMimeTypes
    maxAspectRatio: 5.0, // Matches backend ProductMaxAspectRatio
    minAspectRatio: 0.2 // Matches backend ProductMinAspectRatio
  } as ImageValidationConfig,

  sellerProfile: {
    maxSizeBytes: 5242880, // 5MB - matches backend MaxFileSizeBytes
    minDimensions: { width: 50, height: 50 }, // Matches backend SellerProfileMinWidth/Height
    maxDimensions: { width: 2048, height: 2048 }, // Matches backend SellerProfileMaxWidth/Height
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Matches backend AllowedMimeTypes
    maxAspectRatio: 3.0, // Matches backend SellerProfileMaxAspectRatio (Square)
    minAspectRatio: 0.33 // Matches backend SellerProfileMinAspectRatio (Square)
  } as ImageValidationConfig,
} as const

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    realType: string
    extension: string
    width: number
    height: number
    aspectRatio: number
    fileSize: number
    fileSizeFormatted: string
  }
}

export class ImageValidator {
  private config: ImageValidationConfig

  constructor(config: ImageValidationConfig) {
    this.config = config
  }

  // Static factory methods for common use cases
  static forAvatar(): ImageValidator {
    return new ImageValidator(IMAGE_VALIDATION_PRESETS.avatar)
  }

  static forProduct(): ImageValidator {
    return new ImageValidator(IMAGE_VALIDATION_PRESETS.product)
  }

  static forSellerProfile(): ImageValidator {
    return new ImageValidator(IMAGE_VALIDATION_PRESETS.sellerProfile)
  }

  static withConfig(config: ImageValidationConfig): ImageValidator {
    return new ImageValidator(config)
  }

  async validate(file: File): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    }

    try {
      // 1. Basic file checks
      if (!file || file.size === 0) {
        result.errors.push('No file selected')
        return result
      }

      // 2. File size validation
      if (file.size > this.config.maxSizeBytes) {
        const maxSizeMB = (this.config.maxSizeBytes / 1024 / 1024).toFixed(1)
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
        result.errors.push(`File too large (${fileSizeMB}MB > ${maxSizeMB}MB)`)
        return result
      }

      // 3. Real file type detection (security check) - lazy load
      const buffer = await file.arrayBuffer()
      const { fileTypeFromBuffer } = await import('file-type')
      const fileType = await fileTypeFromBuffer(buffer)
      
      if (!fileType) {
        result.errors.push('Unable to determine file type')
        return result
      }

      if (!fileType.mime.startsWith('image/')) {
        result.errors.push(`Not an image file (detected: ${fileType.mime})`)
        return result
      }

      // 4. Supported format validation
      if (!this.config.allowedFormats.includes(fileType.mime)) {
        const supportedFormats = this.config.allowedFormats
          .map(type => type.split('/')[1].toUpperCase())
          .join(', ')
        result.errors.push(`Format .${fileType.ext?.toUpperCase()} not supported (use ${supportedFormats})`)
        return result
      }

      // 5. Image dimension validation - lazy load
      let dimensions
      try {
        const sizeOf = (await import('image-size')).default
        dimensions = sizeOf(new Uint8Array(buffer))
      } catch {
        result.errors.push('Invalid or corrupted image')
        return result
      }

      if (!dimensions.width || !dimensions.height) {
        result.errors.push('Invalid or corrupted image - cannot read dimensions')
        return result
      }

      // 6. Minimum dimension check
      if (dimensions.width < this.config.minDimensions.width || 
          dimensions.height < this.config.minDimensions.height) {
        result.errors.push(
          `Image too small (${dimensions.width}×${dimensions.height} < ${this.config.minDimensions.width}×${this.config.minDimensions.height})`
        )
        return result
      }

      // 7. Maximum dimension check
      if (dimensions.width > this.config.maxDimensions.width || 
          dimensions.height > this.config.maxDimensions.height) {
        result.errors.push(
          `Image too large (${dimensions.width}×${dimensions.height} > ${this.config.maxDimensions.width}×${this.config.maxDimensions.height})`
        )
        return result
      }

      // 8. Aspect ratio validation (if configured)
      const aspectRatio = dimensions.width / dimensions.height
      
      if (this.config.requireSquare && Math.abs(aspectRatio - 1) > 0.1) {
        result.errors.push('Image must be square (equal width and height)')
        return result
      }

      if (this.config.maxAspectRatio && aspectRatio > this.config.maxAspectRatio) {
        result.errors.push(`Image too wide (aspect ratio ${aspectRatio.toFixed(2)} > ${this.config.maxAspectRatio})`)
        return result
      }

      if (this.config.minAspectRatio && aspectRatio < this.config.minAspectRatio) {
        result.errors.push(`Image too tall (aspect ratio ${aspectRatio.toFixed(2)} < ${this.config.minAspectRatio})`)
        return result
      }

      // 9. Warnings for potential issues
      if (file.type !== fileType.mime) {
        result.warnings.push(`File extension suggests ${file.type} but actual format is ${fileType.mime}`)
      }

      if (dimensions.width !== dimensions.height && this.config === IMAGE_VALIDATION_PRESETS.avatar) {
        result.warnings.push('Non-square image will be cropped for avatar display')
      }

      // Success! Build metadata
      result.isValid = true
      result.metadata = {
        realType: fileType.mime,
        extension: fileType.ext || 'unknown',
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
        fileSize: file.size,
        fileSizeFormatted: this.formatFileSize(file.size)
      }

    } catch (error) {
      result.errors.push(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  // Validate multiple files (for product galleries)
  async validateMultiple(files: File[]): Promise<ValidationResult[]> {
    return Promise.all(files.map(file => this.validate(file)))
  }

  // Helper method to get validation summary for multiple files
  async validateMultipleWithSummary(files: File[]): Promise<{
    results: ValidationResult[]
    summary: {
      totalFiles: number
      validFiles: number
      invalidFiles: number
      totalErrors: number
      totalWarnings: number
    }
  }> {
    const results = await this.validateMultiple(files)
    
    const summary = {
      totalFiles: results.length,
      validFiles: results.filter(r => r.isValid).length,
      invalidFiles: results.filter(r => !r.isValid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
    }

    return { results, summary }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// React hook for easy validation in components
export const useImageValidation = (config?: ImageValidationConfig) => {
  const validator = config ? new ImageValidator(config) : ImageValidator.forAvatar()

  const validateFile = async (file: File) => {
    return validator.validate(file)
  }

  const validateMultiple = async (files: File[]) => {
    return validator.validateMultiple(files)
  }

  return {
    validateFile,
    validateMultiple,
    validator
  }
}

// Utility functions for common validation scenarios
export const validateAvatarFile = async (file: File) => {
  const { fileTypeFromBuffer } = await import('file-type')
  const sizeOf = (await import('image-size')).default
  return ImageValidator.forAvatar().validate(file)
}

export const validateProductFile = async (file: File) => {
  const { fileTypeFromBuffer } = await import('file-type')
  const sizeOf = (await import('image-size')).default
  return ImageValidator.forProduct().validate(file)
}

export const validateSellerProfileFile = async (file: File) => {
  const { fileTypeFromBuffer } = await import('file-type')
  const sizeOf = (await import('image-size')).default
  return ImageValidator.forSellerProfile().validate(file)
}

// Export types for TypeScript consumers
