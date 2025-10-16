import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// POST /api/quotations/[id]/resync - Re-sync quotation with service request data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
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

    // Get the quotation
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Extract service request ID from damage description if not already set
    let serviceRequestId = quotation.sourceServiceRequestId

    if (!serviceRequestId) {
      // Try to extract from damage description text
      const damageDesc = quotation.damageDescription?.[0]?.description || ''
      const match = damageDesc.match(/service request ([a-f0-9]{24})/i)
      if (match) {
        serviceRequestId = match[1]
        console.log('Extracted service request ID:', serviceRequestId)
      }
    }

    if (!serviceRequestId) {
      return NextResponse.json(
        { success: false, error: 'No linked service request found' },
        { status: 400 }
      )
    }

    // Fetch service request data
    const serviceRequest = await db.collection('servicerequests').findOne({
      _id: new ObjectId(serviceRequestId)
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      )
    }

    console.log('Found service request with data:', {
      requestedServices: serviceRequest.requestedServices,
      damageAssessments: serviceRequest.damageAssessments?.length,
      photos: serviceRequest.photos?.length
    })

    // Build update object with service request data
    const updateData: any = {
      sourceServiceRequestId: new ObjectId(serviceRequestId),
      requestedServices: serviceRequest.requestedServices || quotation.requestedServices,
      updatedAt: new Date()
    }

    // Update damage descriptions with actual assessments
    if (serviceRequest.damageAssessments?.length > 0) {
      updateData.damageDescription = serviceRequest.damageAssessments.map((assessment: any) => ({
        area: assessment.location || assessment.area || 'General',
        description: assessment.description,
        severity: assessment.severity,
        images: assessment.photos || [],
        estimatedCost: assessment.estimatedCost
      }))
    }

    // Update timeline with service request timeline
    if (serviceRequest.timeline) {
      updateData.timeline = {
        preferredStartDate: serviceRequest.timeline.preferredStartDate,
        preferredCompletionDate: serviceRequest.timeline.preferredCompletionDate,
        flexibility: serviceRequest.timeline.flexibility || 'flexible',
        urgency: serviceRequest.timeline.urgency || quotation.priority || 'medium'
      }
    }

    // Update the quotation
    const result = await db.collection('quotations').updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update quotation' },
        { status: 500 }
      )
    }

    // Get the updated quotation
    const updatedQuotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!updatedQuotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found after update' },
        { status: 404 }
      )
    }

    // Fetch service request photos for carImages
    let carImages: string[] = []
    if (serviceRequest.photos) {
      carImages = serviceRequest.photos.map((photo: any) => photo.url)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedQuotation,
        _id: updatedQuotation._id.toString(),
        customerId: updatedQuotation.customerId.toString(),
        carId: updatedQuotation.carId?.toString(),
        sourceServiceRequestId: updatedQuotation.sourceServiceRequestId?.toString(),
        carImages,
        targetWorkshops: updatedQuotation.targetWorkshops?.map((id: ObjectId) => id.toString()),
        quotes: updatedQuotation.quotes?.map((quote: any) => ({
          ...quote,
          workshopId: quote.workshopId.toString()
        }))
      },
      message: 'Quotation successfully re-synced with service request data'
    })

  } catch (error) {
    console.error('Error re-syncing quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to re-sync quotation' },
      { status: 500 }
    )
  }
}