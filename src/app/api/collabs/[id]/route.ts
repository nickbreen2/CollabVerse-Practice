import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// DELETE - Delete a collab request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the request belongs to this creator
    const collabRequest = await prisma.collabRequest.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    })

    if (!collabRequest) {
      return NextResponse.json(
        { error: 'Collab request not found' },
        { status: 404 }
      )
    }

    if (collabRequest.creatorId !== store.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the request
    await prisma.collabRequest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete collab request error:', error)
    return NextResponse.json(
      { error: 'Failed to delete collab request' },
      { status: 500 }
    )
  }
}

// PATCH - Toggle pin status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the request belongs to this creator
    const collabRequest = await prisma.collabRequest.findUnique({
      where: { id: params.id },
      select: { creatorId: true, pinned: true },
    })

    if (!collabRequest) {
      return NextResponse.json(
        { error: 'Collab request not found' },
        { status: 404 }
      )
    }

    if (collabRequest.creatorId !== store.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Toggle pin status
    const updated = await prisma.collabRequest.update({
      where: { id: params.id },
      data: { pinned: !collabRequest.pinned },
    })

    return NextResponse.json({ 
      success: true, 
      pinned: updated.pinned 
    })
  } catch (error) {
    console.error('Toggle pin error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle pin status' },
      { status: 500 }
    )
  }
}

