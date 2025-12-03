import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Migration endpoint to fix stores with null or invalid theme values
 * Run this once to update existing accounts created before the theme fix
 * 
 * Usage: POST /api/migrate/fix-themes
 */
export async function POST() {
  try {
    // Update all stores with null or invalid theme to DARK
    // Note: Prisma doesn't support checking for null enum values directly,
    // so we'll update all stores that might have issues
    const allStores = await prisma.creatorStore.findMany({
      select: {
        id: true,
        theme: true,
      },
    })

    // Filter stores that need updating (null, undefined, or invalid values)
    const storesToUpdate = allStores.filter(
      (store) => store.theme !== 'LIGHT' && store.theme !== 'DARK'
    )

    if (storesToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stores need updating',
        updated: 0,
      })
    }

    // Update all stores that need fixing
    const result = await prisma.creatorStore.updateMany({
      where: {
        id: {
          in: storesToUpdate.map((s) => s.id),
        },
      },
      data: {
        theme: 'DARK',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} store(s) with invalid theme values`,
      updated: result.count,
      totalStores: allStores.length,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

