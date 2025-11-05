// Detect platform from URL and return the icon name
export function detectPlatformFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    // Also check the full URL string for platform indicators (handles profile URLs and malformed URLs)
    const fullUrl = url.toLowerCase()
    
    // Helper function to check if hostname or full URL contains platform indicator
    const matchesPlatform = (domain: string, platformName?: string) => {
      if (hostname.includes(domain) || fullUrl.includes(domain)) return true
      // Also check for just the platform name (e.g., "tiktok" without .com)
      if (platformName) {
        const baseName = platformName.toLowerCase()
        // Check if hostname starts with platform name (for cases like "tiktok" instead of "tiktok.com")
        if (hostname === baseName || hostname.startsWith(baseName + '.')) return true
        // Check full URL for platform name as a standalone word
        const urlPattern = new RegExp(`[./]${baseName}[./]|^${baseName}[./]|[/]${baseName}[./]`, 'i')
        if (urlPattern.test(fullUrl)) return true
      }
      return false
    }
    
    // Social platforms
    if (matchesPlatform('tiktok.com', 'tiktok')) return 'TikTok'
    if (matchesPlatform('instagram.com', 'instagram')) return 'Instagram'
    if (matchesPlatform('youtube.com', 'youtube') || matchesPlatform('youtu.be')) {
      // Check if it's YouTube Music
      if (hostname.includes('music.youtube.com') || fullUrl.includes('music.youtube.com')) return 'YoutubeMusic'
      return 'YouTube'
    }
    if (matchesPlatform('snapchat.com', 'snapchat')) return 'Snapchat'
    if (matchesPlatform('twitter.com', 'twitter') || matchesPlatform('x.com', 'x')) return 'Twitter'
    if (matchesPlatform('discord.gg', 'discord') || matchesPlatform('discord.com', 'discord')) return 'Discord'
    if (matchesPlatform('threads.net', 'threads')) return 'Threads'
    if (matchesPlatform('reddit.com', 'reddit')) return 'Reddit'
    if (matchesPlatform('facebook.com', 'facebook') || matchesPlatform('fb.com', 'fb')) return 'Facebook'
    if (matchesPlatform('onlyfans.com', 'onlyfans')) return 'OnlyFans'
    if (matchesPlatform('clubhouse.com', 'clubhouse')) return 'Clubhouse'
    
    // Business platforms
    if (matchesPlatform('wa.me', 'whatsapp') || matchesPlatform('whatsapp.com', 'whatsapp')) return 'WhatsApp'
    if (matchesPlatform('t.me', 'telegram') || matchesPlatform('telegram.org', 'telegram')) return 'Telegram'
    if (matchesPlatform('linkedin.com', 'linkedin')) return 'LinkedIn'
    if (matchesPlatform('skype.com', 'skype') || matchesPlatform('join.skype.com')) return 'Skype'
    if (matchesPlatform('github.com', 'github')) return 'GitHub'
    if (matchesPlatform('calendly.com', 'calendly')) return 'Calendly'
    
    // Music platforms
    if (matchesPlatform('spotify.com', 'spotify') || matchesPlatform('open.spotify.com')) return 'Spotify'
    if (matchesPlatform('music.apple.com')) return 'AppleMusic'
    if (matchesPlatform('soundcloud.com', 'soundcloud')) return 'Soundcloud'
    if (matchesPlatform('music.amazon.com')) return 'AmazonMusic'
    if (matchesPlatform('pandora.com', 'pandora')) return 'Pandora'
    
    // Payment platforms
    if (matchesPlatform('paypal.me', 'paypal') || matchesPlatform('paypal.com', 'paypal')) return 'PayPal'
    if (matchesPlatform('venmo.com', 'venmo')) return 'Venmo'
    if (matchesPlatform('cash.app', 'cashapp')) return 'CashApp'
    
    // Entertainment platforms
    if (matchesPlatform('twitch.tv', 'twitch')) return 'Twitch'
    if (matchesPlatform('kick.com', 'kick')) return 'Kick'
    if (matchesPlatform('steamcommunity.com', 'steam') || matchesPlatform('store.steampowered.com', 'steam')) return 'Steam'
    if (matchesPlatform('podcasts.apple.com')) return 'ApplePodcast'
    
    // Lifestyle platforms
    if (matchesPlatform('pinterest.com', 'pinterest')) return 'Pinterest'
    if (matchesPlatform('vsco.co', 'vsco')) return 'VSCO'
    if (matchesPlatform('cameo.com', 'cameo')) return 'Cameo'
    
    // Default to custom link icon if no match
    return 'CustomLink'
  } catch (error) {
    // If URL parsing fails, try to detect from the raw string
    const lowerUrl = url.toLowerCase()
    
    // Social platforms
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('/tiktok/') || lowerUrl.includes('tiktok.com/')) return 'TikTok'
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('/instagram/') || lowerUrl.includes('instagram.com/')) return 'Instagram'
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      if (lowerUrl.includes('music.youtube.com')) return 'YoutubeMusic'
      return 'YouTube'
    }
    if (lowerUrl.includes('snapchat.com') || lowerUrl.includes('/snapchat/')) return 'Snapchat'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') || lowerUrl.includes('/twitter/') || lowerUrl.includes('/x/')) return 'Twitter'
    if (lowerUrl.includes('discord.gg') || lowerUrl.includes('discord.com') || lowerUrl.includes('/discord/')) return 'Discord'
    if (lowerUrl.includes('threads.net') || lowerUrl.includes('/threads/')) return 'Threads'
    if (lowerUrl.includes('reddit.com') || lowerUrl.includes('/reddit/')) return 'Reddit'
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('/facebook/')) return 'Facebook'
    if (lowerUrl.includes('onlyfans.com') || lowerUrl.includes('/onlyfans/')) return 'OnlyFans'
    if (lowerUrl.includes('clubhouse.com') || lowerUrl.includes('/clubhouse/')) return 'Clubhouse'
    
    // Business platforms
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com') || lowerUrl.includes('/whatsapp/')) return 'WhatsApp'
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.org') || lowerUrl.includes('/telegram/')) return 'Telegram'
    if (lowerUrl.includes('linkedin.com') || lowerUrl.includes('/linkedin/')) return 'LinkedIn'
    if (lowerUrl.includes('skype.com') || lowerUrl.includes('join.skype.com') || lowerUrl.includes('/skype/')) return 'Skype'
    if (lowerUrl.includes('github.com') || lowerUrl.includes('/github/')) return 'GitHub'
    if (lowerUrl.includes('calendly.com') || lowerUrl.includes('/calendly/')) return 'Calendly'
    
    // Music platforms
    if (lowerUrl.includes('spotify.com') || lowerUrl.includes('/spotify/')) return 'Spotify'
    if (lowerUrl.includes('music.apple.com')) return 'AppleMusic'
    if (lowerUrl.includes('soundcloud.com') || lowerUrl.includes('/soundcloud/')) return 'Soundcloud'
    if (lowerUrl.includes('music.amazon.com')) return 'AmazonMusic'
    if (lowerUrl.includes('pandora.com') || lowerUrl.includes('/pandora/')) return 'Pandora'
    
    // Payment platforms
    if (lowerUrl.includes('paypal.me') || lowerUrl.includes('paypal.com') || lowerUrl.includes('/paypal/')) return 'PayPal'
    if (lowerUrl.includes('venmo.com') || lowerUrl.includes('/venmo/')) return 'Venmo'
    if (lowerUrl.includes('cash.app') || lowerUrl.includes('/cashapp/')) return 'CashApp'
    
    // Entertainment platforms
    if (lowerUrl.includes('twitch.tv') || lowerUrl.includes('/twitch/')) return 'Twitch'
    if (lowerUrl.includes('kick.com') || lowerUrl.includes('/kick/')) return 'Kick'
    if (lowerUrl.includes('steamcommunity.com') || lowerUrl.includes('store.steampowered.com') || lowerUrl.includes('/steam/')) return 'Steam'
    if (lowerUrl.includes('podcasts.apple.com')) return 'ApplePodcast'
    
    // Lifestyle platforms
    if (lowerUrl.includes('pinterest.com') || lowerUrl.includes('/pinterest/')) return 'Pinterest'
    if (lowerUrl.includes('vsco.co') || lowerUrl.includes('/vsco/')) return 'VSCO'
    if (lowerUrl.includes('cameo.com') || lowerUrl.includes('/cameo/')) return 'Cameo'
    
    // Default to custom link icon if no match
    return 'CustomLink'
  }
}

