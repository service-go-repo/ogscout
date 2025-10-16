import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Check if geospatial index exists
    const indexes = await db.collection('workshops').indexes()
    console.log('Existing indexes:', indexes)
    
    // Create geospatial index if it doesn't exist
    try {
      await db.collection('workshops').createIndex(
        { 'contact.location': '2dsphere' },
        { name: 'location_2dsphere' }
      )
      console.log('Geospatial index created successfully')
    } catch (error) {
      console.log('Index might already exist:', error)
    }
    
    // Update workshops with [0,0] coordinates to Dubai coordinates
    const updateResult = await db.collection('workshops').updateMany(
      { 'contact.location.coordinates': [0, 0] },
      { 
        $set: { 
          'contact.location.coordinates': [55.3781, 25.1772] // Dubai coordinates
        }
      }
    )
    
    console.log('Updated workshops with invalid coordinates:', updateResult)
    
    return NextResponse.json({
      success: true,
      message: 'Index and coordinates fixed',
      indexes: indexes.length,
      updatedWorkshops: updateResult.modifiedCount
    })
    
  } catch (error) {
    console.error('Error fixing index:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fix index' },
      { status: 500 }
    )
  }
}
