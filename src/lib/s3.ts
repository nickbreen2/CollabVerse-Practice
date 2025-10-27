import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Upload a file to S3
 * @param file - The file to upload
 * @param userId - User ID to organize uploads by user
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToS3(file: File, userId: string): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 2MB.')
  }

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()
  const fileName = `${userId}/${uuidv4()}.${fileExtension}`

  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
    // Make the file publicly readable if your bucket has public access enabled
    // ACL: 'public-read', // Uncomment if you want public access
  })

  await s3Client.send(command)

  // Return the public URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-west-1'}.amazonaws.com/${fileName}`
}

/**
 * Delete a file from S3
 * @param fileUrl - The full URL of the file to delete
 */
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  // Extract the key from the URL
  const url = new URL(fileUrl)
  const key = url.pathname.substring(1) // Remove leading slash

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Check if a file exists in S3
 * @param fileUrl - The full URL of the file to check
 */
export async function fileExistsInS3(fileUrl: string): Promise<boolean> {
  if (!BUCKET_NAME) {
    return false
  }

  try {
    const url = new URL(fileUrl)
    const key = url.pathname.substring(1)

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

