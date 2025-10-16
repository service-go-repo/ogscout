import { uploadToCloudinary, uploadMultipleFiles as cloudinaryUploadMultiple, UploadResult as CloudinaryResult } from './fileUpload'
import { saveToServer, saveMultipleToServer, ServerUploadResult } from './serverFileUpload'

export interface HybridUploadResult {
  url: string
  publicId?: string // Only for Cloudinary
  localPath?: string // Only for server storage
  filename?: string // Only for server storage
  width?: number
  height?: number
  fileSize: number
  uploadMethod: 'cloudinary' | 'server'
}

// Check if Cloudinary is properly configured
function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

// Upload single file with fallback
export async function hybridUploadFile(
  file: File,
  folder: string = 'service-requests'
): Promise<HybridUploadResult> {
  // First, validate the file
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    throw new Error(`Invalid file object: ${file ? `name=${file.name}, size=${file.size}` : 'null'}`)
  }

  console.log(`Attempting to upload file: ${file.name} (${file.size} bytes)`)

  // Try Cloudinary first if configured
  if (isCloudinaryConfigured()) {
    try {
      console.log('Trying Cloudinary upload...')
      const cloudinaryResult = await uploadToCloudinary(file, folder)
      console.log('Cloudinary upload successful')

      return {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        fileSize: cloudinaryResult.fileSize,
        uploadMethod: 'cloudinary'
      }
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, falling back to server storage:', cloudinaryError)
    }
  } else {
    console.warn('Cloudinary not configured, using server storage')
  }

  // Fallback to server storage
  try {
    console.log('Trying server storage...')
    const serverResult = await saveToServer(file, folder)
    console.log('Server storage successful')

    return {
      url: serverResult.url,
      localPath: serverResult.localPath,
      filename: serverResult.filename,
      width: serverResult.width,
      height: serverResult.height,
      fileSize: serverResult.fileSize,
      uploadMethod: 'server'
    }
  } catch (serverError) {
    console.error('Server storage also failed:', serverError)
    throw new Error(`File upload failed completely. Server: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`)
  }
}

// Upload multiple files with fallback
export async function hybridUploadMultiple(
  files: File[],
  folder: string = 'service-requests'
): Promise<HybridUploadResult[]> {
  // Filter out invalid files
  const validFiles = files.filter(file =>
    file &&
    typeof file.arrayBuffer === 'function' &&
    file.size > 0 &&
    file.name &&
    file.name !== ''
  )

  if (validFiles.length === 0) {
    console.log('No valid files to upload')
    return []
  }

  console.log(`Uploading ${validFiles.length} valid files out of ${files.length} total files`)

  // Try to upload all files
  const uploadPromises = validFiles.map(file => hybridUploadFile(file, folder))

  try {
    const results = await Promise.all(uploadPromises)
    console.log(`Successfully uploaded ${results.length} files`)
    return results
  } catch (error) {
    console.error('Some file uploads failed:', error)
    // Re-throw the error so the API can handle it appropriately
    throw error
  }
}