'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatorStore } from '@prisma/client'
import { ChevronRight, ArrowLeft, User, Heart } from 'lucide-react'
import HeaderTab from './HeaderTab'
import ManagePlatformsTab from './ManagePlatformsTab'
import DesignForm from '../DesignForm'

interface EditSidebarProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
}

type SidebarView = 'overview' | 'header' | 'platforms'

export default function EditSidebar({ store, onUpdate }: EditSidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>('overview')
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content')

  const handleBack = () => {
    setCurrentView('overview')
  }

  const renderContentView = () => {
    switch (currentView) {
      case 'header':
        return <HeaderTab store={store} onUpdate={onUpdate} onBack={handleBack} />
      case 'platforms':
        return <ManagePlatformsTab store={store} onUpdate={onUpdate} onBack={handleBack} />
      case 'overview':
      default:
        return (
          <div className="space-y-4 px-6 py-6">
            {/* Section Title */}
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
                <span className="font-medium text-sm">Header</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Manage Platforms Section */}
            <button
              onClick={() => setCurrentView('platforms')}
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
          <DesignForm store={store} onUpdate={onUpdate} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

