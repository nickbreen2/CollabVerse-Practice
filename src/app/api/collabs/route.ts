import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()

    // Get the user's store
    const store = await prisma.creatorStore.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Fetch collab requests for this creator
    // Show pinned requests first, then by date
    const requests = await prisma.collabRequest.findMany({
      where: {
        creatorId: store.id,
      },
      orderBy: [
        { pinned: 'desc' },  // Pinned requests first
        { createdAt: 'desc' }, // Then by date
      ],
    })

    // Debug: Log links for each request
    console.log('📋 Fetched collab requests:', requests.map(r => ({
      id: r.id,
      senderName: r.senderName,
      links: r.links,
      linksType: typeof r.links,
      linksIsArray: Array.isArray(r.links),
      linksLength: Array.isArray(r.links) ? r.links.length : 'N/A'
    })))

    // Get counts by status
    const pending = requests.filter((r) => r.status === 'PENDING').length
    const accepted = requests.filter((r) => r.status === 'ACCEPTED').length
    const total = requests.length

    return NextResponse.json({
      requests,
      stats: {
        pending,
        accepted,
        total,
      },
    })
  } catch (error) {
    console.error('Get collabs error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}

