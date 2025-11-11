'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ContentForm from './ContentForm'
import DesignForm from './DesignForm'
import { CreatorStore } from '@prisma/client'

interface EditPanelProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onOpenLinkManager?: () => void
}

export default function EditPanel({ store, onUpdate, onOpenLinkManager }: EditPanelProps) {
  return (
    <Tabs defaultValue="content" className="w-full">
      {/* STICKY HEADER - TABS */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-950 px-6 pt-4 pb-4 border-b border-gray-200 dark:border-gray-800">
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
      <div className="px-6 py-6">
        <TabsContent value="content" className="mt-0">
          <ContentForm store={store} onUpdate={onUpdate} onOpenLinkManager={onOpenLinkManager} />
        </TabsContent>
        
        <TabsContent value="design" className="mt-0">
          <DesignForm store={store} onUpdate={onUpdate} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

