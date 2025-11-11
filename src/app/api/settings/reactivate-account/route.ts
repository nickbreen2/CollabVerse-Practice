import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Update account status to ACTIVE
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { accountStatus: 'ACTIVE' },
      select: { accountStatus: true },
    })

    return NextResponse.json({
      success: true,
      accountStatus: user.accountStatus,
    })
  } catch (error) {
    console.error('Reactivate account error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    )
  }
}

