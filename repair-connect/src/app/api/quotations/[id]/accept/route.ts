import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Function to notify workshops about bid results
async function notifyWorkshopsOfBidResult(
  quotation: any,
  winningQuote: any,
  db: any
) {
  try {
    const notifications = []

    // Create notifications for all workshops that submitted quotes
    for (const quote of quotation.quotes) {
      const workshopId = quote.workshopId

      if (quote.id === winningQuote.id) {
        // Notification for winning workshop
        notifications.push({
          _id: new ObjectId(),
          userId: new ObjectId(workshopId.toString()),
          type: 'quotation_won',
          title: 'Congratulations! Your Quote Was Accepted',
          message: `Your quote of ${quote.currency} ${quote.totalAmount.toLocaleString()} for ${quotation.vehicle.make} ${quotation.vehicle.model} has been accepted by the customer.`,
          data: {
            quotationId: quotation._id,
            quoteId: quote.id,
            quotationTitle: `${quotation.vehicle.year} ${quotation.vehicle.make} ${quotation.vehicle.model}`,
            winningAmount: quote.totalAmount,
            currency: quote.currency,
            customerName: quotation.customerName,
            estimatedDuration: quote.estimatedDuration
          },
          read: false,
          createdAt: new Date()
        })
      } else if (quote.status === 'submitted') {
        // Notification for losing workshops
        notifications.push({
          _id: new ObjectId(),
          userId: new ObjectId(workshopId.toString()),
          type: 'quotation_lost',
          title: 'Quote Not Selected',
          message: `Unfortunately, your quote was not selected for ${quotation.vehicle.make} ${quotation.vehicle.model}. The winning quote was ${winningQuote.currency} ${winningQuote.totalAmount.toLocaleString()} by ${winningQuote.workshopName}.`,
          data: {
            quotationId: quotation._id,
            quoteId: quote.id,
            quotationTitle: `${quotation.vehicle.year} ${quotation.vehicle.make} ${quotation.vehicle.model}`,
            yourQuoteAmount: quote.totalAmount,
            winningAmount: winningQuote.totalAmount,
            winningWorkshop: winningQuote.workshopName,
            currency: quote.currency,
            priceDifference: quote.totalAmount - winningQuote.totalAmount
          },
          read: false,
          createdAt: new Date()
        })
      }
    }

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications)
      console.log(`Created ${notifications.length} bid result notifications`)
    }

  } catch (error) {
    console.error('Failed to create bid result notifications:', error)
    // Don't fail the entire operation if notifications fail
  }
}

// POST /api/quotations/[id]/accept - Accept a specific quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params
    
    if (!session?.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Customer authentication required' },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quotation ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const body = await request.json()
    const { quoteId } = body

    if (!quoteId) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      )
    }
    
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    // Check if user owns this quotation
    if (quotation.customerId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Check if quotation can be updated
    if (quotation.status === 'accepted' || quotation.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'This quotation has already been finalized' },
        { status: 400 }
      )
    }
    
    // Find the quote to accept
    const quoteToAccept = quotation.quotes?.find((q: any) => q.id === quoteId)
    if (!quoteToAccept) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    // Update the quotation with additional metadata
    const result = await db.collection('quotations').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        $set: {
          status: 'accepted',
          acceptedQuoteId: quoteId,
          acceptedAt: new Date(),
          updatedAt: new Date(),
          'quotes.$[accepted].status': 'accepted',
          'quotes.$[accepted].acceptedAt': new Date(),
          'quotes.$[others].status': 'declined',
          'quotes.$[others].declinedAt': new Date(),
          'quotes.$[others].declineReason': 'Customer accepted another quote'
        }
      },
      {
        arrayFilters: [
          { 'accepted.id': quoteId },
          { 'others.id': { $ne: quoteId } }
        ]
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to accept quote' },
        { status: 500 }
      )
    }
    
    // Get updated quotation
    const updatedQuotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })
    
    if (!updatedQuotation) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated quotation' },
        { status: 500 }
      )
    }

    // Find the accepted quote and notify all workshops
    const acceptedQuote = updatedQuotation.quotes?.find((q: any) => q.id === quoteId)
    if (acceptedQuote) {
      await notifyWorkshopsOfBidResult(updatedQuotation, acceptedQuote, db)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedQuotation,
        _id: updatedQuotation._id.toString(),
        customerId: updatedQuotation.customerId.toString(),
        targetWorkshops: updatedQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        quotes: updatedQuotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        }))
      }
    })
    
  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to accept quote' },
      { status: 500 }
    )
  }
}
