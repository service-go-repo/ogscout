import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    console.log('Starting workshop migration...')
    
    // Get all workshops
    const workshops = await db.collection('workshops').find({}).toArray()
    console.log(`Found ${workshops.length} workshops`)
    
    // Migrate each workshop to ensure proper structure
    for (const workshop of workshops) {
      const updates: any = {}
      
      // Ensure profile structure exists
      if (!workshop.profile) {
        updates.profile = {
          businessName: workshop.businessName || 'Unknown Workshop',
          description: workshop.description || 'No description provided',
          yearEstablished: workshop.yearEstablished || null,
          employeeCount: workshop.employeeCount || null,
          logo: workshop.logo || null,
          coverImage: workshop.coverImage || null,
          features: workshop.features || [],
          specializations: {
            serviceTypes: workshop.serviceTypes || [],
            carBrands: workshop.carBrands || []
          },
          operatingHours: workshop.operatingHours || {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: true }
          },
          portfolio: workshop.portfolio || [],
          certifications: workshop.certifications || [],
          gallery: workshop.gallery || []
        }
      }
      
      // Ensure contact structure exists
      if (!workshop.contact) {
        updates.contact = {
          phone: workshop.phone || '',
          email: workshop.email || '',
          website: workshop.website || null,
          address: workshop.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'UAE'
          },
          location: workshop.location || {
            type: 'Point',
            coordinates: [55.3781, 25.1772] // Dubai coordinates
          }
        }
      }
      
      // Ensure stats structure exists
      if (!workshop.stats) {
        updates.stats = {
          totalReviews: 0,
          averageRating: 0,
          totalJobs: 0,
          responseTime: 24
        }
      }
      
      // Ensure other required fields
      if (!workshop.isActive) {
        updates.isActive = true
      }
      
      if (!workshop.isVerified) {
        updates.isVerified = false
      }
      
      if (!workshop.subscription) {
        updates.subscription = {
          plan: 'basic',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      }
      
      if (!workshop.createdAt) {
        updates.createdAt = new Date()
      }
      
      if (!workshop.updatedAt) {
        updates.updatedAt = new Date()
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await db.collection('workshops').updateOne(
          { _id: workshop._id },
          { $set: updates }
        )
        console.log(`Updated workshop: ${workshop._id}`)
      }
    }
    
    // Ensure geospatial index exists
    try {
      await db.collection('workshops').createIndex(
        { 'contact.location': '2dsphere' },
        { name: 'location_2dsphere' }
      )
      console.log('Geospatial index created/verified')
    } catch (indexError) {
      console.log('Index already exists or error:', indexError)
    }
    
    console.log('Migration completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Workshop migration completed',
      migratedCount: workshops.length
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}
