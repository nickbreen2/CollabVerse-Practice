import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            emailVerificationToken: token,
          },
          {
            pendingEmailToken: token,
            pendingEmailExpires: {
              gt: new Date(),
            },
          },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // If it's a pending email change
    if (user.pendingEmailToken === token && user.pendingEmail) {
      // Update email
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.pendingEmail,
          pendingEmail: null,
          pendingEmailToken: null,
          pendingEmailExpires: null,
          emailVerified: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Email verified and updated successfully',
      })
    }

    // If it's initial email verification
    if (user.emailVerificationToken === token) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

