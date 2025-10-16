import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    
    // Get all workshops with basic info
    const workshops = await db.collection('workshops').find({
      isActive: true
    }).project({
      'profile.businessName': 1,
      'contact.address': 1,
      'contact.location': 1,
      'isActive': 1,
      'createdAt': 1
    }).sort({ createdAt: -1 }).limit(10).toArray()
    
    return NextResponse.json({
      success: true,
      count: workshops.length,
      workshops: workshops.map(workshop => ({
        id: workshop._id.toString(),
        businessName: workshop.profile?.businessName || 'Unknown',
        address: workshop.contact?.address || 'No address',
        location: workshop.contact?.location || 'No location',
        isActive: workshop.isActive,
        createdAt: workshop.createdAt
      }))
    })
    
  } catch (error) {
    console.error('Error listing workshops:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list workshops' },
      { status: 500 }
    )
  }
}
