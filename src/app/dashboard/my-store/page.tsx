'use client'

import { useEffect, useState } from 'react'
import EditSidebar from '@/components/store/EditSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ConnectCTA from '@/components/store/ConnectCTA'
import Banner from '@/components/Banner'
import ProfileImageUpload from '@/components/store/ProfileImageUpload'
import DisplayNameEditModal from '@/components/store/DisplayNameEditModal'
import BioEditModal from '@/components/store/BioEditModal'
import HandleEditModal from '@/components/store/HandleEditModal'
import CategoriesEditModal from '@/components/store/CategoriesEditModal'
import SocialIconsDisplay from '@/components/store/SocialIconsDisplay'
import { toast } from '@/components/ui/use-toast'
import { CreatorStore } from '@prisma/client'
import { Eye, Pencil, Plus, MoreVertical, MoveUp, MoveDown, Trash2, ChevronRight, X } from 'lucide-react'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'
import { getPlatformById, Platform } from '@/lib/platformCategories'
import LinkManagerModal from '@/components/store/LinkManagerModal'
import AddLinkModal from '@/components/store/AddLinkModal'
import SelfCollabModal from '@/components/store/SelfCollabModal'
import { CustomLink, StoreUpdatePayload, SocialLink } from '@/types'
import { PlatformIcon } from '@/components/icons/PlatformIcons'
import { detectPlatformFromUrl } from '@/lib/detectPlatform'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Helper function to get icon URL for background
const getIconUrlForBackground = (customIconUrl: string | undefined, platformIcon: string, theme?: 'LIGHT' | 'DARK') => {
  if (customIconUrl) return customIconUrl
  
  const iconFileMap: Record<string, string> = {
    TikTok: theme === 'DARK' ? 'tiktok-whitemode-preview.svg' : 'TikTok-preview.svg',
    Instagram: 'Instagram-preview.svg',
    YouTube: 'YouTube-preview.svg',
    Snapchat: 'Snapchat-preview.svg',
    Twitter: 'twitter-preview.svg',
    Discord: 'Discord-preview.svg',
    Threads: 'Threads-preview.svg',
    Reddit: 'Reddit-preview.svg',
    Facebook: 'Facebook-preview.svg',
    OnlyFans: 'OnlyFans-preview.svg',
    Clubhouse: 'Clubhouse-preview.svg',
    WhatsApp: 'WhatsApp-preview.svg',
    Telegram: 'Telegram-preview.svg',
    LinkedIn: 'LinkedIn-preview.svg',
    Skype: 'Skype-preview.svg',
    GitHub: 'GitHub-preview.svg',
    Calendly: 'Calendly-preview.svg',
    Spotify: 'Spotify-preview.svg',
    AppleMusic: 'Apple-Music-preview.svg',
    Soundcloud: 'Soundcloud-preview.svg',
    YoutubeMusic: 'Youtube-Music-preview.svg',
    AmazonMusic: 'Amazon-Music-preview.svg',
    Pandora: 'Pandora-preview.svg',
    PayPal: 'PayPal-preview.svg',
    Venmo: 'Venmo-preview.svg',
    CashApp: 'Cash-App-preview.svg',
    Zelle: 'Zelle-preview.svg',
    PlayStation: 'PlayStation-preview.svg',
    Xbox: 'Xbox-preview.svg',
    Steam: 'Steam-preview.svg',
    Twitch: 'Twitch-preview.svg',
    Kick: 'Kick-preview.svg',
    ApplePodcast: 'Apple-Podcast-preview.svg',
    Pinterest: 'Pinterest-preview.svg',
    VSCO: 'VSCO-preview.svg',
    Cameo: 'Cameo-preview.svg',
    Website: 'website-preview.svg',
    CustomLink: 'custom-link-preview.svg',
  }
  const fileName = iconFileMap[platformIcon] || 'custom-link-preview.svg'
  return `/icons/${fileName}`
}

