import fs from 'fs/promises'
import path from 'path'

export interface ImageStorageOptions {
  carId: string
  filename: string
  buffer: Buffer
  mimeType: string
}

// Server-side function to save image locally
export async function saveImageLocally(options: ImageStorageOptions): Promise<string> {
  const { carId, filename, buffer, mimeType } = options
  
  try {
    // Create directory structure
    const carDir = path.join(process.cwd(), 'public', 'images', 'cars', carId)
    await fs.mkdir(carDir, { recursive: true })
    
    // Generate clean filename
    const extension = getExtensionFromMimeType(mimeType)
    const cleanFilename = sanitizeFilename(filename) + extension
    const localPath = path.join(carDir, cleanFilename)
    
    // Save file
    await fs.writeFile(localPath, buffer)
    
    // Return public URL path
    return `/images/cars/${carId}/${cleanFilename}`
  } catch (error) {
    console.error('Error saving image locally:', error)
    throw new Error('Failed to save image locally')
  }
}

// Server-side function to delete local images
export async function deleteLocalImages(carId: string): Promise<void> {
  try {
    const carDir = path.join(process.cwd(), 'public', 'images', 'cars', carId)
    await fs.rmdir(carDir, { recursive: true })
  } catch (error) {
    console.error('Error deleting local images:', error)
    // Don't throw error - this is cleanup
  }
}

// Utility functions
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg'
  }
  
  return mimeMap[mimeType] || '.jpg'
}

function sanitizeFilename(filename: string): string {
  // Remove extension and sanitize
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  return nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}
