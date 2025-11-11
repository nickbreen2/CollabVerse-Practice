'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { platformCategories, Platform } from '@/lib/platformCategories'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'

interface LinkManagerProps {
  onSelectPlatform: (platform: Platform) => void
  onBack: () => void
  addedPlatformIds?: string[]
  theme?: 'LIGHT' | 'DARK'
}

export default function LinkManager({ 
  onSelectPlatform, 
  onBack,
  addedPlatformIds = [],
  theme
}: LinkManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  // Start with all categories collapsed (empty array)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryKey: string) => {
    // Only one category open at a time (accordion behavior)
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? [] // Close if already open
        : [categoryKey] // Open this one, close all others
    )
  }

  const filterPlatforms = (platforms: Platform[]) => {
    if (!searchQuery.trim()) return platforms
    
    const query = searchQuery.toLowerCase()
    return platforms.filter(platform =>
      platform.name.toLowerCase().includes(query) ||
      platform.id.toLowerCase().includes(query)
    )
  }

  const hasResults = Object.values(platformCategories).some(category =>
    filterPlatforms(category.platforms).length > 0
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header - Non-scrollable */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-4 pt-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add a New Link</h2>
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-3 text-red-600 hover:bg-[#fff2f1] hover:text-red-600">
            Close
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Scrollable Platform Categories - Independent scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!hasResults && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No platforms found for "{searchQuery}"</p>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(platformCategories).map(([categoryKey, category]) => {
            const filteredPlatforms = filterPlatforms(category.platforms)
            
            if (filteredPlatforms.length === 0) return null

            const isExpanded = expandedCategories.includes(categoryKey)
            // Show first 3 as preview when collapsed
            const previewPlatforms = filteredPlatforms.slice(0, 3)

            return (
              <div key={categoryKey} className="space-y-0">
                {/* Category Row - Horizontal Layout - Clickable to expand */}
                <button
                  onClick={() => !searchQuery.trim() && toggleCategory(categoryKey)}
                  className="flex items-center w-full py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors"
                >
                  {/* Left: Category Title - Left aligned */}
                  <h3 className="text-base font-semibold text-foreground text-left flex-shrink-0 mr-4">
                    {category.title}
                  </h3>

                  {/* Spacer to push icons to the right */}
                  <div className="flex-1" />

                  {/* Right: Preview Icons (3 icons inline) - No background, tight spacing */}
                  <div className="flex items-center gap-1 pointer-events-none mr-1.5">
                    {previewPlatforms.map((platform) => {
                      const Icon = getPlatformIcon(platform.icon, theme)
                      const isAdded = addedPlatformIds.includes(platform.id)

                      return (
                        <div
                          key={platform.id}
                          className={`flex-shrink-0 flex items-center justify-center ${
                            isAdded ? 'opacity-40' : ''
                          }`}
                        >
                          <Icon className="w-7 h-7 object-contain" />
                        </div>
                      )
                    })}
                  </div>

                  {/* Right: Chevron - Always visible */}
                  <div className="flex-shrink-0 p-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground transition-all duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-all duration-200" />
                    )}
                  </div>
                </button>

                {/* Expanded Grid - Shows below when expanded with light background */}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mx-2 mb-2">
                    <div className="grid grid-cols-3 gap-3">
                      {filteredPlatforms.map((platform) => {
                        const Icon = getPlatformIcon(platform.icon, theme)
                        const isAdded = addedPlatformIds.includes(platform.id)

                        return (
                          <button
                            key={platform.id}
                            onClick={() => !isAdded && onSelectPlatform(platform)}
                            disabled={isAdded}
                            aria-label={`${isAdded ? 'Already added' : 'Add'} ${platform.name}`}
                            className={`
                              flex flex-col items-center gap-2 p-2 rounded-lg 
                              transition-all duration-200
                              ${
                                isAdded
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-white dark:hover:bg-gray-800 hover:ring-2 hover:ring-purple-500/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                              }
                            `}
                          >
                            {/* Icon container - transparent, no background */}
                            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xs text-center font-medium line-clamp-2 w-full text-foreground">
                              {platform.name}
                            </span>
                            {isAdded && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                Added
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Search Results - Full Grid with background */}
                {searchQuery.trim() && !isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mx-2 mb-2">
                    <div className="grid grid-cols-3 gap-3">
                      {filteredPlatforms.map((platform) => {
                        const Icon = getPlatformIcon(platform.icon, theme)
                        const isAdded = addedPlatformIds.includes(platform.id)

                        return (
                          <button
                            key={platform.id}
                            onClick={() => !isAdded && onSelectPlatform(platform)}
                            disabled={isAdded}
                            aria-label={`${isAdded ? 'Already added' : 'Add'} ${platform.name}`}
                            className={`
                              flex flex-col items-center gap-2 p-2 rounded-lg 
                              transition-all duration-200
                              ${
                                isAdded
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-white dark:hover:bg-gray-800 hover:ring-2 hover:ring-purple-500/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                              }
                            `}
                          >
                            {/* Icon container - transparent, no background */}
                            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xs text-center font-medium line-clamp-2 w-full text-foreground">
                              {platform.name}
                            </span>
                            {isAdded && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                Added
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

