import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// POST /api/upload-local - Upload files locally only (for development)
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

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.id)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Upload files locally
    const uploadPromises = files.map(async (file) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.name}`
        const filepath = join(uploadDir, filename)
        
        // Save file locally
        await writeFile(filepath, buffer)
        
        // Generate local URL
        const localUrl = `/uploads/${session.user.id}/${filename}`
        
        return {
          success: true,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            public_id: `local-${timestamp}`,
            secure_url: localUrl,
            url: localUrl,
            width: 800, // Default dimensions
            height: 600,
            bytes: file.size,
            format: file.name.split('.').pop() || 'jpg',
            resource_type: uploadType,
            created_at: new Date().toISOString(),
            folder: `local/${session.user.id}`,
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

    console.log(`📁 Local upload complete: ${successful.length} successful, ${failed.length} failed`)

    return NextResponse.json({
      success: true,
      message: `${successful.length} files uploaded successfully to local storage`,
      data: {
        uploaded: successful,
        failed: failed,
        total: files.length,
      },
    })
  } catch (error) {
    console.error('Local upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