export default function MyStorePage() {
  const [store, setStore] = useState<CreatorStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [showLinkManagerModal, setShowLinkManagerModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false)
  const [showHandleModal, setShowHandleModal] = useState(false)
  const [showBioModal, setShowBioModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showSelfCollabModal, setShowSelfCollabModal] = useState(false)
  const [sidebarView, setSidebarView] = useState<'overview' | 'header' | 'platforms' | 'customLinks' | 'bio' | undefined>(undefined)
  const [customLinkView, setCustomLinkView] = useState<'manager' | 'add' | 'edit' | undefined>(undefined)
  const [editingCustomLinkId, setEditingCustomLinkId] = useState<string | undefined>(undefined)
  const [platformView, setPlatformView] = useState<'add' | 'edit' | undefined>(undefined)
  const [editingPlatformNetwork, setEditingPlatformNetwork] = useState<string | undefined>(undefined)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchStore()
  }, [])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const handleUpdate = async (updates: StoreUpdatePayload) => {
    if (!store) return

    try {
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Failed to update store (${response.status})`
        console.error('API error response:', errorData)
        throw new Error(errorMessage)
      }

      const updatedStore = await response.json()
      setStore(updatedStore)
      return updatedStore // Return the updated store so callers know the update succeeded
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes'
      console.error('Error updating store:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      throw error // Re-throw so callers can handle the error
    }
  }

  // Wrapper to convert Partial<CreatorStore> to StoreUpdatePayload for EditSidebar
  const handleUpdateForSidebar = async (updates: Partial<CreatorStore>) => {
    // Convert null values to undefined and filter out non-updatable fields
    const payload: StoreUpdatePayload = {}
    
    if (updates.displayName !== undefined) payload.displayName = updates.displayName ?? undefined
    if (updates.location !== undefined) payload.location = updates.location ?? undefined
    if (updates.bio !== undefined) payload.bio = updates.bio ?? undefined
    if (updates.avatarUrl !== undefined) payload.avatarUrl = updates.avatarUrl ?? undefined
    if (updates.theme !== undefined) payload.theme = updates.theme ?? undefined
    if (updates.categories !== undefined) payload.categories = updates.categories ?? undefined
    if (updates.social !== undefined) payload.social = (updates.social as unknown as SocialLink[]) ?? undefined
    if (updates.customLinks !== undefined) payload.customLinks = (updates.customLinks as unknown as CustomLink[]) ?? undefined
    
    return await handleUpdate(payload)
  }

  // Preview-only update (updates local state without saving to backend)
  const handlePreviewUpdate = (updates: Partial<CreatorStore>) => {
    if (!store) return
    setStore({ ...store, ...updates })
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
  const handleToggle = () => {
    const newMode = mode === 'preview' ? 'edit' : 'preview'
    setMode(newMode)
    // Reset sidebar view when switching modes
    if (newMode === 'preview') {
      setSidebarView(undefined)
      setCustomLinkView(undefined)
      setEditingCustomLinkId(undefined)
      setPlatformView(undefined)
      setEditingPlatformNetwork(undefined)
    }
  }

  // Handle mobile navigation to edit views
  const handleMobileEditNavigation = (view: 'platforms' | 'bio' | 'customLinks' | 'header') => {
    setSidebarView(view)
    if (view === 'customLinks') {
      setCustomLinkView('manager')
    } else if (view === 'platforms') {
      setPlatformView('add')
    }
  }

  // Handle closing mobile edit view
  const handleCloseMobileEditView = () => {
    setSidebarView(undefined)
    setCustomLinkView(undefined)
    setEditingCustomLinkId(undefined)
    setPlatformView(undefined)
    setEditingPlatformNetwork(undefined)
  }
  
  // Convert social to array format - handle both array and object formats
  const social: SocialLink[] = Array.isArray(store.social) 
    ? (store.social as unknown as SocialLink[]).filter((l): l is SocialLink => l !== null && typeof l === 'object' && 'network' in l && 'url' in l)
    : store.social && typeof store.social === 'object' && !Array.isArray(store.social)
    ? Object.entries(store.social).map(([network, value]) => ({ 
        network, 
        url: typeof value === 'string' ? value : String(value)
      }))
    : []
  const customLinks = (store.customLinks as unknown as CustomLink[]) || []
  
  const initials = store.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  const handleConnect = () => {
    // In preview mode, show self-collab modal instead of navigating
    if (mode === 'preview') {
      setShowSelfCollabModal(true)
    }
  }

  const handleQuickAddLink = () => {
    setShowLinkManagerModal(true)
  }

  const handleQuickAddCustomLink = () => {
    // Ensure we're in edit mode
    if (mode !== 'edit') {
      setMode('edit')
    }
    // Set sidebar to custom links view with add form (always start fresh)
    setSidebarView('customLinks')
    setCustomLinkView('add')
    setEditingCustomLinkId(undefined)
  }

  const handleOpenCustomLinksAdd = () => {
    // Open Custom Links directly to Add form
    setSidebarView('customLinks')
    setCustomLinkView('add')
    setEditingCustomLinkId(undefined)
  }

  const handleOpenPlatformsAdd = () => {
    // Open Platforms directly to Add form
    setSidebarView('platforms')
    setPlatformView('add')
    setEditingPlatformNetwork(undefined)
  }

  const handleEditPlatform = (network: string) => {
    // Ensure we're in edit mode
    if (mode !== 'edit') {
      setMode('edit')
    }
    // Set sidebar to platforms view with edit form
    setSidebarView('platforms')
    setPlatformView('edit')
    setEditingPlatformNetwork(network)
  }

  const handleEditCustomLink = (linkId: string) => {
    // Ensure we're in edit mode
    if (mode !== 'edit') {
      setMode('edit')
    }
    // Set sidebar to custom links view with edit form
    setSidebarView('customLinks')
    setCustomLinkView('edit')
    setEditingCustomLinkId(linkId)
  }

  const handleMoveCustomLinkUp = async (linkId: string) => {
    if (!store) return
    
    const customLinks = (store.customLinks as unknown as CustomLink[]) || []
    const currentIndex = customLinks.findIndex(l => l.id === linkId)
    
    if (currentIndex <= 0) return // Already at top or not found
    
    const newLinks = [...customLinks]
    // Swap with previous item
    ;[newLinks[currentIndex - 1], newLinks[currentIndex]] = [newLinks[currentIndex], newLinks[currentIndex - 1]]
    
    await handleUpdate({ customLinks: newLinks })
  }

  const handleMoveCustomLinkDown = async (linkId: string) => {
    if (!store) return
    
    const customLinks = (store.customLinks as unknown as CustomLink[]) || []
    const currentIndex = customLinks.findIndex(l => l.id === linkId)
    
    if (currentIndex < 0 || currentIndex >= customLinks.length - 1) return // Already at bottom or not found
    
    const newLinks = [...customLinks]
    // Swap with next item
    ;[newLinks[currentIndex], newLinks[currentIndex + 1]] = [newLinks[currentIndex + 1], newLinks[currentIndex]]
    
    await handleUpdate({ customLinks: newLinks })
  }

  const handleDeleteCustomLink = (linkId: string) => {
    if (!store) return
    
    const customLinks = (store.customLinks as unknown as CustomLink[]) || []
    const linkToDelete = customLinks.find(l => l.id === linkId)
    
    if (!linkToDelete) return
    
    // Simple confirm
    if (!window.confirm(`Are you sure you want to delete "${linkToDelete.title}"?`)) {
      return
    }
    
    const newLinks = customLinks.filter(link => link.id !== linkId)
    handleUpdate({ customLinks: newLinks })
    
    toast({
      title: 'Link deleted',
      description: `${linkToDelete.title} has been removed`,
    })
  }

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform)
    setShowAddModal(true)
  }

  const handleAddLink = async (url: string) => {
    if (!selectedPlatform || !store) return

    // Convert social to array format - handle both array and object formats
    const social: SocialLink[] = Array.isArray(store.social) 
      ? (store.social as unknown as SocialLink[]).filter((l): l is SocialLink => l !== null && typeof l === 'object' && 'network' in l && 'url' in l)
      : store.social && typeof store.social === 'object' && !Array.isArray(store.social)
      ? Object.entries(store.social).map(([network, value]) => ({ 
          network, 
          url: typeof value === 'string' ? value : String(value)
        }))
      : []
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

  const handleSaveDisplayName = async (newName: string) => {
    await handleUpdate({ displayName: newName })
    toast({
      title: 'Success',
      description: 'Display name updated',
    })
  }

  const handleSaveHandle = async (newHandle: string) => {
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newHandle }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update username')
      }

      // Refresh store data
      await fetchStore()
      
      toast({
        title: 'Success',
        description: 'Username updated',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update username',
      })
      throw error
    }
  }

  const handleSaveBio = async (newBio: string) => {
    await handleUpdate({ bio: newBio })
    toast({
      title: 'Success',
      description: 'Bio updated',
    })
  }

  const handleSaveCategories = async (newCategories: string[]) => {
    await handleUpdate({ categories: newCategories })
    toast({
      title: 'Success',
      description: 'Categories updated',
    })
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
        {/* Blurred background image - Preview mode only - Absolute to cover content area only */}
        {!isEditing && store?.avatarUrl && (
          <div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              zIndex: 0,
            }}
          >
            <img
              src={store.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: 'blur(40px)',
                transform: 'scale(1.1)',
                opacity: 0.25,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        )}
        <div className="h-full relative">
          {/* PREVIEW COLUMN - SCROLLABLE - Centered with sidebar offset in Edit */}
          <div 
            className={`
              relative flex justify-center items-start overflow-y-auto overflow-x-hidden scrollbar-hide h-full pt-0 lg:pt-8 pb-6 px-0 lg:px-4
              transition-[margin-right] duration-300 ease-in-out
              ${isEditing ? 'lg:mr-[420px]' : ''}
            `}
            style={{ overscrollBehaviorX: 'none', zIndex: 1 }}
          >
            {/* Container for card + sticky button */}
            <div className="relative w-full max-w-[540px] lg:mx-auto" style={{ zIndex: 10 }}>
              {/* PREVIEW CARD — CENTERED */}
              <div
                className={`
                  relative
                  w-full
                  overflow-hidden rounded-none lg:rounded-3xl border-0 lg:border
                  ring-0 lg:ring-1 ring-black/10 dark:ring-white/10
                  h-fit
                  transition-[box-shadow] duration-300 ease-in-out
                  ${store.theme === 'LIGHT' ? 'bg-white text-black' : 'bg-black text-white border-gray-800'}
                  ${isEditing ? 'shadow-xl' : ''}
                `}
                style={!isEditing ? {
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.18), 0 15px 40px rgba(0, 0, 0, 0.12)'
                } : {}}
              >
              {/* Banner/header area with profile image as background */}
              <div className="relative w-full overflow-hidden group" style={{ height: '380px' }}>
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
                      ? 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 85%, rgba(255,255,255,0.2) 88%, rgba(255,255,255,0.5) 91%, rgba(255,255,255,0.75) 94%, rgba(255,255,255,0.9) 97%, rgba(255,255,255,1) 100%, #FFFFFF 100%)'
                      : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 85%, rgba(0,0,0,0.2) 88%, rgba(0,0,0,0.5) 91%, rgba(0,0,0,0.75) 94%, rgba(0,0,0,0.9) 97%, rgba(0,0,0,1) 100%, #000000 100%)'
                  }}
                />
                
                {/* Edit overlay for profile image - Only in edit mode (z-30) */}
                {isEditing && (
                  <ProfileImageUpload
                    avatarUrl={store.avatarUrl}
                    initials={initials}
                    onUpdate={(url) => handleUpdate({ avatarUrl: url })}
                    showHoverOverlay={true}
                    className="absolute inset-0 w-full h-full z-30"
                    isBannerMode={true}
                  />
                )}
                
                {/* TOP-LEFT TOGGLE - Inside banner with high z-index (z-50) */}
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

              {/* PROFILE BODY - Fixed Header Position */}
              <div
                className={`
                  relative z-50
                  w-full
                  flex flex-col items-center text-center
                  px-6 pt-6 pb-10
                  sm:px-10 sm:pt-8
                  -translate-y-32
                  transition-transform duration-300
                `}
              >
                {/* Background that starts where text begins */}
                <div className={`absolute inset-0 ${store.theme === 'LIGHT' ? 'bg-white' : 'bg-gradient-to-b from-black via-black/95 to-black'}`} style={{ top: '200px', zIndex: 1 }} />
                
                {/* Gradient overlay to cover the split between banner and background */}
                <div 
                  className="absolute left-0 right-0 w-full pointer-events-none"
                  style={{
                    top: '40px',
                    height: '160px',
                    zIndex: 10,
                    background: store.theme === 'LIGHT'
                      ? 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.3) 80%, rgba(255,255,255,0.6) 85%, rgba(255,255,255,0.85) 90%, rgba(255,255,255,1) 100%)'
                      : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.6) 85%, rgba(0,0,0,0.85) 90%, rgba(0,0,0,1) 100%)'
                  }}
                />
                
                {/* HEADER SECTION - Fixed position from top */}
                <div className="w-full flex flex-col items-center relative" style={{ zIndex: 50 }}>
                {/* Name */}
                <div className="mb-2">
                  <h2 
                    className={`text-3xl font-bold ${
                      isEditing 
                        ? 'cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-[#D4D7DC] transition-all' 
                        : ''
                    }`}
                    onClick={() => {
                      if (isEditing) {
                        if (isMobile) {
                          handleMobileEditNavigation('header')
                        } else {
                          setShowDisplayNameModal(true)
                        }
                      }
                    }}
                  >
                    {store.displayName || 'Your Name'}
                  </h2>
                  
                  {/* Username */}
                  {store.handle && (
                    <p 
                      className={`text-sm mt-1 ${store.theme === 'LIGHT' ? 'text-gray-500' : 'text-gray-500'} ${
                        isEditing 
                          ? 'cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-[#D4D7DC] transition-all' 
                          : ''
                      }`}
                      onClick={() => {
                        if (isEditing) {
                          if (isMobile) {
                            handleMobileEditNavigation('header')
                          } else {
                            setShowHandleModal(true)
                          }
                        }
                      }}
                    >
                      @{store.handle}
                    </p>
                  )}
                  
                </div>

                {/* Social Links */}
                {(social.length > 0 || isEditing) && (
                  <div className="flex justify-center items-center gap-3 mb-10 mt-5">
                    <SocialIconsDisplay 
                      links={social} 
                      isEditMode={isEditing}
                      onEditClick={handleEditPlatform}
                      theme={store?.theme}
                      />
                      
                      {/* QUICK ADD LINK BUTTON - Edit mode only */}
                      {isEditing && (
                        <button
                          onClick={() => {
                            if (isMobile) {
                              setPlatformView('add')
                              handleMobileEditNavigation('platforms')
                            } else {
                              handleOpenPlatformsAdd()
                            }
                          }}
                          aria-label="Add a new link"
                          title="Add a new link"
                          className="
                            w-11 h-11 rounded-full 
                            flex items-center justify-center
                            transition-all duration-200
                            bg-[#0e172a]
                            hover:opacity-90
                            hover:scale-105
                            hover:shadow-lg hover:shadow-[#0e172a]/50
                            focus:outline-none focus:ring-2 focus:ring-[#0e172a] focus:ring-offset-2
                            text-white
                            shadow-md
                            flex-shrink-0
                          "
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {isEditing ? (
                    // Edit mode - Card-style block with header
                    <div className="w-full max-w-md mb-6">
                      <button
                        onClick={() => {
                          if (isMobile) {
                            handleMobileEditNavigation('bio')
                          } else {
                            setSidebarView('bio')
                          }
                        }}
                        className={`
                          w-full rounded-xl
                          ${store.theme === 'LIGHT'
                            ? 'bg-[#F8FAFB] border border-gray-200'
                            : 'bg-gray-900 border border-gray-800'
                          }
                        `}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between px-5 py-3.5">
                          <span className="font-bold text-sm">Bio</span>
                          <ChevronRight className={`h-5 w-5 ${store.theme === 'LIGHT' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="px-5 pb-4 pt-2">
                          {store.bio ? (
                            <p className="text-sm leading-relaxed text-center">
                              {store.bio}
                            </p>
                          ) : (
                            <p className={`text-sm ${store.theme === 'LIGHT' ? 'text-gray-500' : 'text-gray-400'} text-center`}>
                              Add bio to your profile
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  ) : (
                    // Preview/Public mode - Clickable on desktop to open bio in sidebar
                    store.bio && (
                      <button
                        onClick={() => {
                          if (!isMobile) {
                            setMode('edit')
                            setSidebarView('bio')
                          }
                        }}
                        className={`text-sm leading-relaxed max-w-prose mb-4 text-left ${!isMobile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      >
                        {store.bio}
                      </button>
                    )
                  )}
                </div>

                  {/* Categories - COMMENTED OUT TO HIDE FROM STORE DISPLAY */}
                  {/* {store.categories && store.categories.length > 0 && (
                    <div className="relative inline-block group/categories">
                      <div 
                        className={`flex flex-wrap justify-center gap-2 ${
                          isEditing ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => isEditing && setShowCategoriesModal(true)}
                      >
                        {store.categories.map((category, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              store.theme === 'LIGHT'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-800 text-gray-200'
                            } ${
                              isEditing 
                                ? 'group-hover/categories:ring-2 group-hover/categories:ring-[#D4D7DC] group-hover/categories:ring-offset-2' 
                                : ''
                            }`}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      {isEditing && (
                        <Pencil className="absolute top-0 -left-5 h-3.5 w-3.5 text-gray-500 opacity-0 group-hover/categories:opacity-80 transition-opacity duration-200 pointer-events-none" />
                      )}
                    </div>
                  )} */}

                  {/* Custom Links */}
                  {(customLinks.length > 0 || isEditing) && (
                    <div className="w-full max-w-md relative" style={{ zIndex: 25 }}>
                      {isEditing ? (
                        // Edit mode - Wrap in card-style box like Bio
                        <div
                          className={`
                            w-full rounded-xl
                            ${store.theme === 'LIGHT'
                              ? 'bg-[#F8FAFB] border border-gray-200'
                              : 'bg-gray-900 border border-gray-800'
                            }
                          `}
                        >
                          {/* Header Row */}
                          <button
                            onClick={() => {
                              if (isMobile) {
                                setCustomLinkView('manager')
                                handleMobileEditNavigation('customLinks')
                              }
                            }}
                            className={`w-full flex items-center justify-between px-5 py-3.5 ${isMobile ? 'cursor-pointer' : ''}`}
                          >
                            <span className="font-bold text-sm">Links</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isMobile) {
                                    setSidebarView('customLinks')
                                    setCustomLinkView('add')
                                    setEditingCustomLinkId(undefined)
                                  } else {
                                    handleQuickAddCustomLink()
                                  }
                                }}
                                className="p-1 hover:opacity-80 transition-opacity"
                                aria-label="Add new link"
                              >
                                <Plus className={`h-5 w-5 ${store.theme === 'LIGHT' ? 'text-gray-400' : 'text-gray-500'}`} />
                              </button>
                              {isMobile && !isEditing && (
                                <ChevronRight className={`h-5 w-5 ${store.theme === 'LIGHT' ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>
                          </button>
                          
                          {/* Links Content */}
                          <div className="px-5 pb-5 pt-2">
                            <div className="flex flex-wrap gap-3">
                      {/* Existing Links - Edit Mode */}
                      {customLinks.map((link, index) => {
                        const platformIcon = detectPlatformFromUrl(link.url)
                        const displayIcon = link.customIconUrl || platformIcon
                        const isFirst = index === 0
                        const isLast = index === customLinks.length - 1
                        const isFeatured = link.thumbnailSize && link.thumbnailSize !== 'none'
                        
                        // Featured link in edit mode
                        if (isFeatured) {
                            const height = link.thumbnailSize === 'big' ? 'h-[262px] md:h-[262px]' : 'h-[161px] md:h-[161px]'
                            const width = link.thumbnailSize === 'big' ? 'w-full' : 'w-[calc(50%-0.375rem)]'
                            return (
                              <div
                                key={link.id}
                                onClick={() => handleEditCustomLink(link.id)}
                                className={`
                                  relative ${height} ${width} rounded-xl overflow-hidden
                                  transition-all duration-200 group cursor-pointer
                                `}
                              >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                  {link.thumbnailUrl ? (
                                    <>
                                      <img
                                        src={link.thumbnailUrl}
                                        alt={link.title}
                                        className="w-full h-full object-cover"
                                      />
                                      {/* Dark overlay */}
                                      <div className="absolute inset-0 bg-black/20" />
                                    </>
                                  ) : (
                                    <>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                          src={getIconUrlForBackground(link.customIconUrl, platformIcon, store?.theme)}
                                          alt="Icon background"
                                          className="w-3/4 h-3/4 object-contain opacity-30"
                                        />
                                      </div>
                                      {/* Dark overlay */}
                                      <div className="absolute inset-0 bg-black/40" />
                                    </>
                                  )}
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
                                    <PlatformIcon iconName={displayIcon} className="h-8 w-8 drop-shadow-lg" theme={store?.theme} />
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
                                
                                {/* Three-dot menu */}
                                <div className="absolute top-2 right-2 z-20">
                                  <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className={`
                                      h-8 w-8 flex items-center justify-center rounded-full
                                      transition-all duration-200
                                      ${store.theme === 'LIGHT'
                                        ? 'hover:bg-gray-200 text-gray-600'
                                        : 'hover:bg-gray-700 text-gray-400'
                                      }
                                    `}
                                    aria-label="Link actions"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    disabled={isFirst}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveCustomLinkUp(link.id)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <MoveUp className="h-4 w-4 mr-2" />
                                    Move Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={isLast}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveCustomLinkDown(link.id)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <MoveDown className="h-4 w-4 mr-2" />
                                    Move Down
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteCustomLink(link.id)
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                              </div>
                            )
                          }
                          
                          // Regular link in edit mode
                          return (
                            <div
                              key={link.id}
                              className={`
                                flex items-center gap-3 w-full px-6 py-4 rounded-xl font-medium
                                transition-all duration-200
                                ${store.theme === 'LIGHT'
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-gray-800 text-white'
                                }
                                relative group
                              `}
                            >
                              {link.customIconUrl ? (
                                <img
                                  src={link.customIconUrl}
                                  alt="Link icon"
                                  className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <PlatformIcon iconName={platformIcon} className="h-8 w-8 flex-shrink-0" theme={store?.theme} />
                              )}
                              <button
                                onClick={() => handleEditCustomLink(link.id)}
                                className="flex-1 text-center hover:opacity-80 transition-opacity"
                              >
                                {link.title}
                              </button>
                              
                              {/* Three-dot menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className={`
                                      h-8 w-8 flex items-center justify-center rounded-full
                                      transition-all duration-200
                                      ${store.theme === 'LIGHT'
                                        ? 'hover:bg-gray-200 text-gray-600'
                                        : 'hover:bg-gray-700 text-gray-400'
                                      }
                                    `}
                                    aria-label="Link actions"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    disabled={isFirst}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveCustomLinkUp(link.id)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <MoveUp className="h-4 w-4 mr-2" />
                                    Move Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={isLast}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveCustomLinkDown(link.id)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <MoveDown className="h-4 w-4 mr-2" />
                                    Move Down
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteCustomLink(link.id)
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                      })}

                      {/* Add Link Card - Edit mode only */}
                        <button
                          onClick={() => {
                            if (isMobile) {
                              setCustomLinkView('add')
                              handleMobileEditNavigation('customLinks')
                            } else {
                              handleQuickAddCustomLink()
                            }
                          }}
                          className={`
                            w-full px-6 py-8 rounded-xl border-2 border-dashed
                            transition-all duration-200
                            hover:scale-[1.02] hover:shadow-lg
                            ${store.theme === 'LIGHT'
                              ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
                              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-900/50 text-gray-400'
                            }
                            flex flex-col items-center justify-center gap-2
                          `}
                        >
                          <Plus className="h-6 w-6" />
                          <p className="font-medium">Add Link</p>
                          <p className={`text-xs ${store.theme === 'LIGHT' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Click here to add content
                          </p>
                        </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Preview/Public mode - Simple list without box
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-3">
                      {customLinks.map((link) => {
                        const platformIcon = detectPlatformFromUrl(link.url)
                        const displayIcon = link.customIconUrl || platformIcon
                        const isFeatured = link.thumbnailSize && link.thumbnailSize !== 'none'
                        
                        // Featured link in preview mode
                        if (isFeatured) {
                          const height = link.thumbnailSize === 'big' ? 'h-[262px] md:h-[262px]' : 'h-[161px] md:h-[161px]'
                          const width = link.thumbnailSize === 'big' ? 'w-full' : 'w-[calc(50%-0.375rem)]'
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`
                                relative block ${width} ${height} rounded-xl overflow-hidden
                                transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                              `}
                            >
                              {/* Background Image */}
                              <div className="absolute inset-0">
                                {link.thumbnailUrl ? (
                                  <>
                                    <img
                                      src={link.thumbnailUrl}
                                      alt={link.title}
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-black/20" />
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      {/* Gradient background for more visual interest */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
                                      {/* Subtle pattern overlay */}
                                      <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                                      }} />
                                      {/* Icon - more prominent */}
                                      <img
                                        src={getIconUrlForBackground(link.customIconUrl, platformIcon, store?.theme)}
                                        alt="Icon background"
                                        className="w-2/3 h-2/3 object-contain opacity-60 relative z-10"
                                      />
                                      {/* Lighter overlay for better contrast */}
                                      <div className="absolute inset-0 bg-black/20" />
                                      {/* Border to define the edges */}
                                      <div className="absolute inset-0 border-2 border-white/10 rounded-xl" />
                                    </div>
                                  </>
                                )}
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
                                  <PlatformIcon iconName={displayIcon} className="h-8 w-8 drop-shadow-lg" theme={store?.theme} />
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
                        
                        // Regular link in preview mode
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
                        </div>
                      )}
                    </div>
                  )}

                {/* Spacer for the sticky button in preview mode */}
                {!isEditing && (
                  <div className="h-32" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* CONNECT CTA - Preview mode only, not sticky */}
            {!isEditing && (
              <ConnectCTA
                avatarUrl={store.avatarUrl || undefined}
                displayName={store.displayName || undefined}
                theme={store.theme}
                isEditMode={false}
                onConnect={handleConnect}
                sticky={false}
              />
            )}
          </div>
        </div>

          {/* EDITOR SIDEBAR - Show on desktop OR when mobile edit view is open */}
          <aside 
            className={`
              absolute top-0 right-0 h-full w-full lg:w-[380px] z-40
              bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800
              transition-transform duration-300 ease-in-out
              ${isEditing && sidebarView ? 'translate-x-0 pointer-events-auto' : isEditing && !sidebarView ? 'hidden lg:block translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}
            `}
          >
            <div className="relative h-full overflow-hidden">
              {/* TOP FADE EFFECT */}
              <div className="absolute top-0 left-0 right-0 z-10 h-8 bg-gradient-to-b from-white via-white/90 dark:from-gray-950 dark:via-gray-950/90 to-transparent pointer-events-none" />
              
              {/* SCROLLABLE CONTENT */}
              <div className="h-full overflow-y-auto">
                <EditSidebar 
                  store={store} 
                  onUpdate={handleUpdateForSidebar}
                  onPreviewUpdate={handlePreviewUpdate}
                  initialView={sidebarView}
                  initialCustomLinkView={customLinkView}
                  editingCustomLinkId={editingCustomLinkId}
                  initialPlatformView={platformView}
                  editingPlatformNetwork={editingPlatformNetwork}
                  onOpenCustomLinksAdd={handleOpenCustomLinksAdd}
                  onOpenPlatformsAdd={handleOpenPlatformsAdd}
                  onViewChange={(view) => {
                    setSidebarView(view === 'overview' ? undefined : view)
                    if (view === 'overview') {
                      setCustomLinkView(undefined)
                      setEditingCustomLinkId(undefined)
                      setPlatformView(undefined)
                      setEditingPlatformNetwork(undefined)
                    }
                  }}
                />
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
        theme={store?.theme}
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
        theme={store?.theme}
      />

      {/* DISPLAY NAME EDIT MODAL */}
      <DisplayNameEditModal
        open={showDisplayNameModal}
        currentName={store.displayName || ''}
        onClose={() => setShowDisplayNameModal(false)}
        onSave={handleSaveDisplayName}
      />

      {/* HANDLE/USERNAME EDIT MODAL */}
      <HandleEditModal
        open={showHandleModal}
        currentHandle={store.handle || ''}
        onClose={() => setShowHandleModal(false)}
        onSave={handleSaveHandle}
      />

      {/* BIO EDIT MODAL */}
      <BioEditModal
        open={showBioModal}
        currentBio={store.bio || ''}
        onClose={() => setShowBioModal(false)}
        onSave={handleSaveBio}
      />

      {/* CATEGORIES EDIT MODAL */}
      <CategoriesEditModal
        open={showCategoriesModal}
        currentCategories={store.categories || []}
        onClose={() => setShowCategoriesModal(false)}
        onSave={handleSaveCategories}
      />

      {/* SELF COLLAB MODAL */}
      <SelfCollabModal
        open={showSelfCollabModal}
        onClose={() => setShowSelfCollabModal(false)}
      />
    </div>
  )
}
