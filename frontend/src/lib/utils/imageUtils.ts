/** 
 * Image utility functions for avatar processing 
 */ 
 
export const convertToWebP = async (imageUrl: string): Promise<File | null> => { 
  const fetchWithRetry = async (url: string, retries: number = 1): Promise<Blob> => { 
    for (let attempt = 0; attempt <= retries; attempt++) { 
      try { 
        const response = await fetch(url) 
        if (!response.ok) throw new Error(`HTTP ${response.status}`) 
        return await response.blob() 
      } catch (error) { 
        console.warn(`Fetch attempt ${attempt + 1} failed:`, error) 
        if (attempt === retries) throw error 
        await new Promise(resolve => setTimeout(resolve, 1000)) 
      } 
    } 
    throw new Error('All fetch attempts failed') 
  } 
 
  try { 
    const blob = await fetchWithRetry(imageUrl, 2) 
    const canvas = document.createElement('canvas') 
    const ctx = canvas.getContext('2d') 
    if (!ctx) return null 
    const img = new Image() 
    return new Promise((resolve) => { 
      img.onload = () => { 
        canvas.width = img.width 
        canvas.height = img.height 
        ctx.drawImage(img, 0, 0) 
        canvas.toBlob((webpBlob) => { 
          if (webpBlob) { 
            resolve(new File([webpBlob], 'avatar.webp', { type: 'image/webp' })) 
          } else resolve(null) 
        }, 'image/webp', 0.9) 
      } 
      img.onerror = () => resolve(null) 
      img.crossOrigin = 'anonymous' 
      img.src = URL.createObjectURL(blob) 
    }) 
  } catch (error) { 
    console.error('Failed to fetch image:', error) 
    return null 
  } 
} 
 
export const fileToUsableBlobUrl = async (file: File): Promise<string | null> => {
  try {
    // Create a Blob URL directly from the File
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  } catch (error) {
    console.error('Failed to create blob URL:', error);
    return null;
  }
};


