import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()

    console.log('[Customers API] Workshop ID:', session.user.id)

    // Get all quotations where this workshop has submitted a quote
    const quotations = await db
      .collection('quotations')
      .find({
        'quotes.workshopId': new ObjectId(session.user.id)
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[Customers API] Found quotations:', quotations.length)

    // Get all appointments for this workshop with paid status
    const appointments = await db
      .collection('appointments')
      .find({
        workshopId: new ObjectId(session.user.id),
        paymentStatus: 'paid'
      })
      .toArray()

    console.log('[Customers API] Found paid appointments:', appointments.length)

    // Create a map of quotation ID to paid amount
    const paidAmountsByQuotation = new Map()
    appointments.forEach((apt: any) => {
      if (apt.quotationId && apt.totalAmount) {
        const quotationId = apt.quotationId.toString()
        const existing = paidAmountsByQuotation.get(quotationId) || 0
        paidAmountsByQuotation.set(quotationId, existing + apt.totalAmount)
      }
    })

    // Group quotations by customer
    const customerMap = new Map()

    for (const quotation of quotations) {
      // Find this workshop's quote in the quotation
      const workshopQuote = quotation.quotes?.find(
        (q: any) => q.workshopId?.toString() === session.user.id
      )

      if (!workshopQuote) continue

      const customerId = quotation.customerId?.toString()
      if (!customerId) {
        // If no customerId, use contact info from quotation
        const customerEmail = quotation.customerEmail
        if (!customerEmail) continue

        // Debug specific customer
        if (customerEmail === 'customer2@ogscout.com') {
          console.log('[DEBUG] customer2@ogscout.com quotation data:', {
            customerName: quotation.customerName,
            customerEmail: quotation.customerEmail,
            customerPhone: quotation.customerPhone,
          })
        }

        if (!customerMap.has(customerEmail)) {
          // Use email prefix as fallback if no name is available
          const emailPrefix = customerEmail.split('@')[0]
          const finalName = quotation.customerName || emailPrefix || 'Unknown'

          customerMap.set(customerEmail, {
            _id: customerEmail,
            name: finalName,
            email: quotation.customerEmail || '',
            phone: quotation.customerPhone || '',
            totalQuotations: 0,
            totalSpent: 0,
            lastInteraction: null,
            cars: quotation.vehicle ? [{
              make: quotation.vehicle.make,
              model: quotation.vehicle.model,
              year: quotation.vehicle.year,
              licensePlate: quotation.vehicle.licensePlate,
            }] : [],
            quotations: [],
          })
        }

        const customerData = customerMap.get(customerEmail)

        // Update phone if empty and quotation has one
        if (!customerData.phone && quotation.customerPhone) {
          customerData.phone = quotation.customerPhone
        }

        // Update stats
        customerData.totalQuotations++

        // Add paid amount from appointments for this quotation
        const quotationId = quotation._id.toString()
        const paidAmount = paidAmountsByQuotation.get(quotationId) || 0
        if (paidAmount > 0) {
          console.log('[Customers API] Adding paid amount:', paidAmount, 'for quotation:', quotationId)
          customerData.totalSpent += paidAmount
        }

        // Update last interaction
        const quotationDate = new Date(quotation.createdAt)
        if (!customerData.lastInteraction || quotationDate > new Date(customerData.lastInteraction)) {
          customerData.lastInteraction = quotation.createdAt
        }

        // Add quotation to customer's history
        customerData.quotations.push({
          _id: quotation._id.toString(),
          createdAt: quotation.createdAt,
          status: quotation.status,
          quoteStatus: workshopQuote.status,
          services: quotation.requestedServices || [],
          totalAmount: workshopQuote.totalAmount,
          vehicle: quotation.vehicle,
        })

        continue
      }

      // Customer has an account
      if (!customerMap.has(customerId)) {
        // Get customer details
        const customer = await db
          .collection('users')
          .findOne({ _id: new ObjectId(customerId) })

        // Debug specific customer
        if (quotation.customerEmail === 'customer2@ogscout.com') {
          console.log('[DEBUG] customer2@ogscout.com user lookup:', {
            found: !!customer,
            profileFirstName: customer?.profile?.firstName,
            profileLastName: customer?.profile?.lastName,
            profilePhone: customer?.profile?.phoneNumber,
            customerPhone: customer?.phone,
            quotationPhone: quotation.customerPhone,
            quotationId: quotation._id.toString(),
            userEmail: customer?.email,
            quotationName: quotation.customerName,
            quotationEmail: quotation.customerEmail,
          })
        }

        // Check all quotations for phone numbers
        if (quotation.customerEmail === 'customer2@ogscout.com' && quotation.customerPhone) {
          console.log('[DEBUG] Found phone in quotation:', quotation._id.toString(), quotation.customerPhone)
        }

        // If user not found, fall back to quotation data
        if (!customer) {
          console.log('[Customers API] User not found for ID:', customerId, 'using quotation data')

          const emailPrefix = (quotation.customerEmail || '').split('@')[0]
          const finalName = quotation.customerName || emailPrefix || 'Unknown'

          customerMap.set(customerId, {
            _id: customerId,
            name: finalName,
            email: quotation.customerEmail || '',
            phone: quotation.customerPhone || '',
            totalQuotations: 0,
            totalSpent: 0,
            lastInteraction: null,
            cars: quotation.vehicle ? [{
              make: quotation.vehicle.make,
              model: quotation.vehicle.model,
              year: quotation.vehicle.year,
              licensePlate: quotation.vehicle.licensePlate,
            }] : [],
            quotations: [],
          })
        } else {
          // Get all cars for this customer
          const cars = await db
            .collection('cars')
            .find({ userId: new ObjectId(customerId) })
            .toArray()

          // Use same logic as auth.ts for customer names
          let finalName = 'Unknown'
          if (customer.profile?.firstName && customer.profile?.lastName) {
            finalName = `${customer.profile.firstName} ${customer.profile.lastName}`
          } else if (customer.profile?.firstName) {
            finalName = customer.profile.firstName
          } else if (customer.profile?.lastName) {
            finalName = customer.profile.lastName
          } else if (customer.businessInfo?.businessName) {
            // For workshop users
            finalName = customer.businessInfo.businessName
          } else if (quotation.customerName) {
            finalName = quotation.customerName
          } else {
            // Use email prefix as last fallback
            const emailPrefix = (customer.email || quotation.customerEmail || '').split('@')[0]
            if (emailPrefix) finalName = emailPrefix
          }

          customerMap.set(customerId, {
            _id: customerId,
            name: finalName,
            email: customer.email || quotation.customerEmail || '',
            phone: quotation.customerPhone || customer.profile?.phoneNumber || customer.phone || '',
            totalQuotations: 0,
            totalSpent: 0,
            lastInteraction: null,
            cars: cars.map((car: any) => ({
              make: car.make,
              model: car.model,
              year: car.year,
              licensePlate: car.licensePlate,
            })),
            quotations: [],
          })

          // Debug final name
          if (quotation.customerEmail === 'customer2@ogscout.com') {
            console.log('[DEBUG] customer2@ogscout.com final name set to:', finalName)
          }
        }
      }

      const customerData = customerMap.get(customerId)

      // Update phone if empty and quotation has one
      if (!customerData.phone && quotation.customerPhone) {
        customerData.phone = quotation.customerPhone
      }

      // Update stats
      customerData.totalQuotations++

      // Add paid amount from appointments for this quotation
      const quotationId = quotation._id.toString()
      const paidAmount = paidAmountsByQuotation.get(quotationId) || 0
      if (paidAmount > 0) {
        console.log('[Customers API] Adding paid amount:', paidAmount, 'for quotation:', quotationId)
        customerData.totalSpent += paidAmount
      }

      // Update last interaction
      const quotationDate = new Date(quotation.createdAt)
      if (!customerData.lastInteraction || quotationDate > new Date(customerData.lastInteraction)) {
        customerData.lastInteraction = quotation.createdAt
      }

      // Add quotation to customer's history
      customerData.quotations.push({
        _id: quotation._id.toString(),
        createdAt: quotation.createdAt,
        status: quotation.status,
        quoteStatus: workshopQuote.status,
        services: quotation.requestedServices || [],
        totalAmount: workshopQuote.totalAmount,
        vehicle: quotation.vehicle,
      })
    }

    // Convert map to array and sort by total spent (best customers first)
    const customers = Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    )

    console.log('[Customers API] Sample customer data:', customers.length > 0 ? {
      name: customers[0].name,
      email: customers[0].email,
      phone: customers[0].phone,
      totalQuotations: customers[0].totalQuotations,
      totalSpent: customers[0].totalSpent
    } : 'No customers')

    return NextResponse.json({
      success: true,
      data: customers,
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customers',
      },
      { status: 500 }
    )
  }
}
