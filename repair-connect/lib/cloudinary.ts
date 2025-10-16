// Server-side Cloudinary configuration (only import on server)
let cloudinary: typeof import('cloudinary').v2 | null = null

if (typeof window === 'undefined') {
  // Only import and configure Cloudinary on the server
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { v2 } = require('cloudinary')
  cloudinary = v2
  
  cloudinary?.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Upload options for different media types
export const UPLOAD_PRESETS = {
  CAR_PHOTOS: {
    folder: 'repair-connect/cars/photos',
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 10000000, // 10MB
  },
  CAR_VIDEOS: {
    folder: 'repair-connect/cars/videos',
    resource_type: 'video' as const,
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    max_file_size: 100000000, // 100MB
    transformation: [
      { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
    ],
  },
  DAMAGE_PHOTOS: {
    folder: 'repair-connect/cars/damage',
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 8000000, // 8MB
  },
  WORKSHOP_GALLERY: {
    folder: 'repair-connect/workshops/gallery',
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 10000000, // 10MB
  },
  WORKSHOP_CERTIFICATES: {
    folder: 'repair-connect/workshops/certificates',
    transformation: [
      { width: 1200, height: 1600, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    max_file_size: 5000000, // 5MB
  },
  WORKSHOP_COVER: {
    folder: 'repair-connect/workshops/covers',
    transformation: [
      { width: 1920, height: 600, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 8000000, // 8MB
  },
  WORKSHOP_LOGO: {
    folder: 'repair-connect/workshops/logos',
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 'auto' },
      { format: 'auto' }
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 2000000, // 2MB
  }
}

// Transformation interface
export interface CloudinaryTransformation {
  width?: number
  height?: number
  crop?: string
  quality?: string
  format?: string
  [key: string]: string | number | undefined
}

// Upload result interface
export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
  created_at: string
  folder?: string
}

// Server-side upload function (only works on server)
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: {
    folder: string
    resourceType?: 'image' | 'video' | 'auto'
    transformation?: CloudinaryTransformation[]
    publicId?: string
    tags?: string[]
  }
): Promise<CloudinaryUploadResult> {
  if (typeof window !== 'undefined') {
    throw new Error('uploadToCloudinary can only be called on the server')
  }
  
  if (!cloudinary) {
    throw new Error('Cloudinary not configured')
  }

  try {
    console.log('uploadToCloudinary called with options:', options)
    console.log('File type:', typeof file, 'Buffer?', Buffer.isBuffer(file), 'File?', file instanceof File)
    
    const uploadOptions = {
      folder: options.folder,
      resource_type: options.resourceType || 'auto',
      transformation: options.transformation,
      public_id: options.publicId,
      tags: options.tags,
      use_filename: true,
      unique_filename: true,
    }
    
    console.log('Upload options:', uploadOptions)

    let uploadResult
    
    if (file instanceof File) {
      // Convert File to buffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        uploadOptions
      )
    } else if (Buffer.isBuffer(file)) {
      // Handle Buffer directly - detect format from buffer
      let mimeType = 'image/png' // default
      
      // Simple file type detection from buffer header
      if (file.length >= 8) {
        const header = file.subarray(0, 8)
        if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
          mimeType = 'image/png'
        } else if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
          mimeType = 'image/jpeg'
        } else if (header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP') {
          mimeType = 'image/webp'
        }
      }
      
      uploadResult = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${file.toString('base64')}`,
        {
          ...uploadOptions,
          resource_type: 'auto' // Let Cloudinary auto-detect the format
        }
      )
    } else {
      // Handle string (URL or base64)
      uploadResult = await cloudinary.uploader.upload(file as string, uploadOptions)
    }

    console.log('Cloudinary upload successful:', uploadResult.public_id)
    
    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      bytes: uploadResult.bytes,
      created_at: uploadResult.created_at,
      folder: uploadResult.folder,
    } as CloudinaryUploadResult
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

// Upload multiple car photos
export async function uploadCarPhotos(
  files: File[],
  carId: string,
  category: 'exterior' | 'interior' | 'damage' | 'engine' | 'other' = 'exterior'
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map((file, index) => {
    const preset = category === 'damage' ? UPLOAD_PRESETS.DAMAGE_PHOTOS : UPLOAD_PRESETS.CAR_PHOTOS
    
    return uploadToCloudinary(file, {
      folder: preset.folder,
      resourceType: 'image',
      transformation: preset.transformation,
      publicId: `${carId}_${category}_${index}_${Date.now()}`,
      tags: [carId, category, 'car-photo'],
    })
  })

  try {
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading car photos:', error)
    throw new Error('Failed to upload one or more photos')
  }
}

// Upload car video
export async function uploadCarVideo(
  file: File,
  carId: string
): Promise<CloudinaryUploadResult> {
  const preset = UPLOAD_PRESETS.CAR_VIDEOS
  
  return uploadToCloudinary(file, {
    folder: preset.folder,
    resourceType: 'video',
    transformation: preset.transformation,
    publicId: `${carId}_video_${Date.now()}`,
    tags: [carId, 'car-video'],
  })
}

// Server-side delete function (only works on server)
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ result: string }> {
  if (typeof window !== 'undefined') {
    throw new Error('deleteFromCloudinary can only be called on the server')
  }
  
  if (!cloudinary) {
    throw new Error('Cloudinary not configured')
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return result
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}

// Generate transformation URL (client-safe)
export function generateTransformationUrl(
  publicId: string,
  transformations: CloudinaryTransformation[]
): string {
  if (typeof window !== 'undefined') {
    // Client-side: construct URL manually
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured')
    }
    
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
    const transformationString = transformations.length > 0 
      ? transformations.map(t => Object.entries(t).map(([k, v]) => `${k}_${v}`).join(',')).join('/')
      : ''
    
    return transformationString 
      ? `${baseUrl}/${transformationString}/${publicId}`
      : `${baseUrl}/${publicId}`
  } else {
    // Server-side: use cloudinary SDK
    if (!cloudinary) {
      throw new Error('Cloudinary not configured')
    }
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    })
  }
}

// Generate thumbnail URL (client-safe)
export function generateThumbnailUrl(
  publicId: string,
  width: number = 300,
  height: number = 200
): string {
  return generateTransformationUrl(publicId, [
    { width, height, crop: 'fill' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ])
}

// Validate file type and size
export function validateFile(
  file: File,
  type: 'photo' | 'video'
): { isValid: boolean; error?: string } {
  const preset = type === 'photo' ? UPLOAD_PRESETS.CAR_PHOTOS : UPLOAD_PRESETS.CAR_VIDEOS
  
  // Check file size
  if (file.size > preset.max_file_size) {
    const maxSizeMB = preset.max_file_size / (1024 * 1024)
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    }
  }
  
  // Check file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension || !preset.allowed_formats.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File format must be one of: ${preset.allowed_formats.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Get optimized image URL for different screen sizes
export function getResponsiveImageUrl(
  publicId: string,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string {
  const transformations = {
    mobile: [{ width: 400, height: 300, crop: 'fill', quality: 'auto' }],
    tablet: [{ width: 600, height: 450, crop: 'fill', quality: 'auto' }],
    desktop: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
  }

  if (!cloudinary) {
    throw new Error('Cloudinary not initialized')
  }

  return cloudinary.url(publicId, {
    transformation: [...transformations[breakpoint], { format: 'auto' }],
    secure: true,
  })
}

// Fetch workshop images from Cloudinary (server-side only)
export async function fetchWorkshopImages(workshopId: string, type: 'gallery' | 'certificates' | 'all' = 'all') {
  if (typeof window !== 'undefined') {
    throw new Error('fetchWorkshopImages can only be called on the server')
  }

  if (!cloudinary) {
    throw new Error('Cloudinary not configured')
  }

  try {
    const allResources: any[] = []

    // Search by folder path with workshopId, not by tags
    // Images are stored in folders like: repair-connect/workshops/gallery/workshopId_...
    if (type === 'gallery' || type === 'all') {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: `repair-connect/workshops/gallery`,
          max_results: 500,
        })

        // Filter resources that contain the workshopId in their public_id or path
        const filteredGallery = result.resources.filter((resource: any) => {
          const publicId = resource.public_id || ''
          const folder = resource.folder || ''
          return publicId.includes(workshopId) || folder.includes(workshopId) ||
                 (resource.tags && resource.tags.includes(workshopId))
        })

        allResources.push(...filteredGallery)
        console.log(`Found ${filteredGallery.length} gallery images for workshop ${workshopId}`)
      } catch (error) {
        console.log('No gallery images found or error:', error)
      }
    }

    if (type === 'certificates' || type === 'all') {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: `repair-connect/workshops/certificates`,
          max_results: 500,
        })

        // Filter resources that contain the workshopId
        const filteredCerts = result.resources.filter((resource: any) => {
          const publicId = resource.public_id || ''
          const folder = resource.folder || ''
          return publicId.includes(workshopId) || folder.includes(workshopId) ||
                 (resource.tags && resource.tags.includes(workshopId))
        })

        allResources.push(...filteredCerts)
        console.log(`Found ${filteredCerts.length} certificate images for workshop ${workshopId}`)
      } catch (error) {
        console.log('No certificate images found or error:', error)
      }
    }

    return allResources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      url: resource.url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
      folder: resource.folder,
      tags: resource.tags || [],
    }))
  } catch (error) {
    console.error('Error fetching workshop images from Cloudinary:', error)
    return []
  }
}

// Upload workshop gallery images
export async function uploadWorkshopGallery(
  files: File[],
  workshopId: string
): Promise<CloudinaryUploadResult[]> {
  const preset = UPLOAD_PRESETS.WORKSHOP_GALLERY

  const uploadPromises = files.map((file, index) => {
    return uploadToCloudinary(file, {
      folder: preset.folder,
      resourceType: 'image',
      transformation: preset.transformation,
      publicId: `${workshopId}_gallery_${index}_${Date.now()}`,
      tags: [workshopId, 'workshop-gallery'],
    })
  })

  try {
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading workshop gallery:', error)
    throw new Error('Failed to upload one or more gallery images')
  }
}

// Upload workshop certificate
export async function uploadWorkshopCertificate(
  file: File,
  workshopId: string,
  certificateName: string
): Promise<CloudinaryUploadResult> {
  const preset = UPLOAD_PRESETS.WORKSHOP_CERTIFICATES

  return uploadToCloudinary(file, {
    folder: preset.folder,
    resourceType: 'image',
    transformation: preset.transformation,
    publicId: `${workshopId}_cert_${certificateName.replace(/\s+/g, '_')}_${Date.now()}`,
    tags: [workshopId, 'workshop-certificate', certificateName],
  })
}

export default cloudinary