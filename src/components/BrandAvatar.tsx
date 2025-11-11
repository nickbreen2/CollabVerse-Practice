'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { getBrandfetchLogoUrl, extractEmailDomain, isGenericEmailProvider } from '@/lib/brandfetch'

interface BrandAvatarProps {
  brandName?: string | null
  senderName?: string
  email?: string
  emailDomain?: string | null  // NEW: Email domain for Brandfetch lookup
  size?: number
  className?: string
}

/**
 * Generate deterministic color from string (like Gmail)
 * Returns a color that's consistent for the same input
 */
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate a color with good contrast
  // Using HSL for better color control
  const hue = Math.abs(hash) % 360
  const saturation = 65 + (Math.abs(hash) % 20) // 65-85%
  const lightness = 50 + (Math.abs(hash) % 15)   // 50-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Get first letter for monogram
 */
function getInitial(brandName?: string | null, senderName?: string, email?: string): string {
  if (brandName) return brandName.charAt(0).toUpperCase()
  if (senderName) return senderName.charAt(0).toUpperCase()
  if (email) return email.charAt(0).toUpperCase()
  return '?'
}

/**
 * Get the display name for color generation
 */
function getDisplayName(brandName?: string | null, senderName?: string, email?: string): string {
  return brandName || senderName || email || 'Unknown'
}

export default function BrandAvatar({
  brandName,
  senderName,
  email,
  emailDomain,  // NEW prop
  size = 48,
  className = ''
}: BrandAvatarProps) {
  const initial = getInitial(brandName, senderName, email)
  const displayName = getDisplayName(brandName, senderName, email)
  const backgroundColor = stringToColor(displayName)
  
  // Fallback: Extract domain from email if emailDomain is not provided
  // This handles cases where requests were created before emailDomain was added
  const domain = emailDomain || (email ? extractEmailDomain(email) : null)
  
  // Check if domain is a generic email provider (gmail, yahoo, etc.)
  const isGenericProvider = domain ? isGenericEmailProvider(domain) : false
  
  // Only try Brandfetch for company domains (not generic email providers)
  const brandfetchLogoUrl = useMemo(() => {
    if (!domain || isGenericProvider) {
      return null // Skip Brandfetch for generic providers
    }
    return getBrandfetchLogoUrl(domain)
  }, [domain, isGenericProvider])
  
  const [logoValid, setLogoValid] = useState(false) // Only true after validation passes
  const [logoLoading, setLogoLoading] = useState(!!brandfetchLogoUrl)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Reset state when URL changes
  const prevUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (brandfetchLogoUrl && brandfetchLogoUrl !== prevUrlRef.current) {
      prevUrlRef.current = brandfetchLogoUrl
      setLogoValid(false) // Start as invalid until proven otherwise
      setLogoLoading(true)
    } else if (!brandfetchLogoUrl) {
      prevUrlRef.current = null
      setLogoValid(false)
      setLogoLoading(false)
    }
  }, [brandfetchLogoUrl])

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 relative overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: backgroundColor, // Always show background
        fontSize: size * 0.4,
        minWidth: size,
        minHeight: size
      }}
      aria-label={displayName}
    >
      {/* Always show monogram first */}
      <span 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1 }}
      >
        {initial}
      </span>
      
      {/* Only render and show logo if it's validated as valid */}
      {brandfetchLogoUrl && (
        <>
          {/* Hidden image to validate dimensions */}
          <img
            ref={imageRef}
            src={brandfetchLogoUrl}
            alt=""
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
              zIndex: -1
            }}
            onLoad={(e) => {
              const img = e.currentTarget
              const naturalWidth = img.naturalWidth
              const naturalHeight = img.naturalHeight
              
              console.log('🔍 Image loaded:', { width: naturalWidth, height: naturalHeight, domain })
              
              // Only mark as valid if NOT a 1x1 placeholder
              if (naturalWidth === 1 && naturalHeight === 1) {
                console.log('❌ Placeholder detected (1x1):', { domain })
                setLogoValid(false)
                setLogoLoading(false)
              } else {
                console.log('✅ Valid logo confirmed:', { width: naturalWidth, height: naturalHeight, domain })
                setLogoValid(true)
                setLogoLoading(false)
              }
            }}
            onError={() => {
              console.log('❌ Image load error:', { domain })
              setLogoValid(false)
              setLogoLoading(false)
            }}
          />
          
          {/* Show actual logo only if validated */}
          {logoValid && (
            <Image
              src={brandfetchLogoUrl}
              alt={displayName}
              fill
              className="object-cover"
              style={{
                position: 'absolute',
                zIndex: 2,
              }}
              unoptimized
            />
          )}
        </>
      )}
    </div>
  )
}

