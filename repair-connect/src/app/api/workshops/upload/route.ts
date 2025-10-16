import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

// POST /api/workshops/upload - Upload workshop-related files
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is a workshop
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { error: 'Only workshop accounts can upload workshop files' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const uploadType = formData.get('type') as 'portfolio' | 'gallery' | 'certification' | 'logo' | 'cover' | null
    const category = formData.get('category') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!uploadType || !['portfolio', 'gallery', 'certification', 'logo', 'cover'].includes(uploadType)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "portfolio", "gallery", "certification", "logo", or "cover"' },
        { status: 400 }
      )
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: `Invalid file types. Only JPEG, PNG, and WebP images are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}` },
        { status: 400 }
      )
    }

    // File size limits (in bytes)
    const maxSizes = {
      logo: 2 * 1024 * 1024, // 2MB for logos
      cover: 5 * 1024 * 1024, // 5MB for cover images
      portfolio: 10 * 1024 * 1024, // 10MB for portfolio images
      gallery: 10 * 1024 * 1024, // 10MB for gallery images
      certification: 5 * 1024 * 1024 // 5MB for certification images
    }

    const maxSize = maxSizes[uploadType]
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { error: `Files too large. Maximum size for ${uploadType}: ${Math.round(maxSize / (1024 * 1024))}MB. Oversized files: ${oversizedFiles.map(f => f.name).join(', ')}` },
        { status: 400 }
      )
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Convert file to buffer
        console.log(`Converting file to buffer: ${file.name}`)
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log(`Buffer created successfully, size: ${buffer.length} bytes`)
        const timestamp = Date.now()
        const publicId = `${uploadType}-${timestamp}-${index}`
        
        // Define transformation based on upload type
        const transformations = {
          logo: [
            { width: 200, height: 200, crop: 'fit', quality: 'auto' },
            { format: 'webp' }
          ],
          cover: [
            { width: 1200, height: 400, crop: 'fill', quality: 'auto' },
            { format: 'webp' }
          ],
          portfolio: [
            { width: 800, height: 600, crop: 'fit', quality: 'auto' },
            { format: 'webp' }
          ],
          gallery: [
            { width: 800, height: 600, crop: 'fit', quality: 'auto' },
            { format: 'webp' }
          ],
          certification: [
            { width: 600, height: 800, crop: 'fit', quality: 'auto' },
            { format: 'webp' }
          ]
        }

        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`)
        console.log(`Buffer size: ${buffer.length}, upload type: ${uploadType}`)
        
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          {
            folder: `repair-connect/workshops/${session.user.id}/${uploadType}`,
            publicId,
            resourceType: 'image',
            transformation: transformations[uploadType],
            tags: [uploadType, session.user.id, category].filter(Boolean) as string[]
          }
        )
        
        console.log(`Upload successful for ${file.name}:`, cloudinaryResult.public_id)

        return {
          success: true,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadType,
            category,
            ...cloudinaryResult,
          },
        }
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)
        if (error instanceof Error) {
          console.error('Error details:', error.stack)
        }
        return {
          success: false,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadType,
            category,
          },
          error: error instanceof Error ? error.message : 'Upload failed',
        }
      }
    })

    const results = await Promise.all(uploadPromises)

    // Separate successful and failed uploads
    const successful = results.filter((result) => result.success)
    const failed = results.filter((result) => !result.success)

    return NextResponse.json({
      success: true,
      message: `${successful.length} files uploaded successfully`,
      data: {
        uploaded: successful,
        failed: failed,
        total: files.length,
      },
    })
  } catch (error) {
    console.error('Workshop upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/workshops/upload - Delete workshop files from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is a workshop
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { error: 'Only workshop accounts can delete workshop files' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const publicIds = searchParams.get('publicIds')?.split(',') || []

    if (!publicIds || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'No public IDs provided' },
        { status: 400 }
      )
    }

    // Delete files from Cloudinary
    const deletePromises = publicIds.map(async (publicId) => {
      try {
        const cloudinaryResult = await deleteFromCloudinary(publicId, 'image')
        
        return {
          success: true,
          publicId,
          result: cloudinaryResult,
        }
      } catch (error) {
        console.error(`Delete failed for ${publicId}:`, error)
        return {
          success: false,
          publicId,
          error: error instanceof Error ? error.message : 'Delete failed',
        }
      }
    })

    const results = await Promise.all(deletePromises)

    // Separate successful and failed deletions
    const successful = results.filter((result) => result.success)
    const failed = results.filter((result) => !result.success)

    return NextResponse.json({
      success: true,
      message: `${successful.length} files deleted successfully`,
      data: {
        deleted: successful,
        failed: failed,
        total: publicIds.length,
      },
    })
  } catch (error) {
    console.error('Workshop delete API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
