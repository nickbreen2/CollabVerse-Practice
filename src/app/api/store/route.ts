import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { StoreUpdateSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await requireAuth()

    const store = await prisma.creatorStore.findUnique({
      where: { userId: session.userId },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Get store error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Validate input
    const result = StoreUpdateSchema.safeParse(body)
    if (!result.success) {
      console.error('Validation error:', result.error.errors)
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const updateData = result.data
    
    // Log highlights update for debugging
    if (updateData.highlights) {
      console.log('Updating highlights:', JSON.stringify(updateData.highlights, null, 2))
    }

    // Update store
    const store = await prisma.creatorStore.update({
      where: { userId: session.userId },
      data: updateData,
    })

    console.log('Store updated successfully, highlights:', store.highlights)
    return NextResponse.json(store)
  } catch (error) {
    console.error('Update store error:', error)
    
    // Return more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Check for Prisma errors
      if ('code' in error) {
        console.error('Prisma error code:', (error as any).code)
      }
      
      // In development, return the actual error message
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { 
            error: error.message,
            details: error.stack 
          },
          { status: 500 }
        )
      }
    }
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

