import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  fileSize: number
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'service-requests'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Validate file object
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
      reject(new Error(`Invalid file object: ${file ? `name=${file.name}, size=${file.size}` : 'null'}`))
      return
    }

    const uploadOptions = {
      folder,
      resource_type: 'auto' as const,
      quality: 'auto',
      fetch_format: 'auto',
    }

    // Convert File to Buffer
    file.arrayBuffer().then((buffer) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(`Upload failed: ${error.message}`))
            return
          }

          if (!result) {
            reject(new Error('Upload failed: No result returned'))
            return
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            fileSize: result.bytes,
          })
        }
      )

      stream.end(Buffer.from(buffer))
    }).catch((error) => {
      reject(new Error(`File processing failed: ${error.message}`))
    })
  })
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string = 'service-requests'
): Promise<UploadResult[]> {
  // Filter out invalid files before uploading
  const validFiles = files.filter(file =>
    file &&
    typeof file.arrayBuffer === 'function' &&
    file.size > 0 &&
    file.name &&
    file.name !== ''
  )

  if (validFiles.length === 0) {
    return []
  }

  console.log(`Uploading ${validFiles.length} valid files out of ${files.length} total files`)

  const uploadPromises = validFiles.map(file => uploadToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}