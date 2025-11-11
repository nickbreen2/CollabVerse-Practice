import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Update account status to PAUSED
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { accountStatus: 'PAUSED' },
      select: { accountStatus: true },
    })

    // Hide the storefront
    await prisma.creatorStore.updateMany({
      where: { userId: session.userId },
      data: { isPublished: false },
    })

    return NextResponse.json({
      success: true,
      accountStatus: user.accountStatus,
    })
  } catch (error) {
    console.error('Pause account error:', error)
    return NextResponse.json(
      { error: 'Failed to pause account' },
      { status: 500 }
    )
  }
}

