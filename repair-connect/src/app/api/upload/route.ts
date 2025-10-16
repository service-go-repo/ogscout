import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'
import { saveImageLocally, deleteLocalImages } from '@/lib/imageStorageServer'

// POST /api/upload - Upload files to Cloudinary
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

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const uploadType = formData.get('type') as 'photo' | 'video' | null
    const folder = formData.get('folder') as string | null
    const carId = formData.get('carId') as string | null // For local storage organization

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!uploadType || !['photo', 'video'].includes(uploadType)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "photo" or "video"' },
        { status: 400 }
      )
    }

    // Upload files to Cloudinary and save locally
    const uploadPromises = files.map(async (file) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const publicId = `${Date.now()}-${file.name.split('.')[0]}`
        
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          {
            folder: folder || `repair-connect/${session.user.id}`,
            publicId,
            resourceType: uploadType === 'photo' ? 'image' : 'video',
          }
        )

        // Save locally as backup (only for images)
        let localPath = ''
        if (uploadType === 'photo' && carId) {
          try {
            localPath = await saveImageLocally({
              carId,
              filename: publicId,
              buffer,
              mimeType: file.type
            })
            console.log(`Image saved locally: ${localPath}`)
          } catch (localError) {
            console.warn(`Failed to save image locally: ${localError}`)
            // Don't fail the upload if local save fails
          }
        }

        return {
          success: true,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            localPath,
            ...cloudinaryResult,
          },
        }
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)
        return {
          success: false,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
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
    console.error('Upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - Delete files from Cloudinary
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

    const { searchParams } = new URL(request.url)
    const publicIds = searchParams.get('publicIds')?.split(',') || []
    const resourceType = searchParams.get('resourceType') as 'image' | 'video' | null
    const carId = searchParams.get('carId') as string | null

    if (!publicIds || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'No public IDs provided' },
        { status: 400 }
      )
    }

    if (!resourceType || !['image', 'video'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type. Must be "image" or "video"' },
        { status: 400 }
      )
    }

    // Delete files from Cloudinary and local storage
    const deletePromises = publicIds.map(async (publicId) => {
      try {
        // Delete from Cloudinary
        const cloudinaryResult = await deleteFromCloudinary(publicId, resourceType)
        
        // Also try to delete from local storage if carId is provided
        if (carId && resourceType === 'image') {
          try {
            await deleteLocalImages(carId)
            console.log(`Local images cleaned up for car: ${carId}`)
          } catch (localError) {
            console.warn(`Failed to cleanup local images: ${localError}`)
            // Don't fail the delete if local cleanup fails
          }
        }
        
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
    console.error('Delete API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}