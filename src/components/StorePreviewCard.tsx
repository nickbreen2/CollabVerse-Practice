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
      {/* Banner with Profile Image as background */}
      <div className="relative w-full overflow-hidden" style={{ height: '380px' }}>
        {/* Profile image as background layer (z-0) */}
        <div className="absolute inset-0 z-0">
          <Banner theme={store.theme} avatarUrl={store.avatarUrl} initials={initials} />
        </div>
        
        {/* LinkMe-style bottom fade overlay (z-10) - Extended to cover text overlap area */}
        <div 
          className="absolute left-0 right-0 w-full pointer-events-none z-10"
          style={{
            bottom: '-1px',
            height: '100%',
            background: store.theme === 'LIGHT'
              ? 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 97%, rgba(255,255,255,0.7) 98%, rgba(255,255,255,1) 99%, #FFFFFF 99%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 97%, rgba(0,0,0,0.7) 98%, rgba(0,0,0,1) 99%, #000000 99%)'
          }}
        />
      </div>

      <div className="relative z-20 px-8 pb-8 pt-4 -mt-10">
        {/* Background that starts where text begins */}
        <div className={`absolute inset-0 ${store.theme === 'LIGHT' ? 'bg-white' : 'bg-black'}`} style={{ top: '20px', zIndex: 1 }} />
        
        {/* Gradient overlay to cover the split between banner and background */}
        <div 
          className="absolute left-0 right-0 w-full pointer-events-none"
          style={{
            top: '-15px',
            height: '60px',
            zIndex: 10,
            background: store.theme === 'LIGHT'
              ? 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.96) 60%, rgba(255,255,255,1) 70%, #FFFFFF 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.96) 60%, rgba(0,0,0,1) 70%, #000000 100%)'
          }}
        />
        
        {/* Profile Info */}
        <div className="space-y-4 relative" style={{ zIndex: 20 }}>
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

