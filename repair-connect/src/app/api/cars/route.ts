import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { CarProfile, CarProfileSummary, generateMediaId } from '@/models/CarProfile'
import { uploadCarPhotos } from '@/lib/cloudinary'

// GET /api/cars - Get user's cars
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only customers can view their cars
    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can view cars' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const { db } = await connectToDatabase()
    
    // Build query
    const query: Record<string, any> = { ownerId: session.user.id }
    if (status) {
      query.status = status
    }

    // Get cars with pagination
    const skip = (page - 1) * limit
    const cars = await db
      .collection('cars')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection('cars').countDocuments(query)

    // Convert to CarProfileSummary format
    const carSummaries: CarProfileSummary[] = cars.map(car => ({
      _id: car._id.toString(),
      make: car.make || car.basicInfo?.make,
      model: car.model || car.basicInfo?.model,
      year: car.year || car.basicInfo?.year,
      color: car.color || car.basicInfo?.color,
      nickname: car.nickname,
      thumbnailUrl: car.thumbnailUrl,
      totalServiceRequests: car.totalServiceRequests || 0,
      lastServiceDate: car.lastServiceDate,
      status: car.status || 'active'
    }))

    return NextResponse.json({
      success: true,
      data: {
        cars: carSummaries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Cars API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/cars - Create a new car profile
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only customers can create cars
    if (session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can create cars' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    
    // Extract basic car data
    const carData = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      color: formData.get('color') as string,
      vin: (formData.get('vin') as string) || undefined,
      licensePlate: (formData.get('licensePlate') as string) || undefined,
      mileage: formData.get('mileage') ? parseInt(formData.get('mileage') as string) : undefined,
      engineSize: (formData.get('engineSize') as string) || undefined,
      transmission: formData.get('transmission') as 'manual' | 'automatic' | 'cvt',
      fuelType: formData.get('fuelType') as 'gasoline' | 'diesel' | 'hybrid' | 'electric',
      nickname: (formData.get('nickname') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined
    }
    
    // Validate required fields
    if (!carData.make || !carData.model || !carData.year || !carData.color || !carData.transmission || !carData.fuelType) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, color, transmission, fuelType' },
        { status: 400 }
      )
    }

    const { client, db } = await connectToDatabase()

    // Handle file uploads
    const thumbnailFile = formData.get('thumbnailFile') as File | null
    const galleryFiles = formData.getAll('galleryFiles') as File[]
    
    let thumbnailUrl: string | undefined
    const gallery: any[] = []
    
    // First insert the car to get an ID for file naming
    const tempCarProfile: CarProfile = {
      ownerId: session.user.id,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      color: carData.color,
      vin: carData.vin,
      licensePlate: carData.licensePlate,
      mileage: carData.mileage,
      engineSize: carData.engineSize,
      transmission: carData.transmission,
      fuelType: carData.fuelType,
      gallery: [], // Will be updated after uploads
      nickname: carData.nickname,
      notes: carData.notes,
      status: 'active',
      totalServiceRequests: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Insert car first to get an ID
    console.log('Inserting car profile:', {
      ownerId: tempCarProfile.ownerId,
      make: tempCarProfile.make,
      model: tempCarProfile.model
    })
    const tempResult = await db.collection('cars').insertOne(tempCarProfile)
    const carId = tempResult.insertedId.toString()
    console.log('Car inserted with ID:', carId)
    
    try {
      // Upload thumbnail if provided
      if (thumbnailFile && thumbnailFile.size > 0) {
        console.log('Uploading thumbnail:', thumbnailFile.name)
        const thumbnailResults = await uploadCarPhotos([thumbnailFile], carId, 'exterior')
        if (thumbnailResults.length > 0) {
          thumbnailUrl = thumbnailResults[0].secure_url
          
          // Add to gallery as well
          gallery.push({
            id: generateMediaId(),
            url: thumbnailResults[0].secure_url,
            publicId: thumbnailResults[0].public_id,
            type: 'photo',
            category: 'exterior',
            isThumbnail: true,
            uploadedAt: new Date(),
            fileSize: thumbnailFile.size,
            dimensions: {
              width: thumbnailResults[0].width,
              height: thumbnailResults[0].height
            }
          })
        }
      }
      
      // Upload gallery files
      if (galleryFiles.length > 0) {
        console.log('Uploading gallery files:', galleryFiles.length)
        const galleryResults = await uploadCarPhotos(
          galleryFiles.filter(file => file && file.size > 0), 
          carId, 
          'exterior'
        )
        
        galleryResults.forEach((result, index) => {
          gallery.push({
            id: generateMediaId(),
            url: result.secure_url,
            publicId: result.public_id,
            type: 'photo',
            category: 'exterior',
            isThumbnail: false,
            uploadedAt: new Date(),
            fileSize: galleryFiles[index]?.size || 0,
            dimensions: {
              width: result.width,
              height: result.height
            }
          })
        })
      }
      
      // Update car with uploaded images
      await db.collection('cars').updateOne(
        { _id: tempResult.insertedId },
        {
          $set: {
            thumbnailUrl,
            gallery,
            updatedAt: new Date()
          }
        }
      )
      
    } catch (uploadError) {
      console.error('Error uploading files:', uploadError)
      // Continue without images rather than failing completely
    }

    // Get the final created car
    const createdCar = await db.collection('cars').findOne({ _id: tempResult.insertedId })

    return NextResponse.json({
      success: true,
      message: 'Car profile created successfully',
      data: createdCar,
    }, { status: 201 })
  } catch (error) {
    console.error('Create car API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
