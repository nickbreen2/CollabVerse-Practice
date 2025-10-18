'use client'

import { useEffect, useState } from 'react'
import EditSidebar from '@/components/store/EditSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import EmailConnectPill from '@/components/store/EmailConnectPill'
import Banner from '@/components/Banner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { CreatorStore } from '@prisma/client'
import { Eye, Pencil, Plus } from 'lucide-react'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'
import { getPlatformById, Platform } from '@/lib/platformCategories'
import LinkManagerModal from '@/components/store/LinkManagerModal'
import AddLinkModal from '@/components/store/AddLinkModal'

export default function MyStorePage() {
  const [store, setStore] = useState<CreatorStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [showLinkManagerModal, setShowLinkManagerModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchStore()
  }, [])

  const fetchStore = async () => {
    try {
      const response = await fetch('/api/store')
      if (!response.ok) {
        throw new Error('Failed to fetch store')
      }
      const data = await response.json()
      setStore(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load store data',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updates: Partial<CreatorStore>) => {
    if (!store) return

    try {
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update store')
      }

      const updatedStore = await response.json()
      setStore(updatedStore)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save changes',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Store not found</p>
        </div>
      </div>
    )
  }

  const isEditing = mode === 'edit'
  const handleToggle = () => setMode(mode === 'preview' ? 'edit' : 'preview')
  
  const social = (store.social as any[]) || []
  
  const initials = store.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  const handleEmailConnect = (email: string) => {
    console.log('Connect email:', email)
    toast({
      title: 'Coming soon!',
      description: 'Email connection will be available soon.',
    })
  }

  const handleQuickAddLink = () => {
    setShowLinkManagerModal(true)
  }

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform)
    setShowAddModal(true)
  }

  const handleAddLink = async (url: string) => {
    if (!selectedPlatform || !store) return

    const social = (store.social as any[]) || []
    const newLinks = [...social]
    const existingIndex = newLinks.findIndex((l) => l.network === selectedPlatform.id)

    if (existingIndex !== -1) {
      newLinks[existingIndex] = { network: selectedPlatform.id, url }
    } else {
      newLinks.push({ network: selectedPlatform.id, url })
    }

    await handleUpdate({ social: newLinks })
    
    toast({
      title: 'Link added',
      description: `${selectedPlatform.name} link has been added`,
    })

    // Close modals
    setShowAddModal(false)
    setShowLinkManagerModal(false)
    setSelectedPlatform(null)
  }

  return (
    <div className="flex h-full flex-col">
      {/* FIXED HEADER - DOESN'T SCROLL */}
      <DashboardHeader
        title="My Store"
        subtitle="Customize your creator profile"
        handle={store.handle}
      />

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full">
          {/* PREVIEW COLUMN - SCROLLABLE - Centered with sidebar offset in Edit */}
          <div 
            className={`
              flex justify-center items-start overflow-y-auto scrollbar-hide h-full pt-8 pb-6 px-4
              transition-all duration-300 ease-in-out
              ${isEditing ? 'mr-[420px]' : ''}
            `}
          >
            {/* PREVIEW CARD — CENTERED */}
            <div
              className={`
                relative
                w-full max-w-[540px]
                mx-auto
                overflow-hidden rounded-3xl border shadow-xl
                ring-1 ring-black/10 dark:ring-white/10
                h-fit
                transition-all duration-300 ease-in-out
                ${store.theme === 'LIGHT' ? 'bg-white text-black' : 'bg-black text-white border-gray-800'}
              `}
            >
              {/* Banner/header area with toggle button */}
              <div className="relative h-48 w-full overflow-hidden">
                <Banner src={store.bannerUrl || undefined} theme={store.theme} />
                
                {/* TOP-LEFT TOGGLE - Inside banner with high z-index */}
                <button
                  onClick={handleToggle}
                  className="absolute left-6 top-6 z-50 px-4 py-2 bg-white text-black rounded-full shadow-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* PROFILE BODY - Perfectly Centered Content */}
              <div
                className={`
                  relative
                  w-full
                  flex flex-col items-center justify-center text-center
                  min-h-[800px]
                  px-6 py-10
                  sm:px-10
                  -translate-y-64
                  transition-transform duration-300
                  ${store.theme === 'LIGHT' ? 'bg-white' : 'bg-gradient-to-b from-black via-black/95 to-black'}
                `}
              >
                {/* Avatar */}
                <div className="mb-5">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-black shadow-xl">
                    <AvatarImage src={store.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name and Location */}
                <div className="mb-4">
                  <h2 className="text-3xl font-bold">
                    {store.displayName || 'Your Name'}
                  </h2>
                  {store.location && (
                    <p className={`text-sm mt-2 ${store.theme === 'LIGHT' ? 'text-gray-600' : 'text-gray-400'}`}>
                      📍 {store.location}
                    </p>
                  )}
                </div>

                {/* Bio */}
                {store.bio && (
                  <p className="text-sm leading-relaxed max-w-prose mb-5">{store.bio}</p>
                )}

                {/* Categories */}
                {store.categories && store.categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
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
                )}

                {/* Social Links */}
                {(social.length > 0 || isEditing) && (
                  <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
                    {social.map((link: any, index: number) => {
                      const platform = getPlatformById(link.network)
                      const Icon = platform ? getPlatformIcon(platform.icon) : null
                      
                      if (!Icon) return null
                      
                      return (
                        <a
                          key={index}
                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
                        >
                          <Icon className="h-10 w-10 object-contain" />
                        </a>
                      )
                    })}
                    
                    {/* QUICK ADD LINK BUTTON - Edit mode only */}
                    {isEditing && (
                      <button
                        onClick={handleQuickAddLink}
                        aria-label="Add a new link"
                        title="Add a new link"
                        className="
                          w-11 h-11 rounded-full 
                          flex items-center justify-center
                          transition-all duration-200
                          bg-gray-100 dark:bg-gray-800
                          hover:bg-gray-200 dark:hover:bg-gray-700
                          hover:ring-2 hover:ring-purple-500/40
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                          text-gray-600 dark:text-gray-400
                          hover:text-purple-600 dark:hover:text-purple-400
                          shadow-sm hover:shadow-md
                        "
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* EMAIL CONNECT PILL */}
                <EmailConnectPill
                  avatarUrl={store.avatarUrl || undefined}
                  onSubmit={handleEmailConnect}
                />
              </div>
            </div>
          </div>

          {/* EDITOR SIDEBAR - Absolutely positioned on right, slides in/out */}
          <aside 
            className={`
              absolute top-0 right-0 h-full w-[380px] z-40
              bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800
              transition-transform duration-300 ease-in-out
              ${isEditing ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}
            `}
          >
            <div className="relative h-full overflow-hidden">
              {/* TOP FADE EFFECT */}
              <div className="absolute top-0 left-0 right-0 z-10 h-8 bg-gradient-to-b from-white via-white/90 dark:from-gray-950 dark:via-gray-950/90 to-transparent pointer-events-none" />
              
              {/* SCROLLABLE CONTENT */}
              <div className="h-full overflow-y-auto">
                <EditSidebar store={store} onUpdate={handleUpdate} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* LINK MANAGER MODAL */}
      <LinkManagerModal
        open={showLinkManagerModal}
        onClose={() => setShowLinkManagerModal(false)}
        onSelectPlatform={handleSelectPlatform}
        addedPlatformIds={social.map(link => link.network)}
      />

      {/* ADD LINK MODAL (for entering URL) */}
      <AddLinkModal
        platform={selectedPlatform}
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedPlatform(null)
        }}
        onAdd={handleAddLink}
      />
    </div>
  )
}
