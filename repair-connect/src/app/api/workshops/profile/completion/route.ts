import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const workshopsCollection = db.collection('workshops')
    
    // Find workshop profile
    const workshop = await workshopsCollection.findOne({
      userId: new ObjectId(session.user.id)
    })

    if (!workshop) {
      return NextResponse.json({
        success: true,
        data: {
          isComplete: false,
          completionPercentage: 0,
          missingFields: ['profile_not_found'],
          profileExists: false
        }
      })
    }

    // Check profile completion
    const completionStatus = calculateProfileCompletion(workshop)

    return NextResponse.json({
      success: true,
      data: {
        ...completionStatus,
        profileExists: true
      }
    })

  } catch (error) {
    console.error('Error checking profile completion:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateProfileCompletion(workshop: any) {
  const requiredFields = [
    // Business Information
    { key: 'profile.businessName', weight: 10, label: 'Business Name' },
    { key: 'profile.description', weight: 10, label: 'Business Description' },
    
    // Contact Information
    { key: 'contact.phone', weight: 10, label: 'Phone Number' },
    { key: 'contact.email', weight: 10, label: 'Email Address' },
    { key: 'contact.address', weight: 10, label: 'Business Address' },
    
    // Specializations
    { key: 'profile.specializations.serviceTypes', weight: 15, label: 'Service Types' },
    { key: 'profile.specializations.carBrands', weight: 10, label: 'Car Brands' },
    
    // Operating Hours
    { key: 'profile.operatingHours', weight: 10, label: 'Operating Hours' },
    
    // Business Details
    { key: 'profile.yearEstablished', weight: 5, label: 'Year Established' },
    { key: 'profile.employeeCount', weight: 5, label: 'Employee Count' },
    
    // Optional but recommended
    { key: 'profile.logo', weight: 5, label: 'Business Logo' },
    { key: 'contact.website', weight: 5, label: 'Website' },
    { key: 'profile.features', weight: 5, label: 'Business Features' }
  ]

  let totalWeight = 0
  let completedWeight = 0
  const missingFields: string[] = []

  requiredFields.forEach(field => {
    totalWeight += field.weight
    const value = getNestedValue(workshop, field.key)
    
    if (isFieldComplete(value, field.key)) {
      completedWeight += field.weight
    } else {
      missingFields.push(field.label)
    }
  })

  const completionPercentage = Math.round((completedWeight / totalWeight) * 100)
  const isComplete = completionPercentage >= 80 // Consider 80% as "complete enough"

  return {
    isComplete,
    completionPercentage,
    missingFields
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

function isFieldComplete(value: any, fieldKey: string): boolean {
  if (value === null || value === undefined) return false
  
  // String fields
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  
  // Number fields
  if (typeof value === 'number') {
    return value > 0
  }
  
  // Array fields (specializations, features)
  if (Array.isArray(value)) {
    if (fieldKey.includes('serviceTypes') || fieldKey.includes('carBrands')) {
      return value.length > 0 && !value.every(item => item === 'other')
    }
    return value.length > 0
  }
  
  // Operating hours - check if at least some days are configured
  if (fieldKey === 'profile.operatingHours' && Array.isArray(value)) {
    return value.some(day => 
      !day.isClosed && day.openTime && day.closeTime
    )
  }
  
  // Object fields (address)
  if (typeof value === 'object' && value !== null) {
    if (fieldKey === 'contact.address') {
      return value.street && value.city && value.state && value.zipCode
    }
    return Object.keys(value).length > 0
  }
  
  return false
}
