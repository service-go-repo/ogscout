import { NextRequest, NextResponse } from 'next/server'
import { fetchWorkshopImages } from '@/lib/cloudinary'

// GET /api/workshops/[id]/images - Fetch workshop images from Cloudinary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'gallery' | 'certificates' | 'all' || 'all'

    const images = await fetchWorkshopImages(resolvedParams.id, type)

    return NextResponse.json({
      success: true,
      data: {
        images,
        total: images.length,
      },
    })
  } catch (error) {
    console.error('Error fetching workshop images:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workshop images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
