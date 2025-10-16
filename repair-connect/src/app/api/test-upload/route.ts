import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called')
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    console.log('Files received:', files.length)
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    const file = files[0]
    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`)
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log(`Buffer created, size: ${buffer.length}`)
    
    // Test upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: 'repair-connect/test',
      publicId: `test-${Date.now()}`,
      resourceType: 'image',
      tags: ['test']
    })
    
    console.log('Upload successful:', result.public_id)
    
    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      data: result
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      details: error
    }, { status: 500 })
  }
}
