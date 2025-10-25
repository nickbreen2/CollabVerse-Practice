// Detect platform from URL and return the icon name
export function detectPlatformFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    
    // Social platforms
    if (hostname.includes('tiktok.com')) return 'TikTok'
    if (hostname.includes('instagram.com')) return 'Instagram'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      // Check if it's YouTube Music
      if (hostname.includes('music.youtube.com')) return 'YoutubeMusic'
      return 'YouTube'
    }
    if (hostname.includes('snapchat.com')) return 'Snapchat'
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter'
    if (hostname.includes('discord.gg') || hostname.includes('discord.com')) return 'Discord'
    if (hostname.includes('threads.net')) return 'Threads'
    if (hostname.includes('reddit.com')) return 'Reddit'
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'Facebook'
    if (hostname.includes('onlyfans.com')) return 'OnlyFans'
    if (hostname.includes('clubhouse.com')) return 'Clubhouse'
    
    // Business platforms
    if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) return 'WhatsApp'
    if (hostname.includes('t.me') || hostname.includes('telegram.org')) return 'Telegram'
    if (hostname.includes('linkedin.com')) return 'LinkedIn'
    if (hostname.includes('skype.com') || hostname.includes('join.skype.com')) return 'Skype'
    if (hostname.includes('github.com')) return 'GitHub'
    if (hostname.includes('calendly.com')) return 'Calendly'
    
    // Music platforms
    if (hostname.includes('spotify.com') || hostname.includes('open.spotify.com')) return 'Spotify'
    if (hostname.includes('music.apple.com')) return 'AppleMusic'
    if (hostname.includes('soundcloud.com')) return 'Soundcloud'
    if (hostname.includes('music.amazon.com')) return 'AmazonMusic'
    if (hostname.includes('pandora.com')) return 'Pandora'
    
    // Payment platforms
    if (hostname.includes('paypal.me') || hostname.includes('paypal.com')) return 'PayPal'
    if (hostname.includes('venmo.com')) return 'Venmo'
    if (hostname.includes('cash.app')) return 'CashApp'
    
    // Entertainment platforms
    if (hostname.includes('twitch.tv')) return 'Twitch'
    if (hostname.includes('kick.com')) return 'Kick'
    if (hostname.includes('steamcommunity.com') || hostname.includes('store.steampowered.com')) return 'Steam'
    if (hostname.includes('podcasts.apple.com')) return 'ApplePodcast'
    
    // Lifestyle platforms
    if (hostname.includes('pinterest.com')) return 'Pinterest'
    if (hostname.includes('vsco.co')) return 'VSCO'
    if (hostname.includes('cameo.com')) return 'Cameo'
    
    // Default to custom link icon if no match
    return 'CustomLink'
  } catch (error) {
    // If URL parsing fails, return default icon
    return 'CustomLink'
  }
}

