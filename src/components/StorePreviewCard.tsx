'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Banner from './Banner'
import { CreatorStore } from '@prisma/client'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'
import { getPlatformById } from '@/lib/platformCategories'
import SocialIconsDisplay from '@/components/store/SocialIconsDisplay'

interface StorePreviewCardProps {
  store: CreatorStore
}

export default function StorePreviewCard({ store }: StorePreviewCardProps) {
  const social = (store.social as any[]) || []
  const initials = store.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border shadow-2xl ${
        store.theme === 'LIGHT'
          ? 'bg-white text-black'
          : 'bg-black text-white border-gray-800'
      }`}
    >
      {/* Banner with height container */}
      <div className="relative h-48 w-full overflow-hidden">
        <Banner src={store.bannerUrl || undefined} theme={store.theme} />
      </div>

      <div className="relative px-8 pb-8 -mt-16">
        {/* Avatar */}
        <div className="mb-4">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-black shadow-xl">
            <AvatarImage src={store.avatarUrl || undefined} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold">
              {store.displayName || 'Your Name'}
            </h2>
            
            {/* Username */}
            {store.handle && (
              <p className="text-sm text-gray-500 mt-1">
                @{store.handle}
              </p>
            )}
            
            {store.location && (
              <p className="text-sm text-muted-foreground mt-1">
                📍 {store.location}
              </p>
            )}
          </div>

          {/* Social Links */}
          {social.length > 0 && (
            <div className="flex gap-3 pt-4">
              <SocialIconsDisplay links={social} />
            </div>
          )}

          {store.bio && (
            <p className="text-sm leading-relaxed">{store.bio}</p>
          )}

          {/* Categories - COMMENTED OUT TO HIDE FROM STORE DISPLAY */}
          {/* {store.categories && store.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {store.categories.map((category, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    store.theme === 'LIGHT'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {category}
                </span>
              ))}
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

