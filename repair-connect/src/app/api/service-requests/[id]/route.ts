import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ServiceRequest } from '@/models/ServiceRequest'
import { CarProfile } from '@/models/CarProfile'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can view service requests' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service request ID' },
        { status: 400 }
      )
    }

    // Fetch the service request
    const serviceRequest = await db.collection<ServiceRequest>('servicerequests').findOne({
      _id: new ObjectId(resolvedParams.id),
      customerId: session.user.id // Ensure user can only see their own requests
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      )
    }

    // Fetch the associated car (with ownership validation)
    const car = await db.collection<CarProfile>('cars').findOne({
      _id: new ObjectId(serviceRequest.carId),
      ownerId: session.user.id // Ensure user can only see their own cars
    })

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Associated car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceRequest,
        car
      }
    })
  } catch (error) {
    console.error('Error fetching service request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can update service requests' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service request ID' },
        { status: 400 }
      )
    }

    const updateData = await request.json()
    
    // Update the service request
    const result = await db.collection<ServiceRequest>('servicerequests').updateOne(
      {
        _id: new ObjectId(resolvedParams.id),
        customerId: session.user.id // Ensure user can only update their own requests
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      )
    }

    // Fetch the updated service request
    const updatedServiceRequest = await db.collection<ServiceRequest>('servicerequests').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    return NextResponse.json({
      success: true,
      data: updatedServiceRequest
    })
  } catch (error) {
    console.error('Error updating service request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Only customers can delete service requests' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Validate ObjectId format
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service request ID' },
        { status: 400 }
      )
    }

    // Delete the service request
    const result = await db.collection<ServiceRequest>('servicerequests').deleteOne({
      _id: new ObjectId(resolvedParams.id),
      customerId: session.user.id // Ensure user can only delete their own requests
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Service request deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting service request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}