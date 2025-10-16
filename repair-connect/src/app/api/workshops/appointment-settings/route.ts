import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
  AppointmentSettings,
  createDefaultAppointmentSettings
} from '@/models/AppointmentSettings'

// GET /api/workshops/appointment-settings - Get workshop's appointment settings
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

    // Try to find existing settings
    let settings = await db.collection('appointmentSettings').findOne({
      workshopId: new ObjectId(session.user.id)
    }) as AppointmentSettings | null

    // If no settings exist, create default ones
    if (!settings) {
      const defaultSettings = createDefaultAppointmentSettings(new ObjectId(session.user.id))
      const result = await db.collection('appointmentSettings').insertOne(defaultSettings)

      settings = await db.collection('appointmentSettings').findOne({
        _id: result.insertedId
      }) as AppointmentSettings
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        _id: settings._id?.toString(),
        workshopId: settings.workshopId.toString()
      }
    })

  } catch (error) {
    console.error('Error fetching appointment settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointment settings' },
      { status: 500 }
    )
  }
}

// PUT /api/workshops/appointment-settings - Update workshop's appointment settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'workshop') {
      return NextResponse.json(
        { success: false, error: 'Workshop authentication required' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    // Validate required fields
    const updateData: Partial<AppointmentSettings> = {
      ...body,
      workshopId: new ObjectId(session.user.id),
      updatedAt: new Date()
    }

    // Remove any fields that shouldn't be updated directly
    delete (updateData as any)._id
    delete (updateData as any).createdAt

    // Update or create settings
    const result = await db.collection('appointmentSettings').updateOne(
      { workshopId: new ObjectId(session.user.id) },
      {
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    )

    // Get the updated settings
    const updatedSettings = await db.collection('appointmentSettings').findOne({
      workshopId: new ObjectId(session.user.id)
    })

    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSettings,
        _id: updatedSettings._id.toString(),
        workshopId: updatedSettings.workshopId.toString()
      }
    })

  } catch (error) {
    console.error('Error updating appointment settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment settings' },
      { status: 500 }
    )
  }
}