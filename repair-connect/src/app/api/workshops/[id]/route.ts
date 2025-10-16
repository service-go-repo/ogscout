import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Workshop } from '@/models/Workshop'
import { ObjectId } from 'mongodb'

// GET /api/workshops/[id] - Get a specific workshop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workshop ID' },
        { status: 400 }
      )
    }

    // Try to find workshop by _id first
    let workshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id),
      isActive: true
    })

    // If not found, try finding by userId (since sometimes the user ID is passed)
    if (!workshop) {
      workshop = await db.collection('workshops').findOne({
        userId: new ObjectId(resolvedParams.id),
        isActive: true
      })
    }

    if (!workshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...workshop,
        _id: workshop._id.toString(),
        userId: workshop.userId.toString()
      }
    })

  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workshop' },
      { status: 500 }
    )
  }
}

// PUT /api/workshops/[id] - Update a workshop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workshop ID' },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Check if workshop exists and user has permission
    const existingWorkshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!existingWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }
    
    // Check ownership (workshop owner) or admin access
    if (existingWorkshop.userId.toString() !== session.user.id && (session.user.role as string) !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this workshop' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Prepare update data
    const updateData: Partial<Workshop> = {
      updatedAt: new Date()
    }
    
    // Update profile information
    if (body.profile) {
      updateData.profile = {
        ...existingWorkshop.profile,
        ...body.profile
      }
    }
    
    // Update contact information
    if (body.contact) {
      updateData.contact = {
        ...existingWorkshop.contact,
        ...body.contact
      }

      // Ensure location has correct format
      if (body.contact.location && updateData.contact) {
        updateData.contact.location = {
          type: 'Point',
          coordinates: body.contact.location.coordinates
        }
      }
    }
    
    // Update other fields
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }
    
    if (body.subscriptionTier) {
      updateData.subscriptionTier = body.subscriptionTier
    }
    
    // Only admins can update verification status
    if (body.isVerified !== undefined && (session.user.role as string) === 'admin') {
      updateData.isVerified = body.isVerified
    }
    
    // Update workshop
    const result = await db.collection('workshops').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }
    
    // Fetch updated workshop
    const updatedWorkshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedWorkshop,
        _id: updatedWorkshop._id.toString()
      }
    })
    
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update workshop' },
      { status: 500 }
    )
  }
}

// DELETE /api/workshops/[id] - Delete a workshop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workshop ID' },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Check if workshop exists and user has permission
    const existingWorkshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!existingWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }
    
    // Check ownership (workshop owner) or admin access
    if (existingWorkshop.userId.toString() !== session.user.id && (session.user.role as string) !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this workshop' },
        { status: 403 }
      )
    }
    
    // Soft delete by setting isActive to false
    const result = await db.collection('workshops').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workshop deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete workshop' },
      { status: 500 }
    )
  }
}
