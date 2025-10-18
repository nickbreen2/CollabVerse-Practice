import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { displayName, username, birthDate, location } = body

    // Validate username format if provided
    if (username) {
      const usernameRegex = /^[a-z0-9_]{3,20}$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: 'Invalid username format' },
          { status: 400 }
        )
      }

      // Check if username is already taken (excluding current user)
      const existingStore = await prisma.creatorStore.findFirst({
        where: {
          handle: username,
          userId: { not: session.userId },
        },
      })

      if (existingStore) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Validate birth date if provided
    if (birthDate) {
      const date = new Date(birthDate)
      if (date > new Date()) {
        return NextResponse.json(
          { error: 'Birth date cannot be in the future' },
          { status: 400 }
        )
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    })

    // Update or create store with displayName, username and location
    const store = await prisma.creatorStore.findUnique({
      where: { userId: session.userId },
    })

    if (store) {
      await prisma.creatorStore.update({
        where: { userId: session.userId },
        data: {
          displayName: displayName || null,
          handle: username || store.handle,
          location: location || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

