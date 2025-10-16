import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ServiceRequestSummary } from '@/models/ServiceRequest'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // First, verify the car belongs to the user
    const carsCollection = db.collection('cars')
    const car = await carsCollection.findOne({
      _id: new ObjectId(resolvedParams.id),
      ownerId: session.user.id
    })

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // Build query
    const query: any = { carId: resolvedParams.id }
    if (status) {
      query.status = status
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

    // Convert to ServiceRequestSummary format
    const serviceRequestSummaries: ServiceRequestSummary[] = serviceRequests.map(request => ({
      _id: request._id.toString(),
      title: request.title,
      description: request.description,
      carId: request.carId,
      customerId: request.customerId,
      carInfo: {
        make: car.make || car.basicInfo?.make,
        model: car.model || car.basicInfo?.model,
        year: car.year || car.basicInfo?.year,
        thumbnailUrl: car.thumbnailUrl
      },
      status: request.status,
      priority: request.priority,
      requestedServices: request.requestedServices || [],
      estimatedCost: request.estimatedCost,
      responseCount: request.responseCount || 0,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      expiresAt: request.expiresAt
    }))

    // Update car's service request count if it differs
    if (car.totalServiceRequests !== total) {
      await db.collection('cars').updateOne(
        { _id: new ObjectId(resolvedParams.id) },
        { 
          $set: { 
            totalServiceRequests: total,
            updatedAt: new Date()
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceRequests: serviceRequestSummaries,
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Note: Service requests are created through /api/service-requests endpoint
// This endpoint only retrieves service requests for a specific car
