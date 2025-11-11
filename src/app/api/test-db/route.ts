import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count()
    const storeCount = await prisma.creatorStore.count()
    const collabCount = await prisma.collabRequest.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        users: userCount,
        stores: storeCount,
        collabRequests: collabCount,
      },
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
      },
      { status: 500 }
    )
  }
}

