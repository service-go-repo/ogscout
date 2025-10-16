import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/debug/quotation/[id] - Debug quotation and service request data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    if (!ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quotation ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get quotation
    const quotation = await db.collection('quotations').findOne({
      _id: new ObjectId(resolvedParams.id)
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Extract service request ID from damage description
    const damageDesc = quotation.damageDescription?.[0]?.description || ''
    const match = damageDesc.match(/service request ([a-f0-9]{24})/i)
    const extractedServiceRequestId = match ? match[1] : null

    let serviceRequest = null
    if (extractedServiceRequestId) {
      serviceRequest = await db.collection('servicerequests').findOne({
        _id: new ObjectId(extractedServiceRequestId)
      })
    }

    // Check if sync should be triggered
    const { searchParams } = new URL(request.url)
    const shouldSync = searchParams.get('sync') === 'true'

    let syncResult = null
    if (shouldSync && serviceRequest) {
      // Perform sync
      const updateData: any = {
        requestedServices: serviceRequest.requestedServices,
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

      try {
        const result = await db.collection('quotations').updateOne(
          { _id: new ObjectId(resolvedParams.id) },
          { $set: updateData }
        )
        syncResult = { success: true, modifiedCount: result.modifiedCount }
      } catch (error) {
        syncResult = { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        quotation: {
          _id: quotation._id.toString(),
          requestedServices: quotation.requestedServices,
          damageDescription: quotation.damageDescription,
          sourceServiceRequestId: quotation.sourceServiceRequestId?.toString(),
          extractedServiceRequestId,
          damageDescriptionText: damageDesc
        },
        serviceRequest: serviceRequest ? {
          _id: serviceRequest._id.toString(),
          requestedServices: serviceRequest.requestedServices,
          damageAssessments: serviceRequest.damageAssessments,
          photos: serviceRequest.photos?.length || 0,
          timeline: serviceRequest.timeline,
          title: serviceRequest.title,
          description: serviceRequest.description
        } : null,
        syncResult
      }
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
}