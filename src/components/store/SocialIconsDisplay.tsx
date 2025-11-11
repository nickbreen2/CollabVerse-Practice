'use client'

import { useEffect, useRef, useState } from 'react'
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
  theme?: 'LIGHT' | 'DARK'
}

// Component that renders social icons
// In edit mode, icons open editor; in preview/public mode, they link to URLs
// Auto-scrolls horizontally in both modes, pauses on hover
export default function SocialIconsDisplay({ links, isEditMode = false, onEditClick, theme }: SocialIconsDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const scrollDirection = useRef<'forward' | 'backward'>('forward')
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastDirectionChangeRef = useRef<number>(0)

  // Check if scrolling is needed - enable auto-scroll in both preview and edit modes
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Disable auto-scroll for exactly 8 icons in edit mode to prevent shaking
    if (isEditMode && links.length === 8) {
      setShouldAutoScroll(false)
      return
    }

    // Check if content overflows
    const hasOverflow = container.scrollWidth > container.clientWidth
    setShouldAutoScroll(hasOverflow)
  }, [links, isEditMode])

  // Auto-scroll logic - works in both preview and edit modes
  useEffect(() => {
    if (!shouldAutoScroll || isHovered) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      return
    }

    const container = scrollContainerRef.current
    if (!container) return

    const scrollStep = 1 // pixels per frame
    const scrollInterval = 30 // milliseconds between frames

    autoScrollIntervalRef.current = setInterval(() => {
      if (!container) return

      const { scrollWidth, clientWidth } = container
      const maxScroll = Math.max(0, scrollWidth - clientWidth)
      const currentScrollLeft = container.scrollLeft
      const now = Date.now()
      const minTimeBetweenDirectionChanges = 100 // Prevent rapid direction changes

      // Only allow direction change if enough time has passed since last change
      const canChangeDirection = now - lastDirectionChangeRef.current > minTimeBetweenDirectionChanges

      // Calculate where we want to scroll to
      let newScrollLeft = currentScrollLeft
      
      if (scrollDirection.current === 'forward') {
        newScrollLeft = currentScrollLeft + scrollStep
      } else {
        newScrollLeft = currentScrollLeft - scrollStep
      }

      // Check if new position would exceed bounds
      const wouldExceedMax = newScrollLeft > maxScroll
      const wouldExceedMin = newScrollLeft < 0

      // If we would exceed bounds and can change direction, reverse direction
      if (wouldExceedMax && canChangeDirection && scrollDirection.current === 'forward') {
        scrollDirection.current = 'backward'
        lastDirectionChangeRef.current = now
        newScrollLeft = maxScroll // Clamp to exact max
      } else if (wouldExceedMin && canChangeDirection && scrollDirection.current === 'backward') {
        scrollDirection.current = 'forward'
        lastDirectionChangeRef.current = now
        newScrollLeft = 0 // Clamp to exact start
      }

      // Clamp the final scroll position to valid range
      newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll))

      // Apply the scroll position
      container.scrollLeft = newScrollLeft
    }, scrollInterval)

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }
  }, [shouldAutoScroll, isHovered])

  // Reset scroll position when links change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
      scrollDirection.current = 'forward'
      lastDirectionChangeRef.current = 0 // Reset direction change timer
    }
  }, [links])

  return (
    <div
      ref={scrollContainerRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide"
      style={{ scrollBehavior: 'auto' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {links.map((link) => {
        const platform = getPlatformById(link.network)
        const Icon = platform ? getPlatformIcon(platform.icon, theme) : null

        if (!Icon || !platform) return null

        // In edit mode, render as button to open editor
        if (isEditMode && onEditClick) {
          return (
            <button
              key={link.network}
              onClick={() => onEditClick(link.network)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg flex-shrink-0"
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
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg flex-shrink-0"
          >
            <Icon className="h-10 w-10 object-contain" />
          </a>
        )
      })}
    </div>
  )
}

