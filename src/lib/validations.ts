import { z } from 'zod'

// URL normalization helper
function normalizeUrl(value: string): string {
  // Step 1: Trim whitespace
  value = value.trim()
  
  // Step 2: Check if it already has a valid scheme
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  
  // Step 3: Check for other known schemes (leave as is)
  if (/^(mailto|tel|ftp|ftps|chrome-extension|file):/i.test(value)) {
    return value
  }
  
  // Step 4: Protocol-relative URL (starts with //)
  if (value.startsWith('//')) {
    return 'https:' + value
  }
  
  // Step 5: No scheme detected, prefix with https://
  return 'https://' + value
}

export const HandleSchema = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, 'Handle must be at most 30 characters')
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Handle can only contain lowercase letters, numbers, and hyphens (not at start/end)')

export const RESERVED_HANDLES = [
  'admin',
  'api',
  'login',
  'signup',
  'dashboard',
  'collabverse',
  'www',
  'auth',
  'signin',
  'signout',
]

export const SignUpSchema = z.object({
  email: z.string().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  handle: HandleSchema.transform(val => val.toLowerCase()),
})

export const SignInSchema = z.object({
  email: z.string().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const StoreUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  location: z.string().max(60).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  theme: z.enum(['LIGHT', 'DARK']).optional(),
  social: z
    .array(
      z.object({
        network: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  categories: z.array(z.string()).max(5, 'Maximum 5 categories allowed').optional(),
  customLinks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(100),
        url: z.string().transform(normalizeUrl).pipe(z.string().url()),
        visible: z.boolean(),
      })
    )
    .optional(),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type StoreUpdateInput = z.infer<typeof StoreUpdateSchema>

export const CollabRequestSchema = z.object({
  creatorId: z.string(),
  senderName: z.string().min(1, 'Full name is required').max(100),
  brandName: z.string().max(100).optional(),
  senderEmail: z.string().email('Invalid email address'),
  budget: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined
      const num = parseFloat(val.replace(/[^0-9.]/g, ''))
      return isNaN(num) ? undefined : num
    }),
  description: z.string().max(1000).optional(),
  links: z
    .array(z.string().transform(normalizeUrl).pipe(z.string().url()))
    .max(5, 'Maximum 5 links allowed')
    .optional(),
})

export type CollabRequestInput = z.infer<typeof CollabRequestSchema>

