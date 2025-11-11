export interface Platform {
  id: string
  name: string
  category: string
  icon: string
  placeholder?: string
}

export const platformCategories = {
  social: {
    title: 'Social',
    platforms: [
      { id: 'tiktok', name: 'TikTok', category: 'social', icon: 'TikTok', placeholder: 'https://tiktok.com/@username' },
      { id: 'instagram', name: 'Instagram', category: 'social', icon: 'Instagram', placeholder: 'https://instagram.com/username' },
      { id: 'youtube', name: 'YouTube', category: 'social', icon: 'YouTube', placeholder: 'https://youtube.com/@username' },
      { id: 'snapchat', name: 'Snapchat', category: 'social', icon: 'Snapchat', placeholder: 'https://snapchat.com/add/username' },
      { id: 'twitter', name: 'X (Twitter)', category: 'social', icon: 'Twitter', placeholder: 'https://twitter.com/username' },
      { id: 'discord', name: 'Discord', category: 'social', icon: 'Discord', placeholder: 'https://discord.gg/invite' },
      { id: 'threads', name: 'Threads', category: 'social', icon: 'Threads', placeholder: 'https://threads.net/@username' },
      { id: 'reddit', name: 'Reddit', category: 'social', icon: 'Reddit', placeholder: 'https://reddit.com/u/username' },
      { id: 'facebook', name: 'Facebook', category: 'social', icon: 'Facebook', placeholder: 'https://facebook.com/username' },
      { id: 'onlyfans', name: 'OnlyFans', category: 'social', icon: 'OnlyFans', placeholder: 'https://onlyfans.com/username' },
      { id: 'clubhouse', name: 'Clubhouse', category: 'social', icon: 'Clubhouse', placeholder: 'https://clubhouse.com/@username' },
    ],
  },
  business: {
    title: 'Business',
    platforms: [
      { id: 'whatsapp', name: 'WhatsApp', category: 'business', icon: 'WhatsApp', placeholder: 'https://wa.me/1234567890' },
      { id: 'telegram', name: 'Telegram', category: 'business', icon: 'Telegram', placeholder: 'https://t.me/username' },
      { id: 'linkedin', name: 'LinkedIn', category: 'business', icon: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
      { id: 'skype', name: 'Skype', category: 'business', icon: 'Skype', placeholder: 'https://join.skype.com/invite/username' },
      { id: 'github', name: 'GitHub', category: 'business', icon: 'GitHub', placeholder: 'https://github.com/username' },
      { id: 'calendly', name: 'Calendly', category: 'business', icon: 'Calendly', placeholder: 'https://calendly.com/username' },
    ],
  },
  music: {
    title: 'Music',
    platforms: [
      { id: 'spotify', name: 'Spotify', category: 'music', icon: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
      { id: 'apple-music', name: 'Apple Music', category: 'music', icon: 'AppleMusic', placeholder: 'https://music.apple.com/...' },
      { id: 'soundcloud', name: 'SoundCloud', category: 'music', icon: 'Soundcloud', placeholder: 'https://soundcloud.com/username' },
      { id: 'youtube-music', name: 'YouTube Music', category: 'music', icon: 'YoutubeMusic', placeholder: 'https://music.youtube.com/...' },
      { id: 'amazon-music', name: 'Amazon Music', category: 'music', icon: 'AmazonMusic', placeholder: 'https://music.amazon.com/...' },
      { id: 'pandora', name: 'Pandora', category: 'music', icon: 'Pandora', placeholder: 'https://pandora.com/artist/...' },
    ],
  },
  payment: {
    title: 'Payment',
    platforms: [
      { id: 'paypal', name: 'PayPal', category: 'payment', icon: 'PayPal', placeholder: 'https://paypal.me/username' },
      { id: 'venmo', name: 'Venmo', category: 'payment', icon: 'Venmo', placeholder: 'https://venmo.com/username' },
      { id: 'cashapp', name: 'Cash App', category: 'payment', icon: 'CashApp', placeholder: 'https://cash.app/$username' },
      { id: 'zelle', name: 'Zelle', category: 'payment', icon: 'Zelle', placeholder: 'email@example.com' },
    ],
  },
  entertainment: {
    title: 'Entertainment',
    platforms: [
      { id: 'playstation', name: 'PlayStation', category: 'entertainment', icon: 'PlayStation', placeholder: 'PSN ID or profile link' },
      { id: 'xbox', name: 'Xbox', category: 'entertainment', icon: 'Xbox', placeholder: 'Gamertag or profile link' },
      { id: 'steam', name: 'Steam', category: 'entertainment', icon: 'Steam', placeholder: 'https://steamcommunity.com/id/username' },
      { id: 'twitch', name: 'Twitch', category: 'entertainment', icon: 'Twitch', placeholder: 'https://twitch.tv/username' },
      { id: 'kick', name: 'Kick', category: 'entertainment', icon: 'Kick', placeholder: 'https://kick.com/username' },
      { id: 'apple-podcast', name: 'Apple Podcasts', category: 'entertainment', icon: 'ApplePodcast', placeholder: 'https://podcasts.apple.com/...' },
    ],
  },
  lifestyle: {
    title: 'Lifestyle',
    platforms: [
      { id: 'pinterest', name: 'Pinterest', category: 'lifestyle', icon: 'Pinterest', placeholder: 'https://pinterest.com/username' },
      { id: 'vsco', name: 'VSCO', category: 'lifestyle', icon: 'VSCO', placeholder: 'https://vsco.co/username' },
      { id: 'cameo', name: 'Cameo', category: 'lifestyle', icon: 'Cameo', placeholder: 'https://cameo.com/username' },
    ],
  },
  others: {
    title: 'Others',
    platforms: [
      { id: 'website', name: 'Website', category: 'others', icon: 'Website', placeholder: 'https://yourwebsite.com' },
      { id: 'custom-link', name: 'Custom Link', category: 'others', icon: 'CustomLink', placeholder: 'https://...' },
    ],
  },
}

export const getAllPlatforms = (): Platform[] => {
  return Object.values(platformCategories).flatMap(category => category.platforms)
}

export const getPlatformById = (id: string): Platform | undefined => {
  return getAllPlatforms().find(platform => platform.id === id)
}

