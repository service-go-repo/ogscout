import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/workshops/notifications - Get workshop notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Workshop authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Get recent quotations where this workshop has submitted quotes
    // and the status has been updated in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const quotations = await db.collection('quotations')
      .find({
        'quotes.workshopId': new ObjectId(session.user.id),
        $or: [
          { 'quotes.acceptedAt': { $gte: sevenDaysAgo } },
          { 'quotes.declinedAt': { $gte: sevenDaysAgo } }
        ]
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray()

    // Transform to notification format
    const notifications = []
    
    for (const quotation of quotations) {
      const myQuote = quotation.quotes?.find((q: any) => 
        q.workshopId.toString() === session.user.id
      )
      
      if (myQuote && (myQuote.status === 'accepted' || myQuote.status === 'declined')) {
        const timestamp = myQuote.acceptedAt || myQuote.declinedAt || quotation.updatedAt
        
        // Get customer name - fetch from users collection if not available in quotation
        let customerName = quotation.customerName || quotation.customerEmail || 'Unknown Customer'
        
        if (!quotation.customerName || quotation.customerName === null) {
          try {
            const customer = await db.collection('users').findOne({
              _id: quotation.customerId
            })
            if (customer) {
              customerName = customer.name || customer.email || 'Unknown Customer'
            }
          } catch (error) {
            console.error('Error fetching customer details:', error)
          }
        }
        
        // Check if we've already created a notification for this status change
        const existingNotification = await db.collection('workshop_notifications').findOne({
          workshopId: new ObjectId(session.user.id),
          quotationId: quotation._id,
          quoteId: myQuote.id,
          quoteStatus: myQuote.status
        })
        
        if (!existingNotification && timestamp >= sevenDaysAgo) {
          // Create notification record
          const notificationId = new ObjectId()
          
          await db.collection('workshop_notifications').insertOne({
            _id: notificationId,
            workshopId: new ObjectId(session.user.id),
            quotationId: quotation._id,
            quoteId: myQuote.id,
            customerName: customerName,
            vehicleInfo: `${quotation.vehicle.year} ${quotation.vehicle.make} ${quotation.vehicle.model}`,
            quoteStatus: myQuote.status,
            quoteAmount: myQuote.status === 'accepted' ? myQuote.totalAmount : undefined,
            timestamp: timestamp,
            read: false,
            createdAt: new Date()
          })
          
          notifications.push({
            id: notificationId.toString(),
            quotationId: quotation._id.toString(),
            customerName: customerName,
            vehicleInfo: `${quotation.vehicle.year} ${quotation.vehicle.make} ${quotation.vehicle.model}`,
            quoteStatus: myQuote.status,
            quoteAmount: myQuote.status === 'accepted' ? myQuote.totalAmount : undefined,
            timestamp: timestamp,
            read: false
          })
        } else if (existingNotification) {
          // Update existing notification with proper customer name if it's null
          let existingCustomerName = existingNotification.customerName
          if (!existingCustomerName || existingCustomerName === null || existingCustomerName === 'Unknown Customer') {
            existingCustomerName = customerName
            
            // Update the stored notification with the correct customer name
            await db.collection('workshop_notifications').updateOne(
              { _id: existingNotification._id },
              { $set: { customerName: customerName } }
            )
          }
          
          notifications.push({
            id: existingNotification._id.toString(),
            quotationId: existingNotification.quotationId.toString(),
            customerName: existingCustomerName,
            vehicleInfo: existingNotification.vehicleInfo,
            quoteStatus: existingNotification.quoteStatus,
            quoteAmount: existingNotification.quoteAmount,
            timestamp: existingNotification.timestamp,
            read: existingNotification.read
          })
        }
      }
    }
    
    // Sort by timestamp desc
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      }
    })
    
  } catch (error) {
    console.error('Error fetching workshop notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}