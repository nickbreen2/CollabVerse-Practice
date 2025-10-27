'use client'

import { useEffect, useState } from 'react'
import EditSidebar from '@/components/store/EditSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ConnectCTA from '@/components/store/ConnectCTA'
import Banner from '@/components/Banner'
import ProfileImageUpload from '@/components/store/ProfileImageUpload'
import DisplayNameEditModal from '@/components/store/DisplayNameEditModal'
import LocationEditModal from '@/components/store/LocationEditModal'
import BioEditModal from '@/components/store/BioEditModal'
import CategoriesEditModal from '@/components/store/CategoriesEditModal'
import SocialIconsDisplay from '@/components/store/SocialIconsDisplay'
import { toast } from '@/components/ui/use-toast'
import { CreatorStore } from '@prisma/client'
import { Eye, Pencil, Plus, MoreVertical, MoveUp, MoveDown, Trash2 } from 'lucide-react'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'
import { getPlatformById, Platform } from '@/lib/platformCategories'
import LinkManagerModal from '@/components/store/LinkManagerModal'
import AddLinkModal from '@/components/store/AddLinkModal'
import SelfCollabModal from '@/components/store/SelfCollabModal'
import { CustomLink } from '@/types'
import { PlatformIcon } from '@/components/icons/PlatformIcons'
import { detectPlatformFromUrl } from '@/lib/detectPlatform'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function MyStorePage() {
  const [store, setStore] = useState<CreatorStore | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [showLinkManagerModal, setShowLinkManagerModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showBioModal, setShowBioModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showSelfCollabModal, setShowSelfCollabModal] = useState(false)
  const [sidebarView, setSidebarView] = useState<'overview' | 'header' | 'platforms' | 'customLinks' | undefined>(undefined)
  const [customLinkView, setCustomLinkView] = useState<'manager' | 'add' | 'edit' | undefined>(undefined)
  const [editingCustomLinkId, setEditingCustomLinkId] = useState<string | undefined>(undefined)
  const [platformView, setPlatformView] = useState<'add' | 'edit' | undefined>(undefined)
  const [editingPlatformNetwork, setEditingPlatformNetwork] = useState<string | undefined>(undefined)

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
      return updatedStore // Return the updated store so callers know the update succeeded
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save changes',
      })
      throw error // Re-throw so callers can handle the error
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
  
  const social = (store.social as any[]) || []
  const customLinks = (store.customLinks as CustomLink[]) || []
  
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
    
    const customLinks = (store.customLinks as CustomLink[]) || []
    const currentIndex = customLinks.findIndex(l => l.id === linkId)
    
    if (currentIndex <= 0) return // Already at top or not found
    
    const newLinks = [...customLinks]
    // Swap with previous item
    ;[newLinks[currentIndex - 1], newLinks[currentIndex]] = [newLinks[currentIndex], newLinks[currentIndex - 1]]
    
    await handleUpdate({ customLinks: newLinks })
  }

  const handleMoveCustomLinkDown = async (linkId: string) => {
    if (!store) return
    
    const customLinks = (store.customLinks as CustomLink[]) || []
    const currentIndex = customLinks.findIndex(l => l.id === linkId)
    
    if (currentIndex < 0 || currentIndex >= customLinks.length - 1) return // Already at bottom or not found
    
    const newLinks = [...customLinks]
    // Swap with next item
    ;[newLinks[currentIndex], newLinks[currentIndex + 1]] = [newLinks[currentIndex + 1], newLinks[currentIndex]]
    
    await handleUpdate({ customLinks: newLinks })
  }

  const handleDeleteCustomLink = (linkId: string) => {
    if (!store) return
    
    const customLinks = (store.customLinks as CustomLink[]) || []
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

  const handleSaveDisplayName = async (newName: string) => {
    await handleUpdate({ displayName: newName })
    toast({
      title: 'Success',
      description: 'Display name updated',
    })
  }

  const handleSaveLocation = async (newLocation: string) => {
    await handleUpdate({ location: newLocation })
    toast({
      title: 'Success',
      description: 'Location updated',
    })
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
        <div className="h-full">
          {/* PREVIEW COLUMN - SCROLLABLE - Centered with sidebar offset in Edit */}
          <div 
            className={`
              flex justify-center items-start overflow-y-auto scrollbar-hide h-full pt-8 pb-6 px-4
              transition-all duration-300 ease-in-out
              ${isEditing ? 'mr-[420px]' : ''}
            `}
          >
            {/* Container for card + sticky button */}
            <div className="relative w-full max-w-[540px] mx-auto">
              {/* PREVIEW CARD — CENTERED */}
              <div
                className={`
                  relative
                  w-full
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

              {/* PROFILE BODY - Fixed Header Position */}
              <div
                className={`
                  relative
                  w-full
                  flex flex-col items-center text-center
                  px-6 pt-24 pb-10
                  sm:px-10 md:pt-32
                  -translate-y-64
                  transition-transform duration-300
                  ${store.theme === 'LIGHT' ? 'bg-white' : 'bg-gradient-to-b from-black via-black/95 to-black'}
                `}
              >
                {/* HEADER SECTION - Fixed position from top */}
                <div className="w-full flex flex-col items-center">
                  {/* Avatar */}
                  <div className="mb-4">
                    <ProfileImageUpload
                      avatarUrl={store.avatarUrl}
                      initials={initials}
                      onUpdate={(url) => handleUpdate({ avatarUrl: url })}
                      showHoverOverlay={isEditing}
                      className="h-32 w-32"
                    />
                  </div>

                {/* Name and Location */}
                <div className="mb-2">
                  <div className="relative inline-block group/name">
                    <h2 
                      className={`text-3xl font-bold ${
                        isEditing 
                          ? 'cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-[#D4D7DC] transition-all' 
                          : ''
                      }`}
                      onClick={() => isEditing && setShowDisplayNameModal(true)}
                    >
                      {store.displayName || 'Your Name'}
                    </h2>
                    {isEditing && (
                      <Pencil className="absolute -top-1 -left-6 h-4 w-4 text-gray-500 opacity-0 group-hover/name:opacity-80 transition-opacity duration-200 pointer-events-none" />
                    )}
                  </div>
                  {store.location && (
                    <div className="relative mt-2">
                      <div className="inline-block group/location">
                        <p 
                          className={`text-sm ${store.theme === 'LIGHT' ? 'text-gray-600' : 'text-gray-400'} ${
                            isEditing 
                              ? 'cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-[#D4D7DC] transition-all' 
                              : ''
                          }`}
                          onClick={() => isEditing && setShowLocationModal(true)}
                        >
                          📍 {store.location}
                        </p>
                        {isEditing && (
                          <Pencil className="absolute top-0 -left-5 h-3.5 w-3.5 text-gray-500 opacity-0 group-hover/location:opacity-80 transition-opacity duration-200 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {store.bio && (
                  <div className="relative inline-block group/bio mb-4">
                    <p 
                      className={`text-sm leading-relaxed max-w-prose ${
                        isEditing 
                          ? 'cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-[#D4D7DC] transition-all' 
                          : ''
                      }`}
                      onClick={() => isEditing && setShowBioModal(true)}
                    >
                      {store.bio}
                    </p>
                    {isEditing && (
                      <Pencil className="absolute top-0 -left-6 h-3.5 w-3.5 text-gray-500 opacity-0 group-hover/bio:opacity-80 transition-opacity duration-200 pointer-events-none" />
                    )}
                  </div>
                )}

                {/* Categories */}
                {store.categories && store.categories.length > 0 && (
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
                )}
                </div>

                {/* BODY SECTION - Scrollable content area */}
                <div className="w-full flex flex-col items-center mt-6">
                  {/* Social Links */}
                  {(social.length > 0 || isEditing) && (
                    <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
                      <SocialIconsDisplay 
                        links={social} 
                        isEditMode={isEditing}
                        onEditClick={handleEditPlatform}
                      />
                      
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
                            bg-gradient-to-br from-[#FF72D2] to-[#A16BFE]
                            hover:scale-105
                            hover:shadow-lg hover:shadow-purple-500/50
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                            text-white
                            shadow-md
                          "
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Custom Links */}
                  {(customLinks.length > 0 || isEditing) && (
                    <div className="w-full max-w-md space-y-3 mt-4">
                      {/* Existing Links */}
                      {customLinks.map((link, index) => {
                        const platformIcon = detectPlatformFromUrl(link.url)
                        const displayIcon = link.customIconUrl || platformIcon
                        const isFirst = index === 0
                        const isLast = index === customLinks.length - 1
                        const isFeatured = link.thumbnailSize && link.thumbnailSize !== 'none' && link.thumbnailUrl
                        
                        // In edit mode, render as button to open editor
                        if (isEditing) {
                          // Featured link in edit mode
                          if (isFeatured) {
                            const height = link.thumbnailSize === 'big' ? 'h-[262px] md:h-[262px]' : 'h-[161px] md:h-[161px]'
                            return (
                              <div
                                key={link.id}
                                className={`
                                  relative ${height} rounded-xl overflow-hidden
                                  transition-all duration-200 group
                                `}
                              >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                  <img
                                    src={link.thumbnailUrl}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Dark overlay */}
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
                                <button
                                  onClick={() => handleEditCustomLink(link.id)}
                                  className="absolute bottom-0 left-0 right-0 p-4 hover:opacity-80 transition-opacity"
                                >
                                  <div className="text-center">
                                    <span className="text-white font-semibold text-lg drop-shadow-lg">
                                      {link.title}
                                    </span>
                                  </div>
                                </button>
                                
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
                                <PlatformIcon iconName={platformIcon} className="h-8 w-8 flex-shrink-0" />
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
                        }
                        
                        // Preview mode - render as clickable link
                        // Featured link in preview mode
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
                                {/* Dark overlay */}
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

                      {/* Add Link Card - Always visible in Edit mode */}
                      {isEditing && (
                        <button
                          onClick={handleQuickAddCustomLink}
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
                      )}
                    </div>
                  )}
                </div>

                {/* Spacer for the sticky button in preview mode */}
                {!isEditing && (
                  <div className="h-32" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* CONNECT CTA - Preview mode only, sticky to scroll container */}
            {!isEditing && (
              <ConnectCTA
                avatarUrl={store.avatarUrl || undefined}
                displayName={store.displayName || undefined}
                theme={store.theme}
                isEditMode={false}
                onConnect={handleConnect}
              />
            )}
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
                <EditSidebar 
                  store={store} 
                  onUpdate={handleUpdate} 
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

      {/* DISPLAY NAME EDIT MODAL */}
      <DisplayNameEditModal
        open={showDisplayNameModal}
        currentName={store.displayName || ''}
        onClose={() => setShowDisplayNameModal(false)}
        onSave={handleSaveDisplayName}
      />

      {/* LOCATION EDIT MODAL */}
      <LocationEditModal
        open={showLocationModal}
        currentLocation={store.location || ''}
        onClose={() => setShowLocationModal(false)}
        onSave={handleSaveLocation}
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
