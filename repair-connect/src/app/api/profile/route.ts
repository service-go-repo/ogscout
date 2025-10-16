import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schemas
const customerProfileUpdateSchema = z.object({
  profile: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'sms']).optional(),
  }).optional(),
})

const workshopProfileUpdateSchema = z.object({
  ownerInfo: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { password: 0 } } // Exclude password
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    // Get current user
    const currentUser = await db.collection('users').findOne({
      email: session.user.email
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    let updateData: any = {
      updatedAt: new Date(),
    }

    // Validate and prepare update based on user role
    if (currentUser.role === 'customer') {
      const validation = customerProfileUpdateSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid data', details: validation.error.errors },
          { status: 400 }
        )
      }

      if (body.profile) {
        updateData['profile'] = {
          ...currentUser.profile,
          ...body.profile,
        }
      }

      if (body.preferences) {
        updateData['preferences'] = {
          ...currentUser.preferences,
          ...body.preferences,
          notifications: {
            ...currentUser.preferences?.notifications,
            ...body.preferences?.notifications,
          }
        }
      }
    } else if (currentUser.role === 'workshop') {
      const validation = workshopProfileUpdateSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid data', details: validation.error.errors },
          { status: 400 }
        )
      }

      if (body.ownerInfo) {
        updateData['ownerInfo'] = {
          ...currentUser.ownerInfo,
          ...body.ownerInfo,
        }
      }
    }

    // Update user in database
    const result = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
