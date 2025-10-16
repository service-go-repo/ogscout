import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Workshop, WorkshopSearchFilters, WorkshopSearchResult } from '@/models/Workshop'
import { ObjectId } from 'mongodb'

// GET /api/workshops - Get all workshops with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const filters: WorkshopSearchFilters = {}
    
    // Location-based search
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    
    if (lat && lng) {
      filters.location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
        radius: radius ? parseFloat(radius) : 50 // Default 50km radius
      }
    }
    
    // Service type filters
    const serviceTypes = searchParams.get('serviceTypes')
    if (serviceTypes) {
      filters.serviceTypes = serviceTypes.split(',') as any[]
    }
    
    // Car brand filters
    const carBrands = searchParams.get('carBrands')
    const carBrand = searchParams.get('carBrand')
    if (carBrands) {
      filters.carBrands = carBrands.split(',') as any[]
    } else if (carBrand) {
      filters.carBrands = [carBrand] as any[]
    }
    
    // Rating filter
    const minRating = searchParams.get('minRating')
    if (minRating) {
      filters.minRating = parseFloat(minRating)
    }
    
    // Verification filter
    const isVerified = searchParams.get('isVerified')
    if (isVerified) {
      filters.isVerified = isVerified === 'true'
    }
    
    // Features filter
    const features = searchParams.get('features')
    if (features) {
      filters.features = features.split(',')
    }
    
    // Sort options
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build MongoDB query
    const query: Record<string, any> = {
      isActive: true
    }
    
    // Add filters to query
    if (filters.serviceTypes?.length) {
      query['profile.specializations.serviceTypes'] = { $in: filters.serviceTypes }
    }
    
    if (filters.carBrands?.length) {
      query['profile.specializations.carBrands'] = { $in: filters.carBrands }
    }
    
    if (filters.minRating) {
      query['stats.averageRating'] = { $gte: filters.minRating }
    }
    
    if (filters.isVerified !== undefined) {
      query.isVerified = filters.isVerified
    }
    
    if (filters.features?.length) {
      query['profile.features'] = { $in: filters.features }
    }
    
    // Geospatial query for location-based search
    let aggregationPipeline: any[] = []
    
    if (filters.location) {
      aggregationPipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: filters.location.coordinates
          },
          distanceField: 'distance',
          maxDistance: filters.location.radius * 1000, // Convert km to meters
          spherical: true,
          query: query
        }
      })
    } else {
      aggregationPipeline.push({ $match: query })
    }
    
    // Add sorting
    const sortOptions: Record<string, 1 | -1> = {}
    if (sortBy === 'distance' && filters.location) {
      sortOptions.distance = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'rating') {
      sortOptions['stats.averageRating'] = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'reviews') {
      sortOptions['stats.totalReviews'] = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'name') {
      sortOptions['profile.businessName'] = sortOrder === 'asc' ? 1 : -1
    }
    
    aggregationPipeline.push({ $sort: sortOptions })
    
    // Limit results
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')
    
    aggregationPipeline.push({ $skip: skip })
    aggregationPipeline.push({ $limit: limit })
    
    // Execute aggregation
    const workshops = await db.collection('workshops').aggregate(aggregationPipeline).toArray()

    // Fetch and calculate review stats from appointments for each workshop
    const workshopUserIds = workshops.map(w => w.userId)
    const reviewStats = await db.collection('appointments').aggregate([
      {
        $match: {
          workshopId: { $in: workshopUserIds },
          status: 'completed',
          customerRating: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$workshopId',
          averageRating: { $avg: '$customerRating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]).toArray()

    // Create a map of workshop stats keyed by userId
    const statsMap = new Map()
    reviewStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        totalReviews: stat.totalReviews
      })
    })

    // Format results with calculated stats
    const results: WorkshopSearchResult[] = workshops.map((workshop, index) => {
      const userId = workshop.userId?.toString()
      const calculatedStats = userId ? statsMap.get(userId) : null

      return {
        workshop: {
          ...workshop,
          _id: workshop._id.toString(),
          stats: calculatedStats || workshop.stats || {
            averageRating: 0,
            totalReviews: 0,
            completedJobs: 0,
            responseTime: 24,
            repeatCustomers: 0
          }
        } as Workshop,
        distance: workshop.distance ? Math.round(workshop.distance / 1000 * 10) / 10 : undefined // Convert to km
      }
    })

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      filters: filters
    })
    
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workshops' },
      { status: 500 }
    )
  }
}

// POST /api/workshops - Create a new workshop
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Only workshop users can create workshops
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
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}
