'use client'

import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPlatformById } from '@/lib/platformCategories'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'

interface SocialLink {
  network: string
  url: string
}

interface AddedLinksListProps {
  links: SocialLink[]
  onDelete: (network: string) => void
  theme?: 'LIGHT' | 'DARK'
}

export default function AddedLinksList({ links, onDelete, theme }: AddedLinksListProps) {
  if (links.length === 0) {
    return null
  }

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '') + urlObj.pathname.slice(0, 20) + 
             (urlObj.pathname.length > 20 ? '...' : '')
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url
    }
  }

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const platform = getPlatformById(link.network)
        const Icon = platform ? getPlatformIcon(platform.icon, theme) : null

        return (
          <div
            key={link.network}
            className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 bg-white dark:bg-gray-950"
          >
            {/* Platform Icon - transparent, no background */}
            {Icon && (
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 object-contain" />
              </div>
            )}

            {/* Link Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize">
                {platform?.name || link.network}
              </p>
              <a
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate"
              >
                <span className="truncate">{formatUrl(link.url)}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(link.network)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="sr-only">Delete {link.network} link</span>
            </Button>
          </div>
        )
      })}
    </div>
  )
}

