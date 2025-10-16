export interface ImageFallbackData {
  cloudinaryUrl: string
  localPath: string
  fallbackUrl: string
}

// Client-side function to get image with fallback
export function getImageWithFallback(
  cloudinaryUrl: string,
  carId: string,
  publicId: string,
  fallbackType: 'car' | 'damage' | 'profile' = 'car'
): ImageFallbackData {
  // If no cloudinary URL provided, use placeholder
  if (!cloudinaryUrl) {
    return {
      cloudinaryUrl: '',
      localPath: '',
      fallbackUrl: DEFAULT_PLACEHOLDERS[fallbackType]
    }
  }
  
  // If it's already a local URL (starts with /uploads), use it directly
  if (cloudinaryUrl.startsWith('/uploads/')) {
    return {
      cloudinaryUrl: cloudinaryUrl,
      localPath: cloudinaryUrl,
      fallbackUrl: DEFAULT_PLACEHOLDERS[fallbackType]
    }
  }
  
  const localPath = generateLocalImagePath(cloudinaryUrl, carId)
  const fallbackUrl = DEFAULT_PLACEHOLDERS[fallbackType] // Default placeholder
  
  return {
    cloudinaryUrl,
    localPath,
    fallbackUrl
  }
}

// Generate local image path from Cloudinary URL or filename
export function generateLocalImagePath(
  cloudinaryUrl: string, 
  carId: string, 
  filename?: string
): string {
  if (!cloudinaryUrl && !filename) return ''
  
  try {
    let cleanFilename = ''
    
    if (filename) {
      cleanFilename = sanitizeFilename(filename)
    } else {
      // Extract filename from Cloudinary URL
      const urlParts = cloudinaryUrl.split('/')
      const urlFilename = urlParts[urlParts.length - 1]
      
      // Remove Cloudinary transformations
      const baseFilename = urlFilename.split('_')[0]
      const extension = urlFilename.split('.').pop()
      cleanFilename = `${baseFilename}.${extension}`
    }
    
    return `/images/cars/${carId}/${cleanFilename}`
  } catch (error) {
    console.error('Error generating local image path:', error)
    return ''
  }
}

// Check if local image exists (client-side)
export async function checkLocalImageExists(localPath: string): Promise<boolean> {
  try {
    const response = await fetch(localPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Simple client-side filename sanitization
function sanitizeFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  return nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

// Default placeholder images
export const DEFAULT_PLACEHOLDERS = {
  car: '/images/placeholder-car.svg',
  damage: '/images/placeholder-damage.svg',
  profile: '/images/placeholder-profile.svg'
}

// Enhanced image metadata interface
export interface EnhancedImageData {
  cloudinaryUrl: string
  localPath: string
  fallbackUrl: string
  publicId: string
  filename: string
  mimeType?: string
  size?: number
  dimensions?: {
    width: number
    height: number
  }
}
