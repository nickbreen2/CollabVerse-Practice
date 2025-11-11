import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ handle: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { handle } = await context.params

    // Get the store by handle
    const store = await prisma.creatorStore.findUnique({
      where: { handle },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Check if this is the owner viewing their own store
    const session = await getSession()
    const isSelfView = session.isLoggedIn && session.userId === store.userId

    return NextResponse.json({
      ...store,
      isSelfView,
    })
  } catch (error) {
    console.error('Get public store error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

