import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { WorkshopSearchFilters, WorkshopSearchResult, isWorkshopOpen } from '@/models/Workshop'

// POST /api/workshops/search - Advanced workshop search
export async function POST(request: NextRequest) {
  let filters: WorkshopSearchFilters = {}
  let searchQuery = ''
  let page = 1
  let limit = 20
  
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    filters = body.filters || {}
    searchQuery = body.query || ''
    page = body.page || 1
    limit = body.limit || 20
    const skip = (page - 1) * limit
    
    // Build MongoDB query
    const query: Record<string, any> = {
      isActive: true
    }
    
    // Text search query
    if (searchQuery) {
      query.$or = [
        { 'profile.businessName': { $regex: searchQuery, $options: 'i' } },
        { 'profile.description': { $regex: searchQuery, $options: 'i' } },
        { 'contact.address.emirate': { $regex: searchQuery, $options: 'i' } },
        { 'contact.address.city': { $regex: searchQuery, $options: 'i' } }
      ]
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
      query['profile.features'] = { $all: filters.features }
    }
    
    // Build aggregation pipeline
    let aggregationPipeline: any[] = []
    
    // Geospatial search
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
    
    // Add distance filter if specified
    if (filters.maxDistance && filters.location) {
      aggregationPipeline.push({
        $match: {
          distance: { $lte: filters.maxDistance * 1000 } // Convert km to meters
        }
      })
    }
    
    // Note: Open status will be calculated in application code after fetching
    
    // Filter by open status if requested
    if (filters.isOpen !== undefined) {
      // This would need to be implemented properly with current time logic
      // For now, we'll handle this in the application code after fetching
    }
    
    // Count total results before pagination
    const countPipeline = [...aggregationPipeline, { $count: 'total' }]
    const countResult = await db.collection('workshops').aggregate(countPipeline).toArray()
    const totalCount = countResult[0]?.total || 0
    
    // Add sorting
    const sortOptions: Record<string, 1 | -1> = {}
    const sortBy = filters.sortBy || 'rating'
    const sortOrder = filters.sortOrder || 'desc'
    
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
    
    // Add pagination
    aggregationPipeline.push({ $skip: skip })
    aggregationPipeline.push({ $limit: limit })
    
    // Execute search
    const workshops = await db.collection('workshops').aggregate(aggregationPipeline).toArray()

    // Fetch and calculate review stats from appointments for each workshop
    // Note: appointments store workshopId as userId (from users collection), not workshop._id
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

    // Format results and add runtime calculations
    const results: WorkshopSearchResult[] = workshops.map((workshop: any, index: number) => {
      try {
        const distance = workshop.distance ? Math.round(workshop.distance / 1000 * 10) / 10 : undefined
        const isOpen = workshop.profile?.operatingHours ? isWorkshopOpen(workshop.profile.operatingHours) : undefined

        // Get calculated stats from appointments using userId (not workshop._id)
        const workshopId = workshop._id?.toString() || `workshop-${index}`
        const userId = workshop.userId?.toString()
        const calculatedStats = userId ? statsMap.get(userId) : null

        return {
          workshop: {
            ...workshop,
            _id: workshopId,
            stats: calculatedStats || workshop.stats || {
              averageRating: 0,
              totalReviews: 0
            }
          },
          distance,
          isOpen: filters.isOpen !== undefined ? isOpen : undefined
        }
      } catch (mapError) {
        console.error(`Error processing workshop ${index}:`, mapError)
        console.error('Workshop data:', workshop)
        throw mapError
      }
    })
    
    // Filter by open status if requested (done in application code)
    let filteredResults = results
    if (filters.isOpen !== undefined) {
      filteredResults = results.filter(result => result.isOpen === filters.isOpen)
    }

    // Sort results after calculating fresh stats
    const finalSortBy = filters.sortBy || 'rating'
    const finalSortOrder = filters.sortOrder || 'desc'

    filteredResults.sort((a, b) => {
      let compareValue = 0

      if (finalSortBy === 'rating') {
        compareValue = (a.workshop.stats?.averageRating || 0) - (b.workshop.stats?.averageRating || 0)
      } else if (finalSortBy === 'distance' && a.distance !== undefined && b.distance !== undefined) {
        compareValue = a.distance - b.distance
      } else if (finalSortBy === 'reviews') {
        compareValue = (a.workshop.stats?.totalReviews || 0) - (b.workshop.stats?.totalReviews || 0)
      } else if (finalSortBy === 'name') {
        const nameA = a.workshop.profile?.businessName || ''
        const nameB = b.workshop.profile?.businessName || ''
        compareValue = nameA.localeCompare(nameB)
      }

      return finalSortOrder === 'desc' ? -compareValue : compareValue
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      data: filteredResults,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: filters,
      query: searchQuery
    })
    
  } catch (error) {
    console.error('Error searching workshops:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      filters,
      searchQuery,
      page,
      limit
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search workshops',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/workshops/search - Quick search with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    // Convert query parameters to search filters
    const filters: WorkshopSearchFilters = {}
    
    // Location search
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    
    if (lat && lng) {
      filters.location = {
        coordinates: [parseFloat(lng), parseFloat(lat)],
        radius: radius ? parseFloat(radius) : 25 // Default 25km radius
      }
    }
    
    // Service type filter
    const serviceTypes = searchParams.get('serviceTypes')
    if (serviceTypes) {
      filters.serviceTypes = serviceTypes.split(',') as any[]
    }
    
    // Car brand filter
    const carBrands = searchParams.get('carBrands')
    if (carBrands) {
      filters.carBrands = carBrands.split(',') as any[]
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
    
    // Open status filter
    const isOpen = searchParams.get('isOpen')
    if (isOpen) {
      filters.isOpen = isOpen === 'true'
    }
    
    // Sort options
    filters.sortBy = (searchParams.get('sortBy') as any) || 'rating'
    filters.sortOrder = (searchParams.get('sortOrder') as any) || 'desc'
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Use the POST endpoint logic
    const searchBody = {
      query,
      filters,
      page,
      limit
    }
    
    // Create a new request object for the POST handler
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    })
    
    return await POST(postRequest)
    
  } catch (error) {
    console.error('Error in workshop search GET:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search workshops' },
      { status: 500 }
    )
  }
}
