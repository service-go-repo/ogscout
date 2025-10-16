import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (!imagePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 })
    }
    
    // Check if file exists
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    console.log('🔍 Checking image path:', fullPath)
    
    try {
      const stats = await fs.stat(fullPath)
      return NextResponse.json({
        exists: true,
        size: stats.size,
        path: fullPath,
        isFile: stats.isFile()
      })
    } catch (error) {
      return NextResponse.json({
        exists: false,
        path: fullPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } catch (error) {
    console.error('Test image API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
