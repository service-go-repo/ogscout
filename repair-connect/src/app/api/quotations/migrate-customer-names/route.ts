import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// POST /api/quotations/migrate-customer-names - Fix null customer names in quotations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to run this migration (you can adjust this logic)
    if (!session?.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Find quotations with null or empty customer names
    const quotationsToFix = await db.collection('quotations')
      .find({
        $or: [
          { customerName: null },
          { customerName: '' },
          { customerName: { $exists: false } }
        ]
      })
      .toArray()

    console.log(`Found ${quotationsToFix.length} quotations with missing customer names`)
    
    let fixedCount = 0
    let errorCount = 0
    
    for (const quotation of quotationsToFix) {
      try {
        // Fetch customer details
        const customer = await db.collection('users').findOne({
          _id: new ObjectId(quotation.customerId)
        })
        
        if (customer) {
          const customerName = customer.name || customer.email || 'Unknown Customer'
          const customerEmail = customer.email || quotation.customerEmail || ''
          const customerPhone = customer.phone || quotation.customerPhone || ''
          
          // Update the quotation
          await db.collection('quotations').updateOne(
            { _id: quotation._id },
            {
              $set: {
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                updatedAt: new Date()
              }
            }
          )
          
          fixedCount++
          console.log(`Fixed quotation ${quotation._id} - Customer: ${customerName}`)
        } else {
          console.warn(`Customer not found for quotation ${quotation._id}`)
          errorCount++
        }
      } catch (error) {
        console.error(`Error fixing quotation ${quotation._id}:`, error)
        errorCount++
      }
    }
    
    // Also fix existing notifications with null customer names
    const notificationsToFix = await db.collection('workshop_notifications')
      .find({
        $or: [
          { customerName: null },
          { customerName: '' },
          { customerName: { $exists: false } },
          { customerName: 'Unknown Customer' }
        ]
      })
      .toArray()

    console.log(`Found ${notificationsToFix.length} notifications with missing customer names`)
    
    let notificationFixedCount = 0
    
    for (const notification of notificationsToFix) {
      try {
        // Get the quotation for this notification
        const quotation = await db.collection('quotations').findOne({
          _id: new ObjectId(notification.quotationId)
        })
        
        if (quotation && quotation.customerName) {
          await db.collection('workshop_notifications').updateOne(
            { _id: notification._id },
            {
              $set: {
                customerName: quotation.customerName
              }
            }
          )
          
          notificationFixedCount++
          console.log(`Fixed notification ${notification._id} - Customer: ${quotation.customerName}`)
        }
      } catch (error) {
        console.error(`Error fixing notification ${notification._id}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        quotationsChecked: quotationsToFix.length,
        quotationsFixed: fixedCount,
        quotationErrors: errorCount,
        notificationsChecked: notificationsToFix.length,
        notificationsFixed: notificationFixedCount
      },
      message: `Migration completed. Fixed ${fixedCount} quotations and ${notificationFixedCount} notifications.`
    })
    
  } catch (error) {
    console.error('Error running customer name migration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run migration' },
      { status: 500 }
    )
  }
}