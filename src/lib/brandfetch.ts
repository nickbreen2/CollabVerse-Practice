2/**
 * List of common generic email provider domains
 * These should skip Brandfetch lookup and use monogram instead
 */
const GENERIC_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'yandex.com',
  'zoho.com',
  'gmx.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com'
]

/**
 * Check if a domain is a generic email provider
 * @param domain - Email domain (e.g., "gmail.com")
 * @returns true if it's a generic email provider
 */
export function isGenericEmailProvider(domain: string | null): boolean {
  if (!domain || typeof domain !== 'string') return false
  
  const normalizedDomain = domain.trim().toLowerCase().replace(/^www\./, '')
  return GENERIC_EMAIL_PROVIDERS.includes(normalizedDomain)
}

/**
 * Extract normalized email domain from email address
 * @param email - Email address (e.g., "john@nike.com")
 * @returns Normalized domain (e.g., "nike.com") or null if invalid
 */
export function extractEmailDomain(email: string): string | null {
  if (!email || typeof email !== 'string') return null
  
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/
  const match = trimmed.match(emailRegex)
  
  if (!match || !match[1]) return null
  
  const domain = match[1]
  
  // Remove 'www.' prefix if present
  return domain.replace(/^www\./, '')
}

/**
 * Generate Brandfetch CDN logo URL for a domain
 * @param domain - Normalized domain (e.g., "nike.com")
 * @param clientId - Brandfetch client ID (optional, will use env var if not provided)
 * @returns Brandfetch CDN URL or null if domain is invalid
 */
export function getBrandfetchLogoUrl(domain: string | null, clientId?: string): string | null {
  if (!domain || typeof domain !== 'string') return null
  
  const normalizedDomain = domain.trim().toLowerCase().replace(/^www\./, '')
  if (!normalizedDomain) return null
  
  const brandfetchClientId = clientId || process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || ''
  
  if (!brandfetchClientId) {
    console.warn('⚠️ Brandfetch client ID not configured')
    return null
  }
  
  // Correct Brandfetch CDN format: https://cdn.brandfetch.io/{domain}/w/400/h/400?c={clientId}
  const logoUrl = `https://cdn.brandfetch.io/${normalizedDomain}/w/400/h/400?c=${brandfetchClientId}`
  
  return logoUrl
}
