import { CreatorStore, Theme, AccountStatus, CollabRequest, CollabRequestStatus } from '@prisma/client'

export type { CreatorStore, Theme, AccountStatus, CollabRequest, CollabRequestStatus }

export interface SocialLink {
  network: string
  url: string
}

export interface CustomLink {
  id: string
  title: string
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
  customLinks?: CustomLink[]
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

export interface CollabRequestPayload {
  creatorId: string
  senderName: string
  brandName?: string
  senderEmail: string
  budget?: number
  description?: string
  links?: string[]
}

export interface CollabRequestResponse {
  success: boolean
  request?: CollabRequest
  error?: string
}

