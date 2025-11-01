'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ConnectCTA from '@/components/store/ConnectCTA'
import CollabRequestModal from '@/components/store/CollabRequestModal'
import { CustomLink } from '@/types'
import { PlatformIcon } from '@/components/icons/PlatformIcons'
import { detectPlatformFromUrl } from '@/lib/detectPlatform'
import SocialIconsDisplay from '@/components/store/SocialIconsDisplay'
import Banner from '@/components/Banner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StoreData {
  id: string
  handle: string
  displayName: string | null
  location: string | null
  bio: string | null
  avatarUrl: string | null
  theme: 'LIGHT' | 'DARK'
  categories: string[]
  social: any
  customLinks: any
  isSelfView: boolean
}

export default function PublicStorePage() {
  const params = useParams()
  const router = useRouter()
  const handle = params?.handle as string
  
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCollabModal, setShowCollabModal] = useState(false)

  useEffect(() => {
    async function fetchStore() {
      try {
        const response = await fetch(`/api/store/public/${handle}`)
        if (response.status === 404) {
          router.push('/404')
          return
        }
        if (!response.ok) {
          throw new Error('Failed to fetch store')
        }
        const data = await response.json()
        setStore(data)
      } catch (error) {
        console.error('Error fetching store:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    if (handle) {
      fetchStore()
    }
  }, [handle, router])

  const handleConnect = () => {
    // On public store, always show the full collab form
    // Self-view protection happens at submission time
    setShowCollabModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return null
  }

  const social = (store.social as any[]) || []
  const customLinks = (store.customLinks as CustomLink[]) || []
  
  const initials = store.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="relative w-full max-w-[540px]">
        {/* Store Card */}
        <div
          className={`
            relative w-full overflow-hidden rounded-3xl border shadow-xl
            ring-1 ring-black/10 dark:ring-white/10
            ${store.theme === 'LIGHT' ? 'bg-white text-black' : 'bg-black text-white border-gray-800'}
          `}
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

          {/* Profile Body */}
          <div
            className={`
              relative z-20 w-full flex flex-col items-center text-center
              px-6 pt-6 pb-10 sm:px-10 sm:pt-8
              -translate-y-16
            `}
          >
            {/* Background that starts where text begins */}
            <div className={`absolute inset-0 ${store.theme === 'LIGHT' ? 'bg-white' : 'bg-gradient-to-b from-black via-black/95 to-black'}`} style={{ top: '40px', zIndex: 1 }} />
            
            {/* Gradient overlay to cover the split between banner and background */}
            <div 
              className="absolute left-0 right-0 w-full pointer-events-none"
              style={{
                top: '-20px',
                height: '70px',
                zIndex: 10,
                background: store.theme === 'LIGHT'
                  ? 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.96) 60%, rgba(255,255,255,1) 70%, #FFFFFF 100%)'
                  : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.96) 60%, rgba(0,0,0,1) 70%, #000000 100%)'
              }}
            />
            
            {/* Header Section */}
            <div className="w-full flex flex-col items-center relative" style={{ zIndex: 20 }}>
              {/* Name and Location */}
              <div className="mb-2">
                <h2 className="text-3xl font-bold">
                  {store.displayName || 'Creator'}
                </h2>
                
                {/* Username */}
                {store.handle && (
                  <p className={`text-sm mt-1 ${store.theme === 'LIGHT' ? 'text-gray-500' : 'text-gray-500'}`}>
                    @{store.handle}
                  </p>
                )}
                
                {store.location && (
                  <p className={`text-sm mt-2 ${store.theme === 'LIGHT' ? 'text-gray-600' : 'text-gray-400'}`}>
                    📍 {store.location}
                  </p>
                )}
              </div>

              {/* Social Links */}
              {social.length > 0 && (
                <div className="flex justify-center items-center gap-3 mb-4 mt-4 flex-wrap">
                  <SocialIconsDisplay links={social} />
                </div>
              )}

              {/* Bio */}
              {store.bio && (
                <p className="text-sm leading-relaxed max-w-prose mb-4">
                  {store.bio}
                </p>
              )}

              {/* Categories - COMMENTED OUT TO HIDE FROM STORE DISPLAY */}
              {/* {store.categories && store.categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
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

            {/* Body Section */}
            <div className="w-full flex flex-col items-center mt-6 relative" style={{ zIndex: 20 }}>

              {/* Custom Links */}
              {customLinks.length > 0 && (
                <div className="w-full max-w-md space-y-3 mt-4">
                  {customLinks.map((link) => {
                    const platformIcon = detectPlatformFromUrl(link.url)
                    const displayIcon = link.customIconUrl || platformIcon
                    const isFeatured = link.thumbnailSize && link.thumbnailSize !== 'none' && link.thumbnailUrl
                    
                    // Featured link with thumbnail
                    if (isFeatured) {
                      const height = link.thumbnailSize === 'big' ? 'h-[262px] md:h-[262px]' : 'h-[161px] md:h-[161px]'
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            relative block w-full ${height} rounded-xl overflow-hidden
                            transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                          `}
                        >
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <img
                              src={link.thumbnailUrl}
                              alt={link.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Dark overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/20" />
                          </div>
                          
                          {/* Icon at top-left */}
                          <div className="absolute top-4 left-4 z-10">
                            {link.customIconUrl ? (
                              <img
                                src={link.customIconUrl}
                                alt="Link icon"
                                className="h-8 w-8 rounded-lg object-cover shadow-lg"
                              />
                            ) : (
                              <PlatformIcon iconName={displayIcon} className="h-8 w-8 drop-shadow-lg" />
                            )}
                          </div>
                          
                          {/* Title at bottom-center */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="text-center">
                              <span className="text-white font-semibold text-lg drop-shadow-lg">
                                {link.title}
                              </span>
                            </div>
                          </div>
                        </a>
                      )
                    }
                    
                    // Regular link row
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          flex items-center gap-3 w-full px-6 py-4 rounded-xl font-medium
                          transition-all duration-200
                          ${store.theme === 'LIGHT'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }
                          hover:scale-[1.02] hover:shadow-lg
                        `}
                      >
                        {link.customIconUrl ? (
                          <img
                            src={link.customIconUrl}
                            alt="Link icon"
                            className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <PlatformIcon iconName={platformIcon} className="h-8 w-8 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-center">{link.title}</span>
                        <div className="w-8" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Spacer for the sticky button */}
            <div className="h-32" aria-hidden="true" />
          </div>
        </div>

        {/* Connect CTA */}
        <ConnectCTA
          avatarUrl={store.avatarUrl || undefined}
          displayName={store.displayName || undefined}
          theme={store.theme}
          isEditMode={false}
          onConnect={handleConnect}
        />

        {/* Collab Request Modal */}
        {store && (
          <CollabRequestModal
            open={showCollabModal}
            onClose={() => setShowCollabModal(false)}
            creatorId={store.id}
            creatorAvatar={store.avatarUrl || undefined}
            creatorName={store.displayName || undefined}
            isSelfView={false}
          />
        )}
      </div>
    </div>
  )
}

