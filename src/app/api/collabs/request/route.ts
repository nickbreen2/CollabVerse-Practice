import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CollabRequestSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = CollabRequestSchema.parse(body)

    // Check if creator exists
    const creator = await prisma.creatorStore.findUnique({
      where: { id: validatedData.creatorId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      )
    }

    // Create the collab request
    const collabRequest = await prisma.collabRequest.create({
      data: {
        creatorId: validatedData.creatorId,
        senderName: validatedData.senderName,
        brandName: validatedData.brandName,
        senderEmail: validatedData.senderEmail,
        budget: validatedData.budget,
        description: validatedData.description,
        links: validatedData.links || [],
        status: 'PENDING',
      },
    })

    // TODO: Send Brevo email notification
    // This is a stub for now - actual implementation will be added later
    try {
      console.log('📧 Brevo Email Notification:')
      console.log(`  To: ${creator.user.email}`)
      console.log(`  CC: ${validatedData.senderEmail}`)
      console.log(`  Subject: New Collaboration Request from ${validatedData.senderName}`)
      console.log(`  Brand: ${validatedData.brandName || 'N/A'}`)
      console.log(`  Budget: ${validatedData.budget || 'N/A'}`)
      console.log(`  Description: ${validatedData.description || 'N/A'}`)
      console.log(`  Links: ${validatedData.links?.join(', ') || 'None'}`)
      
      // When Brevo is set up, call the email service here:
      // await sendCollabRequestEmail({
      //   to: creator.user.email,
      //   cc: validatedData.senderEmail,
      //   templateId: process.env.BREVO_COLLAB_REQUEST_TEMPLATE_ID,
      //   params: {
      //     creatorName: creator.displayName,
      //     senderName: validatedData.senderName,
      //     brandName: validatedData.brandName,
      //     budget: validatedData.budget,
      //     description: validatedData.description,
      //     links: validatedData.links,
      //   },
      // })
    } catch (emailError) {
      console.warn('⚠️  Email notification failed (non-critical):', emailError)
      // Continue - don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      request: collabRequest,
    })
  } catch (error) {
    console.error('Collab request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit collaboration request',
      },
      { status: 500 }
    )
  }
}

