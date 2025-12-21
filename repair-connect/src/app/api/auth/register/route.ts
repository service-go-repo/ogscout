import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { 
  CustomerRegistrationSchema, 
  WorkshopRegistrationSchema,
  type CustomerRegistrationData,
  type WorkshopRegistrationData 
} from '@/lib/validations'
import { 
  CustomerUser, 
  WorkshopUser,
  defaultCustomerPreferences,
  defaultWorkshopRatings,
  defaultWorkshopSubscription,
  defaultVerificationStatus
} from '../../../../../models/User'
import { ObjectId } from 'mongodb'

// Helper function to create workshop profile automatically
async function createWorkshopProfile(
  db: any,
  userId: ObjectId,
  registrationData: WorkshopRegistrationData,
  userData: WorkshopUser
) {
  const workshopsCollection = db.collection('workshops')

  // Runtime validation - ensure critical fields are not null/undefined
  if (!registrationData.email || !registrationData.businessPhone) {
    throw new Error('Email and business phone are required for workshop registration')
  }

  // Create basic workshop profile from registration data
  const workshopProfile = {
    userId: userId,
    profile: {
      businessName: registrationData.businessName,
      description: `Welcome to ${registrationData.businessName}! We provide quality automotive services.`,
      yearEstablished: new Date().getFullYear(),
      employeeCount: 1,
      logo: null,
      coverImage: null,
      specializations: {
        serviceTypes: ['other'], // Default, to be updated in profile
        carBrands: ['other'] // Default, to be updated in profile
      },
      operatingHours: [
        { day: 'monday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'tuesday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'wednesday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'thursday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'friday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'saturday', openTime: '09:00', closeTime: '15:00', isClosed: false },
        { day: 'sunday', openTime: null, closeTime: null, isClosed: true }
      ],
      features: []
    },
    contact: {
      phone: registrationData.businessPhone,
      email: registrationData.email,
      website: null,
      address: {
        street: registrationData.businessAddress.street,
        city: registrationData.businessAddress.city,
        state: registrationData.businessAddress.state,
        zipCode: registrationData.businessAddress.zipCode,
        country: 'UAE'
      },
      location: {
        type: 'Point',
        coordinates: [55.3781, 25.1772] // Default to Ras Al Khor Industrial Area 2, Dubai, UAE
      }
    },
    owner: {
      firstName: registrationData.ownerFirstName,
      lastName: registrationData.ownerLastName,
      phone: registrationData.businessPhone, // Use business phone as default
      email: registrationData.email
    },
    verification: {
      isVerified: false,
      businessLicense: {
        number: null,
        verified: false,
        verifiedAt: null
      },
      insurance: {
        provider: null,
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
  await workshopsCollection.insertOne(workshopProfile)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role } = body

    if (!role || !['customer', 'workshop'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid or missing role' },
        { status: 400 }
      )
    }

    // Validate based on role
    let validatedData: CustomerRegistrationData | WorkshopRegistrationData
    
    if (role === 'customer') {
      const validation = CustomerRegistrationSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        )
      }
      validatedData = validation.data
    } else {
      const validation = WorkshopRegistrationSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        )
      }
      validatedData = validation.data
    }

    // Connect to database
    const db = await getDb()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: validatedData.email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user object based on role
    const now = new Date()
    let newUser: Omit<CustomerUser | WorkshopUser, '_id'>

    if (role === 'customer') {
      const customerData = validatedData as CustomerRegistrationData
      newUser = {
        email: customerData.email.toLowerCase(),
        password: hashedPassword,
        role: 'customer',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        profile: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
        },
        preferences: defaultCustomerPreferences,
        vehicles: [],
      } as CustomerUser
    } else {
      const workshopData = validatedData as WorkshopRegistrationData
      newUser = {
        email: workshopData.email.toLowerCase(),
        password: hashedPassword,
        role: 'workshop',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        businessInfo: {
          businessName: workshopData.businessName,
          businessPhone: workshopData.businessPhone,
          businessAddress: workshopData.businessAddress,
        },
        ownerInfo: {
          firstName: workshopData.ownerFirstName,
          lastName: workshopData.ownerLastName,
        },
        verification: defaultVerificationStatus,
        ratings: defaultWorkshopRatings,
        subscription: defaultWorkshopSubscription,
      } as WorkshopUser
    }

    // Insert user into database
    const result = await usersCollection.insertOne(newUser)

    if (!result.insertedId) {
      throw new Error('Failed to create user')
    }

    // If workshop user, automatically create workshop profile
    if (role === 'workshop') {
      await createWorkshopProfile(db, result.insertedId, validatedData as WorkshopRegistrationData, newUser as WorkshopUser)
    }

    // Return success response (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser
    // Password is excluded from response for security
    
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: result.insertedId.toString(),
          ...userWithoutPassword,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
