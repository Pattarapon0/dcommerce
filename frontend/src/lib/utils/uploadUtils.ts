interface UploadOptions {
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

interface UploadResult {
  success: boolean
  error?: string
}

export const uploadWithRetry = async (
  url: string,
  data: Blob | File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { retries = 3, retryDelay = 1000 } = options

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': data.type,
          ...options.headers,
        },
        signal: options.signal,
      })

      if (response.ok) {
        return { success: true }
      }

      if (attempt === retries) {
        return {
          success: false,
          error: `Upload failed after ${retries} attempts`
        }
      }

    } catch (error) {
      if (attempt === retries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }

      // Wait before retry: 1s, 2s, 3s
      await new Promise(resolve =>
        setTimeout(resolve, retryDelay * attempt)
      )
    }
  }

  return { success: false, error: 'Unexpected error' }
}

// Specific wrapper for presigned URL uploads
export const uploadToPresignedUrl = async (
  presignedUrl: string,
  file: Blob | File,
  options?: Omit<UploadOptions, 'headers'>
): Promise<UploadResult> => {
  return uploadWithRetry(presignedUrl, file, options)
}