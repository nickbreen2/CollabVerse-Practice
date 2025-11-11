'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreatorStore } from '@prisma/client'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/components/ui/use-toast'
import { CustomLink } from '@/types'
import AddCustomLinkPage from './AddCustomLinkPage'
import EditCustomLinkPage from './EditCustomLinkPage'
import DraggableCustomLinksList from './DraggableCustomLinksList'

interface CustomLinkManagerTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void | Promise<void>
  onBack: () => void
  initialView?: 'manager' | 'add' | 'edit'
  editingLinkId?: string
}

type CustomLinkView = 'manager' | 'add' | 'edit'

export default function CustomLinkManagerTab({ store, onUpdate, onBack, initialView, editingLinkId }: CustomLinkManagerTabProps) {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>((store.customLinks as unknown as CustomLink[]) || [])
  // Default to 'add' view instead of 'manager' - go directly to create form
  const [currentView, setCurrentView] = useState<CustomLinkView>(initialView || 'add')
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null)

  // Update view when initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
    }
  }, [initialView])

  // Update editing link when editingLinkId changes
  useEffect(() => {
    if (editingLinkId) {
      const link = customLinks.find(l => l.id === editingLinkId)
      if (link) {
        setEditingLink(link)
        setCurrentView('edit')
      }
    }
  }, [editingLinkId, customLinks])

  // Debounced save
  const debouncedSave = useDebounce((data: any) => {
    onUpdate(data)
  }, 400)

  const handleAddLink = async (title: string, url: string, thumbnailUrl?: string, thumbnailSize?: 'big' | 'small' | 'none', customIconUrl?: string) => {
    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      title,
      url,
      thumbnailUrl,
      thumbnailSize,
      customIconUrl
    }

    const newLinks = [...customLinks, newLink]
    setCustomLinks(newLinks)
    
    try {
      // Save immediately (no debounce) to ensure it completes before navigation
      await onUpdate({ customLinks: newLinks as any })
      
      toast({
        title: 'Link added',
        description: `${title} has been added`,
      })

      // Go back to overview after save completes
      onBack()
    } catch (error) {
      // Revert on error
      setCustomLinks(customLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to add link',
        description: 'Could not save the link. Please try again.',
      })
    }
  }

  const handleUpdateLink = async (updatedLink: CustomLink) => {
    const previousLinks = customLinks
    const newLinks = customLinks.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    )
    setCustomLinks(newLinks)
    
    try {
      // Save immediately (no debounce) to ensure it completes before navigation
      await onUpdate({ customLinks: newLinks as any })
      
      toast({
        title: 'Link updated',
        description: `${updatedLink.title} has been updated`,
      })

      // Go back to overview after save completes
      onBack()
      setEditingLink(null)
    } catch (error) {
      // Revert on error
      setCustomLinks(previousLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to update link',
        description: 'Could not save changes. Please try again.',
      })
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    const previousLinks = customLinks
    const newLinks = customLinks.filter(link => link.id !== linkId)
    setCustomLinks(newLinks)
    
    try {
      // Save immediately (no debounce) to ensure it completes before navigation
      await onUpdate({ customLinks: newLinks as any })
      
      toast({
        title: 'Link removed',
        description: 'Custom link has been removed',
      })

      // Go back to overview after save completes
      onBack()
      setEditingLink(null)
    } catch (error) {
      // Revert on error
      setCustomLinks(previousLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to delete link',
        description: 'Could not delete the link. Please try again.',
      })
    }
  }

  const handleEdit = (link: CustomLink) => {
    setEditingLink(link)
    setCurrentView('edit')
  }

  const handleReorderLinks = async (newLinks: CustomLink[]) => {
    const previousLinks = customLinks

    // Optimistically update the UI
    setCustomLinks(newLinks)

    try {
      // Save immediately (no debounce for reordering)
      await onUpdate({ customLinks: newLinks as any })
    } catch (error) {
      // Revert on error
      setCustomLinks(previousLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to reorder',
        description: 'Could not save the new order. Please try again.',
      })
    }
  }

  const handleBackToManager = () => {
    // Go back to overview instead of showing manager
    onBack()
    setEditingLink(null)
  }

  // Render different views based on state
  if (currentView === 'add') {
    return (
      <AddCustomLinkPage
        onBack={handleBackToManager}
        onSave={handleAddLink}
        theme={store.theme}
      />
    )
  }

  if (currentView === 'edit' && editingLink) {
    return (
      <EditCustomLinkPage
        key={editingLink.id}
        link={editingLink}
        onBack={handleBackToManager}
        onSave={handleUpdateLink}
        onDelete={handleDeleteLink}
        theme={store.theme}
      />
    )
  }

  // Manager view
  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Button */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Custom Link</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-3 text-red-600 hover:bg-[#fff2f1] hover:text-red-600"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Add Link Button */}
          <Button
            type="button"
            className="w-full mb-4"
            variant="gradient"
            onClick={() => setCurrentView('add')}
          >
            <Plus className="w-4 h-4 mr-2 text-white" />
            Add link
          </Button>

          {/* Draggable Custom Links List with 6-dot handles */}
          <DraggableCustomLinksList 
            links={customLinks} 
            onEdit={handleEdit}
            onReorder={handleReorderLinks}
          />

          {/* Empty State */}
          {customLinks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No links yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



