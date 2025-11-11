'use client'

import { getVideoEmbedUrl, detectVideoPlatform } from '@/lib/videoEmbed'

interface VideoEmbedProps {
  url: string
  title?: string
  theme?: 'LIGHT' | 'DARK'
}

export default function VideoEmbed({ url, title, theme = 'DARK' }: VideoEmbedProps) {
  const embedUrl = getVideoEmbedUrl(url)
  const platform = detectVideoPlatform(url)

  if (!embedUrl) {
    return (
      <div className={`
        aspect-video rounded-xl flex items-center justify-center
        ${theme === 'LIGHT' ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-400'}
      `}>
        <p className="text-sm">Invalid video URL</p>
      </div>
    )
  }

  // TikTok videos are vertical (9:16), others are horizontal (16:9)
  const aspectRatioClass = platform === 'tiktok' ? 'aspect-[9/16]' : 'aspect-video'

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-medium mb-2 text-center">{title}</h4>
      )}
      <div className={`
        ${aspectRatioClass} w-full rounded-xl overflow-hidden relative
        ${theme === 'LIGHT' ? 'bg-black' : 'bg-black'}
      `}>
        {platform === 'instagram' ? (
          <iframe
            src={embedUrl}
            className="absolute border-0"
            style={{ 
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%) scale(1.02)',
              transformOrigin: 'center center'
            }}
            frameBorder="0"
            scrolling="no"
            allowTransparency
            allow="encrypted-media"
            title={title || 'Instagram video'}
          />
        ) : platform === 'tiktok' ? (
          <iframe
            src={embedUrl}
            className="absolute border-0"
            style={{ 
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%) scale(1.02)',
              transformOrigin: 'center center'
            }}
            frameBorder="0"
            scrolling="no"
            allow="encrypted-media"
            title={title || 'TikTok video'}
          />
        ) : (
          <iframe
            src={embedUrl}
            className="absolute border-0"
            style={{ 
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%) scale(1.02)',
              transformOrigin: 'center center'
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Video'}
          />
        )}
      </div>
    </div>
  )
}

