import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CollabRequestSchema } from '@/lib/validations'
import { extractEmailDomain } from '@/lib/brandfetch'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received collab request:', JSON.stringify(body, null, 2))
    console.log('🔗 Links in raw body:', body.links)
    console.log('🔗 Links type:', typeof body.links)
    console.log('🔗 Links is array:', Array.isArray(body.links))
    console.log('🔗 Links length:', Array.isArray(body.links) ? body.links.length : 'N/A')

    // Validate the request body
    let validatedData
    try {
      validatedData = CollabRequestSchema.parse(body)
      console.log('✅ Validated data:', JSON.stringify(validatedData, null, 2))
      console.log('🔗 Links after validation:', validatedData.links)
      console.log('🔗 Links type after validation:', typeof validatedData.links)
      console.log('🔗 Links is array after validation:', Array.isArray(validatedData.links))
      console.log('🔗 Links length after validation:', Array.isArray(validatedData.links) ? validatedData.links.length : 'N/A')
    } catch (validationError) {
      console.error('❌ Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('Validation errors:', JSON.stringify(validationError.errors, null, 2))
      }
      throw validationError
    }

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

    // Extract email domain
    const emailDomain = extractEmailDomain(validatedData.senderEmail)

    // Ensure links is always an array (validation transform should handle this, but double-check)
    const linksArray = Array.isArray(validatedData.links) 
      ? validatedData.links.filter(link => {
          if (!link || typeof link !== 'string') return false
          const trimmed = link.trim()
          // Ensure it's a valid URL format
          return trimmed !== '' && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
        })
      : []
    
    console.log('🔗 Links to save:', linksArray)
    console.log('🔗 Links count to save:', linksArray.length)
    if (linksArray.length > 0) {
      console.log('🔗 Each link to save:', linksArray.map((link, i) => `${i + 1}. ${link}`))
    }

    // Create the collab request
    const collabRequest = await prisma.collabRequest.create({
      data: {
        creatorId: validatedData.creatorId,
        senderName: validatedData.senderName,
        brandName: validatedData.brandName || null,
        senderEmail: validatedData.senderEmail,
        emailDomain: emailDomain || null, // Store extracted domain for Brandfetch logo lookup
        budget: validatedData.budget ? Number(validatedData.budget) : null,
        description: validatedData.description || null,
        links: linksArray,
        status: 'PENDING',
      },
    })
    
    console.log('💾 Saved collab request with links:', {
      id: collabRequest.id,
      links: collabRequest.links,
      linksCount: collabRequest.links?.length || 0
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
    console.error('❌ Collab request error:', error)

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit collaboration request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

