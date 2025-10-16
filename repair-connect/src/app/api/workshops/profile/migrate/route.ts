import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

/**
 * Migration endpoint to populate workshop profile from registration data
 * This endpoint retrieves workshop data from the user registration and creates/updates
 * the workshop profile with the existing business information
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is a workshop
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { error: 'Only workshop users can access this endpoint' },
        { status: 403 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')
    const workshopsCollection = db.collection('workshops')

    // Get the workshop user data from registration
    const workshopUser = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
      role: 'workshop'
    })

    if (!workshopUser) {
      return NextResponse.json(
        { error: 'Workshop user not found' },
        { status: 404 }
      )
    }

    // Check if workshop profile already exists
    const existingWorkshop = await workshopsCollection.findOne({
      userId: new ObjectId(session.user.id)
    })

    if (existingWorkshop) {
      return NextResponse.json(
        { 
          message: 'Workshop profile already exists',
          workshop: existingWorkshop,
          migrated: false
        },
        { status: 200 }
      )
    }

    // Map registration data to workshop profile structure
    const businessInfo = workshopUser.businessInfo
    const ownerInfo = workshopUser.ownerInfo

    // Convert business hours from registration format to profile format
    const operatingHours = Object.entries(businessInfo.businessHours).map(([day, hours]: [string, any]) => ({
      day: day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
      openTime: hours.closed ? null : hours.open,
      closeTime: hours.closed ? null : hours.close,
      isClosed: hours.closed
    }))

    // Map services offered to service types
    const serviceTypeMapping: Record<string, string> = {
      'Engine Repair': 'engine',
      'Brake Service': 'brakes',
      'Oil Change': 'maintenance',
      'Tire Service': 'tires',
      'Body Work': 'bodywork',
      'Paint Service': 'paint',
      'Electrical Repair': 'electrical',
      'AC/Heating': 'other',
      'Transmission': 'transmission',
      'Suspension': 'other',
      'Exhaust System': 'other',
      'Diagnostic': 'inspection'
    }

    const serviceTypes = businessInfo.servicesOffered
      .map((service: string) => serviceTypeMapping[service] || 'other')
      .filter((service: string, index: number, array: string[]) => array.indexOf(service) === index) // Remove duplicates

    // Create workshop profile from registration data
    const workshopProfile = {
      userId: new ObjectId(session.user.id),
      profile: {
        businessName: businessInfo.businessName,
        description: `Professional ${businessInfo.businessType.replace('_', ' ')} service center offering quality automotive repairs and maintenance.`,
        yearEstablished: new Date().getFullYear() - 5, // Default to 5 years ago
        employeeCount: 5, // Default value
        logo: null,
        coverImage: null,
        specializations: {
          serviceTypes: serviceTypes,
          carBrands: ['other'] // Default, can be updated later
        },
        operatingHours: operatingHours,
        features: []
      },
      contact: {
        phone: businessInfo.businessPhone,
        email: workshopUser.email,
        website: null,
        address: `${businessInfo.businessAddress.street}, ${businessInfo.businessAddress.city}, ${businessInfo.businessAddress.state} ${businessInfo.businessAddress.zipCode}`,
        location: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates, should be updated with actual location
        }
      },
      owner: {
        firstName: ownerInfo.firstName,
        lastName: ownerInfo.lastName,
        phone: ownerInfo.phone,
        email: workshopUser.email
      },
      verification: {
        isVerified: false,
        businessLicense: {
          number: businessInfo.businessLicense,
          verified: false,
          verifiedAt: null
        },
        insurance: {
          provider: businessInfo.insuranceInfo,
          verified: false,
          verifiedAt: null
        }
      },
      subscription: {
        tier: 'basic',
        startDate: new Date(),
        endDate: null,
        features: ['basic_listing', 'customer_messaging']
      },
      stats: {
        totalJobs: 0,
        completedJobs: 0,
        averageRating: 0,
        totalReviews: 0,
        responseTime: 24
      },
      portfolio: [],
      certifications: [],
      gallery: [],
      reviews: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Create geospatial index if it doesn't exist
    try {
      await workshopsCollection.createIndex({ 'contact.location': '2dsphere' })
    } catch (error) {
      console.log('Geospatial index already exists or creation failed:', error)
    }

    // Insert the workshop profile
    const result = await workshopsCollection.insertOne(workshopProfile)

    if (!result.insertedId) {
      throw new Error('Failed to create workshop profile')
    }

    // Fetch the created workshop profile
    const createdWorkshop = await workshopsCollection.findOne({
      _id: result.insertedId
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Workshop profile created successfully from registration data',
        workshop: createdWorkshop,
        migrated: true,
        migratedData: {
          businessName: businessInfo.businessName,
          businessType: businessInfo.businessType,
          address: businessInfo.businessAddress,
          phone: businessInfo.businessPhone,
          servicesOffered: businessInfo.servicesOffered,
          businessHours: businessInfo.businessHours,
          ownerInfo: ownerInfo
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Workshop profile migration error:', error)
    return NextResponse.json(
      { error: 'Internal server error during migration' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check migration status and preview what would be migrated
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is a workshop
    if (session.user.role !== 'workshop') {
      return NextResponse.json(
        { error: 'Only workshop users can access this endpoint' },
        { status: 403 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')
    const workshopsCollection = db.collection('workshops')

    // Get the workshop user data from registration
    const workshopUser = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
      role: 'workshop'
    })

    if (!workshopUser) {
      return NextResponse.json(
        { error: 'Workshop user not found' },
        { status: 404 }
      )
    }

    // Check if workshop profile already exists
    const existingWorkshop = await workshopsCollection.findOne({
      userId: new ObjectId(session.user.id)
    })

    const businessInfo = workshopUser.businessInfo
    const ownerInfo = workshopUser.ownerInfo

    return NextResponse.json(
      {
        success: true,
        hasExistingProfile: !!existingWorkshop,
        canMigrate: !existingWorkshop,
        registrationData: {
          businessName: businessInfo?.businessName,
          businessType: businessInfo?.businessType,
          businessPhone: businessInfo?.businessPhone,
          businessAddress: businessInfo?.businessAddress,
          servicesOffered: businessInfo?.servicesOffered,
          businessHours: businessInfo?.businessHours,
          businessLicense: businessInfo?.businessLicense,
          insuranceInfo: businessInfo?.insuranceInfo,
          ownerInfo: ownerInfo
        },
        existingProfile: existingWorkshop ? {
          id: existingWorkshop._id,
          businessName: existingWorkshop.profile?.businessName,
          createdAt: existingWorkshop.createdAt
        } : null
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Workshop migration check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
