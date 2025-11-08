'use client'

interface BrandAvatarProps {
  brandName?: string | null
  senderName?: string
  email?: string
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
  size = 48,
  className = ''
}: BrandAvatarProps) {
  const initial = getInitial(brandName, senderName, email)
  const displayName = getDisplayName(brandName, senderName, email)
  const backgroundColor = stringToColor(displayName)

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.4,
        minWidth: size,
        minHeight: size
      }}
      aria-label={displayName}
    >
      {initial}
    </div>
  )
}

