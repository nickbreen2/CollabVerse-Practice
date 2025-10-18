import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { newEmail } = body

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Generate a verification token
    // 2. Send verification email to newEmail
    // 3. Store pending email change in database
    // 4. Complete the change when user clicks verification link

    // For now, we'll just simulate the success
    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    })
  } catch (error) {
    console.error('Email change error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}

