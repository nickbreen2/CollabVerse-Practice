'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatorStore } from '@prisma/client'
import { ChevronRight, ArrowLeft, User, Heart, Link, MessageCircle, Video } from 'lucide-react'
import HeaderTab from './HeaderTab'
import ManagePlatformsTab from './ManagePlatformsTab'
import CustomLinkManagerTab from './CustomLinkManagerTab'
import HighlightManagerTab from './HighlightManagerTab'
import BioTab from './BioTab'
import DesignForm from '../DesignForm'

interface EditSidebarProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void | Promise<void>
  onPreviewUpdate?: (data: Partial<CreatorStore>) => void
  initialView?: SidebarView
  initialCustomLinkView?: 'manager' | 'add' | 'edit'
  editingCustomLinkId?: string
  initialPlatformView?: 'add' | 'edit'
  editingPlatformNetwork?: string
  onViewChange?: (view: SidebarView) => void
  onOpenCustomLinksAdd?: () => void
  onOpenPlatformsAdd?: () => void
}

type SidebarView = 'overview' | 'header' | 'platforms' | 'customLinks' | 'highlights' | 'bio'

export default function EditSidebar({ store, onUpdate, onPreviewUpdate, initialView, initialCustomLinkView, editingCustomLinkId, initialPlatformView, editingPlatformNetwork, onViewChange, onOpenCustomLinksAdd, onOpenPlatformsAdd }: EditSidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>(initialView || 'overview')
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content')

  // Update view when initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
    }
  }, [initialView])

  const handleBack = () => {
    setCurrentView('overview')
    onViewChange?.('overview')
  }

  const handleOpenCustomLinks = () => {
    if (onOpenCustomLinksAdd) {
      onOpenCustomLinksAdd()
    } else {
      setCurrentView('customLinks')
    }
  }

  const handleOpenPlatforms = () => {
    if (onOpenPlatformsAdd) {
      onOpenPlatformsAdd()
    } else {
      setCurrentView('platforms')
    }
  }

  const renderContentView = () => {
    switch (currentView) {
      case 'header':
        return <HeaderTab store={store} onUpdate={onUpdate} onBack={handleBack} />
      case 'platforms':
        return <ManagePlatformsTab store={store} onUpdate={onUpdate} onBack={handleBack} initialView={initialPlatformView} editingPlatformNetwork={editingPlatformNetwork} />
      case 'bio':
        return <BioTab store={store} onUpdate={onUpdate} onBack={handleBack} />
      case 'customLinks':
        return <CustomLinkManagerTab store={store} onUpdate={onUpdate} onBack={handleBack} initialView={initialCustomLinkView} editingLinkId={editingCustomLinkId} />
      case 'highlights':
        return <HighlightManagerTab store={store} onUpdate={onUpdate} onBack={handleBack} />
      case 'overview':
      default:
        return (
          <div className="space-y-4 px-6 py-6">
            {/* Header Section Title */}
            <div className="px-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Header</h3>
            </div>

            {/* Header Section */}
            <button
              onClick={() => setCurrentView('header')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Personal Info</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Manage Platforms Section */}
            <button
              onClick={handleOpenPlatforms}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Manage Platforms</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Bio Section */}
            <button
              onClick={() => setCurrentView('bio')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Bio</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Body Section Title */}
            <div className="px-2 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Body</h3>
            </div>

            {/* Custom Link Section */}
            <button
              onClick={handleOpenCustomLinks}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Link className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Custom Link</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Highlights Section */}
            <button
              onClick={() => setCurrentView('highlights')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Video className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Highlights</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        )
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'content' | 'design')} className="w-full h-full flex flex-col">
      {/* STICKY HEADER - TABS */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-950 px-6 pt-4 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4">Edit Store</h2>
        
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1">
            Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex-1">
            Design
          </TabsTrigger>
        </TabsList>
      </div>
      
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="content" className="mt-0 h-full">
          {renderContentView()}
        </TabsContent>
        
        <TabsContent value="design" className="mt-0 px-6 py-6">
          <DesignForm store={store} onUpdate={onUpdate} onPreviewUpdate={onPreviewUpdate} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

