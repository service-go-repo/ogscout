import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

/**
 * GET /api/quotations/check-active?carId=X&workshopId=Y
 *
 * Check if there's an active quotation for a specific car + workshop combination
 *
 * Active quotations have status: "pending", "open", or have quotes with status "submitted"
 * Completed quotations: "completed", "accepted", "rejected", "expired"
 *
 * This prevents duplicate quote requests to the same workshop for the same car
 * when an active quotation already exists.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    const workshopId = searchParams.get('workshopId')

    if (!carId || !workshopId) {
      return NextResponse.json(
        { success: false, error: 'carId and workshopId are required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(carId) || !ObjectId.isValid(workshopId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid carId or workshopId format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check for active quotations
    // A quotation is considered "active" if:
    // 1. Status is "pending" or "open" (not completed/closed)
    // 2. It targets the specific workshop
    // 3. It's for the specific car
    // 4. It's not expired
    // 5. It belongs to the current user (for security)
    const activeQuotation = await db.collection('quotations').findOne({
      customerId: new ObjectId(session.user.id),
      carId: new ObjectId(carId),
      status: { $in: ['pending', 'open', 'viewed', 'quoted'] },
      // Combined $or for workshop match AND expiration check
      $and: [
        {
          $or: [
            { targetWorkshops: new ObjectId(workshopId) },
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

    const hasActiveQuote = !!activeQuotation

    return NextResponse.json({
      success: true,
      data: {
        hasActiveQuote,
        quotationId: hasActiveQuote ? activeQuotation._id.toString() : null,
        status: hasActiveQuote ? activeQuotation.status : null,
        canSendNewQuote: !hasActiveQuote,
        message: hasActiveQuote
          ? 'Active quotation exists for this car and workshop'
          : 'No active quotation, can send new quote request'
      }
    })
  } catch (error) {
    console.error('Error checking active quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check active quotations' },
      { status: 500 }
    )
  }
}
