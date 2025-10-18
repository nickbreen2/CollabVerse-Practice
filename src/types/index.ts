import { CreatorStore, Theme, AccountStatus } from '@prisma/client'

export type { CreatorStore, Theme, AccountStatus }

export interface SocialLink {
  network: string
  url: string
}

export interface StoreUpdatePayload {
  displayName?: string
  location?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  theme?: Theme
  social?: SocialLink[]
  categories?: string[]
}

export interface User {
  id: string
  email: string
  handle?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

export interface UploadResponse {
  url: string
  error?: string
}

