import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

/**
 * POST /api/workshops/stats/update
 * Updates workshop statistics by calculating from completed appointments
 * This endpoint should be called periodically (via cron job or scheduled task)
 *
 * Optional query parameters:
 * - workshopId: Update stats for a specific workshop only
 * - apiKey: Secret key for authentication (set in environment variables)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workshopId = searchParams.get('workshopId')
    const apiKey = searchParams.get('apiKey')

    // Simple API key authentication for scheduled tasks
    // Set STATS_UPDATE_API_KEY in your environment variables
    const expectedApiKey = process.env.STATS_UPDATE_API_KEY
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()

    // Build query - either specific workshop or all active workshops
    const workshopQuery: any = { isActive: true }
    if (workshopId && ObjectId.isValid(workshopId)) {
      workshopQuery._id = new ObjectId(workshopId)
    }

    // Get all workshops to update
    const workshops = await db.collection('workshops').find(workshopQuery).toArray()

    if (workshops.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No workshops found to update',
        updated: 0
      })
    }

    // Get all workshop user IDs
    const workshopUserIds = workshops.map(w => w.userId)

    // Calculate stats from appointments for all workshops
    const statsAggregation = await db.collection('appointments').aggregate([
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
          totalReviews: { $sum: 1 },
          completedJobs: { $sum: 1 }
        }
      }
    ]).toArray()

    // Also get completed jobs without ratings
    const completedJobsAggregation = await db.collection('appointments').aggregate([
      {
        $match: {
          workshopId: { $in: workshopUserIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$workshopId',
          completedJobs: { $sum: 1 }
        }
      }
    ]).toArray()

    // Calculate repeat customers
    const repeatCustomersAggregation = await db.collection('appointments').aggregate([
      {
        $match: {
          workshopId: { $in: workshopUserIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            workshopId: '$workshopId',
            customerId: '$customerId'
          },
          visitCount: { $sum: 1 }
        }
      },
      {
        $match: {
          visitCount: { $gt: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.workshopId',
          repeatCustomers: { $sum: 1 }
        }
      }
    ]).toArray()

    // Calculate average response time (from quotation request to first quote submission)
    const responseTimeAggregation = await db.collection('quotations').aggregate([
      {
        $match: {
          'quotes.workshopId': { $in: workshopUserIds }
        }
      },
      {
        $unwind: '$quotes'
      },
      {
        $match: {
          'quotes.workshopId': { $in: workshopUserIds },
          'quotes.submittedAt': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$quotes.workshopId',
          avgResponseTime: {
            $avg: {
              $divide: [
                { $subtract: ['$quotes.submittedAt', '$createdAt'] },
                1000 * 60 * 60 // Convert milliseconds to hours
              ]
            }
          }
        }
      }
    ]).toArray()

    // Create maps for easy lookup
    const statsMap = new Map()
    statsAggregation.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        totalReviews: stat.totalReviews
      })
    })

    const completedJobsMap = new Map()
    completedJobsAggregation.forEach(stat => {
      completedJobsMap.set(stat._id.toString(), stat.completedJobs)
    })

    const repeatCustomersMap = new Map()
    repeatCustomersAggregation.forEach(stat => {
      repeatCustomersMap.set(stat._id.toString(), stat.repeatCustomers)
    })

    const responseTimeMap = new Map()
    responseTimeAggregation.forEach(stat => {
      responseTimeMap.set(stat._id.toString(), Math.round(stat.avgResponseTime))
    })

    // Update each workshop's stats
    const updatePromises = workshops.map(async (workshop) => {
      const userId = workshop.userId.toString()
      const stats = statsMap.get(userId)
      const completedJobs = completedJobsMap.get(userId) || 0
      const repeatCustomers = repeatCustomersMap.get(userId) || 0
      const responseTime = responseTimeMap.get(userId) || workshop.stats?.responseTime || 24

      const updatedStats = {
        totalReviews: stats?.totalReviews || 0,
        averageRating: stats?.averageRating || 0,
        completedJobs: completedJobs,
        responseTime: responseTime,
        repeatCustomers: repeatCustomers
      }

      return db.collection('workshops').updateOne(
        { _id: workshop._id },
        {
          $set: {
            stats: updatedStats,
            updatedAt: new Date()
          }
        }
      )
    })

    const results = await Promise.all(updatePromises)
    const updatedCount = results.filter(r => r.modifiedCount > 0).length

    return NextResponse.json({
      success: true,
      message: `Successfully updated stats for ${updatedCount} workshop(s)`,
      updated: updatedCount,
      total: workshops.length,
      details: workshops.map((w, i) => ({
        workshopId: w._id.toString(),
        businessName: w.profile?.businessName,
        modified: results[i].modifiedCount > 0,
        stats: {
          totalReviews: statsMap.get(w.userId.toString())?.totalReviews || 0,
          averageRating: statsMap.get(w.userId.toString())?.averageRating || 0,
          completedJobs: completedJobsMap.get(w.userId.toString()) || 0,
          repeatCustomers: repeatCustomersMap.get(w.userId.toString()) || 0,
          responseTime: responseTimeMap.get(w.userId.toString()) || w.stats?.responseTime || 24
        }
      }))
    })

  } catch (error) {
    console.error('Error updating workshop stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workshop stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/workshops/stats/update
 * Convenience endpoint to trigger stats update via GET request
 * Useful for browser-based testing or simple cron services
 */
export async function GET(request: NextRequest) {
  // Redirect GET requests to POST
  return POST(request)
}
