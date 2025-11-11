import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadFileToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload to S3
    const url = await uploadFileToS3(file, session.userId)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Handle specific S3 errors
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
