import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { CarProfile } from '@/models/CarProfile'

// GET /api/cars/[id] - Get a specific car
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    const resolvedParams = await params
    
    // Validate ObjectId
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    // Find the car and ensure it belongs to the current user
    const car = await db
      .collection('cars')
      .findOne({
        _id: new ObjectId(resolvedParams.id),
        ownerId: session.user.id
      })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: car
    })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/cars/[id] - Update a specific car
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    const resolvedParams = await params
    
    // Validate ObjectId
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    }

    // Update the car (only if it belongs to the current user)
    const result = await db
      .collection('cars')
      .updateOne(
        {
          _id: new ObjectId(resolvedParams.id),
          ownerId: session.user.id
        },
        { $set: updateData }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Fetch and return the updated car
    const updatedCar = await db
      .collection('cars')
      .findOne({
        _id: new ObjectId(resolvedParams.id),
        ownerId: session.user.id
      })

    return NextResponse.json({
      success: true,
      data: updatedCar
    })
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/cars/[id] - Delete a specific car
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    const resolvedParams = await params
    
    // Validate ObjectId
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    // Find the car first to get media URLs for cleanup
    const car = await db
      .collection('cars')
      .findOne({
        _id: new ObjectId(resolvedParams.id),
        ownerId: session.user.id
      })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // TODO: Implement media cleanup when Cloudinary is integrated
    // For now, just delete the car profile

    // Delete the car from database
    const result = await db
      .collection('cars')
      .deleteOne({
        _id: new ObjectId(resolvedParams.id),
        ownerId: session.user.id
      })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}