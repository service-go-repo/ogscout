import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// POST /api/quotations/[id]/decline - Decline a specific quote
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
    
    // Find the quote to decline
    const quoteToDecline = quotation.quotes?.find((q: any) => q.id === quoteId)
    if (!quoteToDecline) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    // Update the specific quote status
    const result = await db.collection('quotations').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        $set: {
          updatedAt: new Date(),
          'quotes.$[target].status': 'declined'
        }
      },
      {
        arrayFilters: [
          { 'target.id': quoteId }
        ]
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to decline quote' },
        { status: 500 }
      )
    }
    
    // Check if all quotes are declined, update quotation status
    const updatedQuotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedQuotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found after update' },
        { status: 404 }
      )
    }

    const allQuotesDeclined = updatedQuotation.quotes?.every((q: any) => 
      q.status === 'declined' || q.status === 'pending'
    )
    
    if (allQuotesDeclined && updatedQuotation.quotes?.some((q: any) => q.status === 'declined')) {
      await db.collection('quotations').updateOne(
        { _id: new ObjectId(resolvedParams.id) },
        {
          $set: {
            status: 'declined',
            updatedAt: new Date()
          }
        }
      )
    }
    
    // Get final updated quotation
    const finalQuotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!finalQuotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...finalQuotation,
        _id: finalQuotation._id.toString(),
        customerId: finalQuotation.customerId.toString(),
        targetWorkshops: finalQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        quotes: finalQuotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        }))
      }
    })
    
  } catch (error) {
    console.error('Error declining quote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to decline quote' },
      { status: 500 }
    )
  }
}
