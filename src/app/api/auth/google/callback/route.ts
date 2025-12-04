import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'

const RESERVED_HANDLES = [
  'admin', 'api', 'login', 'signup', 'dashboard', 'collablink', 
  'www', 'auth', 'signin', 'signout'
];

// Generate a handle from email
function generateHandleFromEmail(email: string): string {
  const localPart = email.split('@')[0].toLowerCase()
  // Remove non-alphanumeric characters, keep only letters, numbers, and hyphens
  let handle = localPart.replace(/[^a-z0-9-]/g, '')
  // Remove leading/trailing hyphens
  handle = handle.replace(/^-+|-+$/g, '')
  // Ensure it's at least 3 characters
  if (handle.length < 3) {
    handle = handle + '123'
  }
  // Truncate to 30 characters max
  if (handle.length > 30) {
    handle = handle.substring(0, 30)
  }
  return handle
}

export async function GET(request: NextRequest) {
  // Use environment variable if set, otherwise fall back to request origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || request.nextUrl.origin
  const origin = baseUrl.replace(/\/+$/, '')
  
  try {
    console.log('🔵 Google OAuth callback started')
    
    const redirectUri = `${origin}/api/auth/google/callback`
    console.log('🔵 Redirect URI:', redirectUri)
    
    // Check if environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('❌ Missing Google OAuth credentials')
      return NextResponse.redirect(`${origin}/auth/sign-in?error=config_error`)
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      console.error('❌ No code received from Google')
      return NextResponse.redirect(`${origin}/auth/sign-in?error=no_code`)
    }

    console.log('🔵 Code received, exchanging for tokens...')

    // Exchange code for tokens
    let tokens
    try {
      const tokenResponse = await client.getToken(code)
      tokens = tokenResponse.tokens
      console.log('✅ Tokens received')
    } catch (tokenError) {
      console.error('❌ Token exchange failed:', tokenError)
      if (tokenError instanceof Error) {
        console.error('Token error message:', tokenError.message)
      }
      return NextResponse.redirect(`${origin}/auth/sign-in?error=token_exchange_failed`)
    }
    
    if (!tokens.id_token) {
      console.error('❌ No ID token received from Google')
      return NextResponse.redirect(`${origin}/auth/sign-in?error=no_token`)
    }

    client.setCredentials(tokens)

    console.log('🔵 Verifying ID token...')

    // Get user info from Google
    let ticket
    try {
      ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      console.log('✅ ID token verified')
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError)
      if (verifyError instanceof Error) {
        console.error('Verify error message:', verifyError.message)
      }
      return NextResponse.redirect(`${origin}/auth/sign-in?error=token_verification_failed`)
    }

    const payload = ticket.getPayload()
    if (!payload) {
      console.error('❌ Invalid token payload from Google')
      return NextResponse.redirect(`${origin}/auth/sign-in?error=invalid_token`)
    }

    const { email, name, picture, sub: googleId } = payload
    console.log('🔵 User email from Google:', email)

    if (!email) {
      console.error('❌ No email in Google payload')
      return NextResponse.redirect(`${origin}/auth/sign-in?error=no_email`)
    }

    // Normalize email to lowercase (like sign-up does)
    const normalizedEmail = email.trim().toLowerCase()
    console.log('🔵 Normalized email:', normalizedEmail)

    console.log('🔵 Looking up user in database...')

    // Find or create user
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { store: true },
      })

      if (!user) {
        console.log('🔵 User not found, creating new user...')
        
        // Generate a unique handle
        let baseHandle = generateHandleFromEmail(normalizedEmail)
        let handle = baseHandle
        let handleSuffix = 1
        
        // Ensure handle is unique and not reserved
        while (true) {
          const existingStore = await prisma.creatorStore.findUnique({
            where: { handle },
          })
          
          if (!existingStore && !RESERVED_HANDLES.includes(handle)) {
            break
          }
          
          handle = `${baseHandle}${handleSuffix}`
          handleSuffix++
          
          // Safety check to prevent infinite loop
          if (handleSuffix > 1000) {
            handle = `${baseHandle}-${Date.now()}`
            break
          }
        }
        
        console.log('🔵 Generated handle:', handle)
        
        // Create user and store in a transaction (like sign-up does)
        user = await prisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: normalizedEmail,
              name: name || null,
              googleId,
              provider: 'google',
              emailVerified: true,
              passwordHash: null,
            },
          })
          
          await tx.creatorStore.create({
            data: {
              userId: u.id,
              handle,
              displayName: name || normalizedEmail.split('@')[0],
              avatarUrl: '/icons/default profile image.png',
              theme: 'DARK',
              social: undefined, // Explicitly set to undefined to match regular sign-up behavior
            },
          })
          
          return tx.user.findUnique({
            where: { id: u.id },
            include: { store: true },
          })
        })
        
        console.log('✅ New user and store created:', user?.id)
      } else {
        console.log('🔵 User found, linking Google account...')
        // Link Google account to existing user if not already linked
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              provider: 'google',
              emailVerified: true,
            },
            include: { store: true },
          })
          console.log('✅ Google account linked')
        } else {
          console.log('✅ Google account already linked')
        }
      }
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError)
      if (dbError instanceof Error) {
        console.error('DB error message:', dbError.message)
        console.error('DB error stack:', dbError.stack)
        
        // Handle Prisma unique constraint violation
        if (dbError instanceof PrismaClientKnownRequestError && dbError.code === 'P2002') {
          const target = Array.isArray(dbError.meta?.target) 
            ? dbError.meta.target[0] 
            : dbError.meta?.target
          
          if (target === 'email') {
            console.error('Email already exists, trying to link account...')
            // Try to find and link the account
            try {
              user = await prisma.user.findUnique({
                where: { email: normalizedEmail },
                include: { store: true },
              })
              if (user && !user.googleId) {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    googleId,
                    provider: 'google',
                    emailVerified: true,
                  },
                  include: { store: true },
                })
                console.log('✅ Account linked after conflict')
              } else {
                return NextResponse.redirect(`${origin}/auth/sign-in?error=email_exists`)
              }
            } catch (linkError) {
              return NextResponse.redirect(`${origin}/auth/sign-in?error=link_failed`)
            }
          } else {
            return NextResponse.redirect(`${origin}/auth/sign-in?error=handle_exists`)
          }
        } else {
          // In development, show the actual error
          if (process.env.NODE_ENV === 'development') {
            return NextResponse.json(
              {
                error: 'Database error',
                message: dbError.message,
                code: dbError instanceof PrismaClientKnownRequestError ? dbError.code : undefined,
                meta: dbError instanceof PrismaClientKnownRequestError ? dbError.meta : undefined,
              },
              { status: 500 }
            )
          }
          return NextResponse.redirect(`${origin}/auth/sign-in?error=db_error`)
        }
      } else {
        return NextResponse.redirect(`${origin}/auth/sign-in?error=db_error`)
      }
    }

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/sign-in?error=user_creation_failed`)
    }

    console.log('🔵 Creating session...')

    // Create session
    try {
      const session = await getSession()
      session.userId = user.id
      session.email = user.email
      session.isLoggedIn = true
      await session.save()
      console.log('✅ Session created')
    } catch (sessionError) {
      console.error('❌ Session creation failed:', sessionError)
      if (sessionError instanceof Error) {
        console.error('Session error message:', sessionError.message)
      }
      return NextResponse.redirect(`${origin}/auth/sign-in?error=session_error`)
    }

    console.log('✅ OAuth flow completed successfully, redirecting to dashboard')
    return NextResponse.redirect(`${origin}/dashboard/my-store`)
  } catch (error) {
    console.error('❌ Google OAuth error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // In development, return the error details for debugging
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          {
            error: 'OAuth callback failed',
            message: error.message,
            stack: error.stack,
          },
          { status: 500 }
        )
      }
    }
    return NextResponse.redirect(`${origin}/auth/sign-in?error=oauth_failed`)
  }
}

