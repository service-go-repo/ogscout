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
    console.log('=== Workshop Update API Called ===')
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    console.log('Workshop ID:', resolvedParams.id)
    console.log('Session user:', session?.user?.id, 'Role:', session?.user?.role)

    if (!session?.user) {
      console.error('Authentication failed: No session')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(resolvedParams.id)) {
      console.error('Invalid workshop ID format:', resolvedParams.id)
      return NextResponse.json(
        { success: false, error: 'Invalid workshop ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    console.log('Database connected successfully')

    // Check if workshop exists and user has permission
    const existingWorkshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!existingWorkshop) {
      console.error('Workshop not found with ID:', resolvedParams.id)
      return NextResponse.json(
        { success: false, error: 'Workshop not found' },
        { status: 404 }
      )
    }

    console.log('Found workshop:', existingWorkshop._id.toString())
    console.log('Workshop userId:', existingWorkshop.userId.toString())

    // Check ownership (workshop owner) or admin access
    if (existingWorkshop.userId.toString() !== session.user.id && (session.user.role as string) !== 'admin') {
      console.error('Authorization failed:', {
        workshopUserId: existingWorkshop.userId.toString(),
        sessionUserId: session.user.id,
        userRole: session.user.role
      })
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this workshop' },
        { status: 403 }
      )
    }

    console.log('Authorization successful')

    const body = await request.json()
    console.log('Request body keys:', Object.keys(body))
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Prepare update data
    const updateData: Partial<Workshop> = {
      updatedAt: new Date()
    }

    // Update profile information
    if (body.profile) {
      console.log('Updating profile with keys:', Object.keys(body.profile))
      updateData.profile = {
        ...existingWorkshop.profile,
        ...body.profile
      } as any
      console.log('Profile update data:', JSON.stringify(updateData.profile, null, 2))
    }

    // Update contact information
    if (body.contact) {
      console.log('Updating contact with keys:', Object.keys(body.contact))
      updateData.contact = {
        ...existingWorkshop.contact,
        ...body.contact
      } as any

      // Ensure location has correct format
      if (body.contact.location && updateData.contact) {
        updateData.contact.location = {
          type: 'Point',
          coordinates: body.contact.location.coordinates
        }
        console.log('Updated location format:', updateData.contact.location)
      }
    }

    // Update other fields
    if (body.isActive !== undefined) {
      console.log('Updating isActive:', body.isActive)
      updateData.isActive = body.isActive
    }

    if (body.subscriptionTier) {
      console.log('Updating subscriptionTier:', body.subscriptionTier)
      updateData.subscriptionTier = body.subscriptionTier
    }

    // Only admins can update verification status
    if (body.isVerified !== undefined && (session.user.role as string) === 'admin') {
      console.log('Updating isVerified (admin only):', body.isVerified)
      updateData.isVerified = body.isVerified
    }

    console.log('Performing database update...')
    console.log('Update data keys:', Object.keys(updateData))

    // Update workshop
    const result = await db.collection('workshops').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    )

    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged
    })

    if (result.matchedCount === 0) {
      console.error('Update matched 0 documents')
      return NextResponse.json(
        { success: false, error: 'Workshop not found during update' },
        { status: 404 }
      )
    }

    console.log('Fetching updated workshop...')

    // Fetch updated workshop
    const updatedWorkshop = await db.collection('workshops').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedWorkshop) {
      console.error('Workshop not found after update')
      return NextResponse.json(
        { success: false, error: 'Workshop not found after update' },
        { status: 404 }
      )
    }

    console.log('Workshop updated successfully')
    console.log('=== Workshop Update Complete ===')

    return NextResponse.json({
      success: true,
      data: {
        ...updatedWorkshop,
        _id: updatedWorkshop._id.toString(),
        userId: updatedWorkshop.userId.toString()
      }
    })

  } catch (error) {
    console.error('=== ERROR updating workshop ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Full error object:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workshop',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
