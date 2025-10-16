import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

/**
 * GET /api/quotations/check
 *
 * Check if a quote request already exists for a specific car+workshop combination
 *
 * Query params:
 * - workshopId: Workshop user ID (required)
 * - carId: Car ID (required)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     hasPendingQuote: boolean,
 *     quoteId?: string,
 *     status?: string,
 *     expiresAt?: Date
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Customer authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workshopId = searchParams.get('workshopId')
    const carId = searchParams.get('carId')

    if (!workshopId || !carId) {
      return NextResponse.json(
        { success: false, error: 'Missing workshopId or carId' },
        { status: 400 }
      )
    }

    // Validate ObjectId formats
    if (!ObjectId.isValid(workshopId) || !ObjectId.isValid(carId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workshopId or carId format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check for ACTIVE quotations (not expired, not completed)
    const activeQuotation = await db.collection('quotations').findOne({
      customerId: new ObjectId(session.user.id),
      carId: new ObjectId(carId),
      // Only active statuses
      status: { $in: ['pending', 'open', 'viewed', 'quoted'] },
      // Combined $or for workshop match AND expiration check
      $and: [
        {
          $or: [
            // Workshop is in targetWorkshops array
            { targetWorkshops: new ObjectId(workshopId) },
            // Workshop has submitted a quote
            { 'quotes.workshopId': new ObjectId(workshopId) }
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gte: new Date() } }
          ]
        }
      ]
    })

    if (activeQuotation) {
      return NextResponse.json({
        success: true,
        data: {
          hasPendingQuote: true,
          quoteId: activeQuotation._id.toString(),
          status: activeQuotation.status,
          expiresAt: activeQuotation.expiresAt,
          createdAt: activeQuotation.createdAt
        }
      })
    }

    // No active quote found
    return NextResponse.json({
      success: true,
      data: {
        hasPendingQuote: false
      }
    })

  } catch (error) {
    console.error('Error checking quotation status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check quotation status' },
      { status: 500 }
    )
  }
}
