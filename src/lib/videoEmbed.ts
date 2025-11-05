/**
 * Utility functions for handling video embeds from various platforms
 */

export function getVideoEmbedUrl(url: string): string | null {
  try {
    // YouTube - support for various URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^&\n?#]+)/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
    
    // TikTok - extract video ID
    const tiktokRegex = /tiktok\.com\/@[\w.]+\/video\/(\d+)/
    const tiktokMatch = url.match(tiktokRegex)
    if (tiktokMatch && tiktokMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`
    }
    
    // Instagram - support for posts and reels
    const instagramRegex = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/
    const instagramMatch = url.match(instagramRegex)
    if (instagramMatch && instagramMatch[1]) {
      return `https://www.instagram.com/p/${instagramMatch[1]}/embed/`
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    
    return null
  } catch (error) {
    console.error('Error parsing video URL:', error)
    return null
  }
}

export function detectVideoPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'unknown' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'unknown'
}

export function isValidVideoUrl(url: string): boolean {
  const embedUrl = getVideoEmbedUrl(url)
  return embedUrl !== null
}

export function getVideoPlatformName(url: string): string {
  const platform = detectVideoPlatform(url)
  switch (platform) {
    case 'youtube':
      return 'YouTube'
    case 'tiktok':
      return 'TikTok'
    case 'instagram':
      return 'Instagram'
    case 'vimeo':
      return 'Vimeo'
    default:
      return 'Video'
  }
}

export function getVideoUrlFormatHint(url: string): string | null {
  const platform = detectVideoPlatform(url)
  
  switch (platform) {
    case 'tiktok':
      if (!url.includes('/video/')) {
        return 'TikTok URLs must be for a specific video. Format: tiktok.com/@username/video/VIDEO_ID'
      }
      break
    case 'instagram':
      if (!url.includes('/p/') && !url.includes('/reel/')) {
        return 'Instagram URLs must be for a specific post or reel. Format: instagram.com/p/ID or instagram.com/reel/ID'
      }
      break
    case 'youtube':
      if (!url.includes('watch?v=') && !url.includes('youtu.be/') && !url.includes('/embed/') && !url.includes('/v/')) {
        return 'YouTube URLs must be for a specific video. Format: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID'
      }
      break
    case 'vimeo':
      if (!/vimeo\.com\/\d+/.test(url)) {
        return 'Vimeo URLs must include a video ID. Format: vimeo.com/VIDEO_ID'
      }
      break
  }
  return null
}

