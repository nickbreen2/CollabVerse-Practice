import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Update account status to ACTIVE and clear scheduled deletion
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        accountStatus: 'ACTIVE',
        scheduledDeletionAt: null,
      },
      select: {
        accountStatus: true,
        scheduledDeletionAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      accountStatus: user.accountStatus,
      scheduledDeletionAt: user.scheduledDeletionAt,
    })
  } catch (error) {
    console.error('Cancel deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel deletion' },
      { status: 500 }
    )
  }
}

