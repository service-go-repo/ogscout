import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Workshop } from '@/models/Workshop'
import { ObjectId } from 'mongodb'

// GET /api/workshops/profile - Get current user's workshop profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Only workshop accounts can access this endpoint' },
        { status: 403 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    const workshop = await db.collection('workshops').findOne({
      userId: new ObjectId(session.user.id),
      isActive: true
    })
    
    if (!workshop) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No workshop profile found. Please create one.'
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...workshop,
        _id: workshop._id.toString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching workshop profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workshop profile' },
      { status: 500 }
    )
  }
}

// POST /api/workshops/profile - Create new workshop profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Only workshop accounts can create workshop profiles' },
        { status: 403 }
      )
    }
    
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    // Check if workshop already exists for this user
    const existingWorkshop = await db.collection('workshops').findOne({
      userId: new ObjectId(session.user.id)
    })
    
    if (existingWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop profile already exists for this user' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const requiredFields = ['profile', 'contact']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Validate contact location coordinates
    if (!body.contact.location?.coordinates || body.contact.location.coordinates.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Valid location coordinates are required' },
        { status: 400 }
      )
    }
    
    // Create workshop document
    const workshop: Omit<Workshop, '_id'> = {
      userId: new ObjectId(session.user.id),
      profile: {
        businessName: body.profile.businessName,
        description: body.profile.description || '',
        yearEstablished: body.profile.yearEstablished,
        employeeCount: body.profile.employeeCount,
        logo: body.profile.logo,
        coverImage: body.profile.coverImage,
        gallery: body.profile.gallery || [],
        specializations: {
          serviceTypes: body.profile.specializations?.serviceTypes || [],
          carBrands: body.profile.specializations?.carBrands || []
        },
        certifications: body.profile.certifications || [],
        operatingHours: body.profile.operatingHours,
        portfolio: body.profile.portfolio || [],
        features: body.profile.features || []
      },
      contact: {
        phone: body.contact.phone,
        email: body.contact.email,
        website: body.contact.website,
        address: body.contact.address,
        location: {
          type: 'Point',
          coordinates: body.contact.location.coordinates
        }
      },
      stats: {
        totalReviews: 0,
        averageRating: 0,
        completedJobs: 0,
        responseTime: 24,
        repeatCustomers: 0
      },
      reviews: [],
      isVerified: false,
      isActive: true,
      subscriptionTier: 'basic',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Create geospatial index if it doesn't exist
    await db.collection('workshops').createIndex({ 'contact.location': '2dsphere' })
    
    // Insert workshop
    const result = await db.collection('workshops').insertOne(workshop)
    
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId.toString(),
        ...workshop
      }
    })
    
  } catch (error) {
    console.error('Error creating workshop profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workshop profile' },
      { status: 500 }
    )
  }
}

// PUT /api/workshops/profile - Update current user's workshop profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Only workshop accounts can update workshop profiles' },
        { status: 403 }
      )
    }
    
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    // Find existing workshop
    const existingWorkshop = await db.collection('workshops').findOne({
      userId: new ObjectId(session.user.id),
      isActive: true
    })
    
    if (!existingWorkshop) {
      return NextResponse.json(
        { success: false, error: 'Workshop profile not found' },
        { status: 404 }
      )
    }
    
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

      // Ensure location has correct format if provided
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
    
    // Update workshop
    const result = await db.collection('workshops').updateOne(
      { userId: new ObjectId(session.user.id), isActive: true },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Workshop profile not found' },
        { status: 404 }
      )
    }
    
    // Fetch updated workshop
    const updatedWorkshop = await db.collection('workshops').findOne({
      userId: new ObjectId(session.user.id),
      isActive: true
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
    console.error('Error updating workshop profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update workshop profile' },
      { status: 500 }
    )
  }
}
