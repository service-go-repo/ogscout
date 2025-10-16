import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { ServiceRequest, ServiceRequestData, generateDamageId, generateServiceMediaId } from '@/models/ServiceRequest'

// GET /api/service-requests - Get service requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can view service requests' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const carId = searchParams.get('carId')

    const { db } = await connectToDatabase()
    
    // Build query
    const query: any = { customerId: session.user.id }
    if (status) {
      query.status = status
    }
    if (carId && ObjectId.isValid(carId)) {
      query.carId = carId
    }

    // Get service requests with pagination
    const skip = (page - 1) * limit
    const serviceRequests = await db
      .collection('servicerequests')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection('servicerequests').countDocuments(query)

    // Get car information for each service request
    const serviceRequestsWithCarInfo = await Promise.all(
      serviceRequests.map(async (request) => {
        const car = await db.collection('cars').findOne({
          _id: new ObjectId(request.carId),
          ownerId: session.user.id
        })
        
        return {
          ...request,
          _id: request._id.toString(),
          carInfo: car ? {
            make: car.make || car.basicInfo?.make,
            model: car.model || car.basicInfo?.model,
            year: car.year || car.basicInfo?.year,
            thumbnailUrl: car.thumbnailUrl
          } : null
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        serviceRequests: serviceRequestsWithCarInfo,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/service-requests - Create a new service request
export async function POST(request: NextRequest) {
  console.log('POST /api/service-requests - Starting request processing')
  try {
    console.log('Getting server session...')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can create service requests' },
        { status: 403 }
      )
    }

    console.log('Session verified, parsing form data...')
    const formData = await request.formData()
    console.log('Form data parsed successfully')
    
    // Extract basic form data
    const serviceRequestData = {
      carId: formData.get('carId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      requestedServices: JSON.parse(formData.get('requestedServices') as string || '[]'),
      priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
      preferredContactMethod: formData.get('preferredContactMethod') as 'phone' | 'email' | 'sms',
      additionalNotes: formData.get('additionalNotes') as string || undefined,
      maxDistance: formData.get('maxDistance') ? parseInt(formData.get('maxDistance') as string) : undefined
    }

    // Validate required fields
    if (!serviceRequestData.carId || !serviceRequestData.title || !serviceRequestData.description || 
        !serviceRequestData.requestedServices.length || !serviceRequestData.priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate ObjectId format for carId
    if (!ObjectId.isValid(serviceRequestData.carId)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Verify car exists and belongs to user
    const car = await db.collection('cars').findOne({
      _id: new ObjectId(serviceRequestData.carId),
      ownerId: session.user.id
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or access denied' },
        { status: 404 }
      )
    }

    // Parse service location
    const serviceLocation = JSON.parse(formData.get('serviceLocation') as string || '{}')

    // Parse damage assessments (optional)
    let damageAssessments = []
    const damageData = formData.get('damageAssessments')
    if (damageData) {
      damageAssessments = JSON.parse(damageData as string)
    }

    // Parse timeline (optional)
    let timeline
    const timelineData = formData.get('timeline')
    if (timelineData) {
      timeline = JSON.parse(timelineData as string)
    }

    // Handle file uploads (photos and videos)
    console.log('Processing file uploads...')
    const rawPhotos = formData.getAll('photos') as File[]
    const rawVideos = formData.getAll('videos') as File[]

    // Filter out invalid/empty files
    const photos = rawPhotos.filter(file => file && file.size > 0 && file.name !== '')
    const videos = rawVideos.filter(file => file && file.size > 0 && file.name !== '')

    console.log(`Found ${photos.length} valid photos and ${videos.length} valid videos (from ${rawPhotos.length} photo entries and ${rawVideos.length} video entries)`)

    // Import hybrid file upload utility
    console.log('Importing hybrid file upload utility...')
    const { hybridUploadMultiple } = await import('@/lib/hybridFileUpload')
    console.log('Hybrid file upload utility imported')

    // Upload photos using hybrid system
    let photoMetadata: any[] = []
    if (photos.length > 0) {
      try {
        console.log('Uploading photos using hybrid system...')
        const photoUploads = await hybridUploadMultiple(photos, 'service-requests/photos')
        photoMetadata = photoUploads.map((upload, index) => ({
          id: generateServiceMediaId(),
          url: upload.url,
          publicId: upload.publicId,
          localPath: upload.localPath,
          filename: upload.filename,
          uploadMethod: upload.uploadMethod,
          type: 'photo' as const,
          category: 'reference' as const,
          caption: photos[index].name,
          uploadedAt: new Date(),
          fileSize: upload.fileSize,
          dimensions: { width: upload.width || 0, height: upload.height || 0 }
        }))
        console.log('Photos uploaded successfully using:', photoUploads.map(u => u.uploadMethod))
      } catch (error) {
        console.error('Photo upload failed:', error)
        return NextResponse.json(
          { error: 'Failed to upload photos', message: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    // Upload videos using hybrid system
    let videoMetadata: any[] = []
    if (videos.length > 0) {
      try {
        console.log('Uploading videos using hybrid system...')
        const videoUploads = await hybridUploadMultiple(videos, 'service-requests/videos')
        videoMetadata = videoUploads.map((upload, index) => ({
          id: generateServiceMediaId(),
          url: upload.url,
          publicId: upload.publicId,
          localPath: upload.localPath,
          filename: upload.filename,
          uploadMethod: upload.uploadMethod,
          type: 'video' as const,
          category: 'reference' as const,
          caption: videos[index].name,
          uploadedAt: new Date(),
          fileSize: upload.fileSize,
          dimensions: { width: upload.width || 0, height: upload.height || 0 }
        }))
        console.log('Videos uploaded successfully using:', videoUploads.map(u => u.uploadMethod))
      } catch (error) {
        console.error('Video upload failed:', error)
        return NextResponse.json(
          { error: 'Failed to upload videos', message: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    // Create service request
    console.log('Creating service request object...')
    const serviceRequest: ServiceRequest = {
      customerId: session.user.id,
      carId: serviceRequestData.carId,
      title: serviceRequestData.title,
      description: serviceRequestData.description,
      requestedServices: serviceRequestData.requestedServices,
      damageAssessments: damageAssessments,
      serviceLocation: serviceLocation,
      timeline: timeline,
      priority: serviceRequestData.priority,
      preferredContactMethod: serviceRequestData.preferredContactMethod,
      additionalNotes: serviceRequestData.additionalNotes,
      photos: photoMetadata,
      videos: videoMetadata,
      status: 'submitted',
      targetWorkshops: [],
      maxDistance: serviceRequestData.maxDistance,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      viewCount: 0,
      responseCount: 0
    }

    // Insert service request
    console.log('Inserting service request into database...')
    const result = await db.collection('servicerequests').insertOne(serviceRequest)
    console.log('Service request inserted with ID:', result.insertedId)

    // Update car's service request count
    await db.collection('cars').updateOne(
      { _id: new ObjectId(serviceRequestData.carId) },
      { 
        $inc: { totalServiceRequests: 1 },
        $set: { 
          lastServiceDate: new Date(),
          updatedAt: new Date() 
        }
      }
    )

    // Get the created service request with car info
    const createdRequest = await db.collection('servicerequests').findOne({ _id: result.insertedId })
    
    return NextResponse.json({
      success: true,
      message: 'Service request created successfully',
      data: {
        ...createdRequest,
        _id: result.insertedId.toString(),
        carInfo: {
          make: car.make || car.basicInfo?.make,
          model: car.model || car.basicInfo?.model,
          year: car.year || car.basicInfo?.year,
          thumbnailUrl: car.thumbnailUrl
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating service request:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}