'use client'

import { getPlatformById } from '@/lib/platformCategories'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'

interface SocialLink {
  network: string
  url: string
}

interface SocialIconsDisplayProps {
  links: SocialLink[]
  isEditMode?: boolean
  onEditClick?: (network: string) => void
}

// Component that renders social icons
// In edit mode, icons open editor; in preview/public mode, they link to URLs
export default function SocialIconsDisplay({ links, isEditMode = false, onEditClick }: SocialIconsDisplayProps) {
  return (
    <>
      {links.map((link) => {
        const platform = getPlatformById(link.network)
        const Icon = platform ? getPlatformIcon(platform.icon) : null

        if (!Icon) return null

        // In edit mode, render as button to open editor
        if (isEditMode && onEditClick) {
          return (
            <button
              key={link.network}
              onClick={() => onEditClick(link.network)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
              aria-label={`Edit ${platform.name} link`}
            >
              <Icon className="h-10 w-10 object-contain" />
            </button>
          )
        }

        // In preview/public mode, render as link
        return (
          <a
            key={link.network}
            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
          >
            <Icon className="h-10 w-10 object-contain" />
          </a>
        )
      })}
    </>
  )
}

