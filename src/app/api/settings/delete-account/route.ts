import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account does not have a password set. Cannot verify password.' },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Schedule deletion for 30 days from now
    const scheduledDeletionAt = new Date()
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30)

    // Update account status and schedule deletion
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        accountStatus: 'PENDING_DELETION',
        scheduledDeletionAt,
      },
      select: {
        accountStatus: true,
        scheduledDeletionAt: true,
      },
    })

    // Hide the storefront
    await prisma.creatorStore.updateMany({
      where: { userId: session.userId },
      data: { isPublished: false },
    })

    return NextResponse.json({
      success: true,
      accountStatus: updatedUser.accountStatus,
      scheduledDeletionAt: updatedUser.scheduledDeletionAt,
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule account deletion' },
      { status: 500 }
    )
  }
}

