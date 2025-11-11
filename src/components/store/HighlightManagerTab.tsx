'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, Pencil } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { Highlight } from '@/types'
import AddHighlightPage from './AddHighlightPage'
import EditHighlightPage from './EditHighlightPage'
import VideoEmbed from './VideoEmbed'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface HighlightManagerTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void | Promise<void>
  onBack: () => void
  initialView?: HighlightView
  editingHighlightId?: string
}

type HighlightView = 'manager' | 'add' | 'edit'

export default function HighlightManagerTab({ store, onUpdate, onBack, initialView, editingHighlightId }: HighlightManagerTabProps) {
  const [highlights, setHighlights] = useState<Highlight[]>((store.highlights as unknown as Highlight[]) || [])
  const [currentView, setCurrentView] = useState<HighlightView>(initialView || 'manager')
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null)

  // Sync highlights with store prop when it changes
  useEffect(() => {
    const storeHighlights = (store.highlights as unknown as Highlight[]) || []
    setHighlights(storeHighlights)
  }, [store.highlights])

  // Update view when initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
    }
  }, [initialView])

  // Update editing highlight when editingHighlightId changes
  useEffect(() => {
    if (editingHighlightId) {
      const highlight = highlights.find(h => h.id === editingHighlightId)
      if (highlight) {
        setEditingHighlight(highlight)
        setCurrentView('edit')
      }
    }
  }, [editingHighlightId, highlights])

  const handleAddHighlight = async (videoUrl: string, title?: string) => {
    // Check limit
    if (highlights.length >= 3) {
      toast({
        variant: 'destructive',
        title: 'Limit reached',
        description: 'You can only add up to 3 highlights',
      })
      return
    }

    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      videoUrl,
      title,
    }

    const newHighlights = [...highlights, newHighlight]
    setHighlights(newHighlights)
    
    try {
      const updatedStore = await onUpdate({ highlights: newHighlights as any }) as any
      console.log('Highlight saved successfully, updated store:', updatedStore)
      
      // Update local state with the server response to ensure consistency
      if (updatedStore?.highlights) {
        setHighlights(updatedStore.highlights as Highlight[])
      }
      
      toast({
        title: 'Highlight added',
        description: 'Your highlight has been added',
      })

      onBack()
    } catch (error) {
      // Revert on error
      setHighlights(highlights)
      console.error('Error adding highlight:', error)
      const errorMessage = error instanceof Error ? error.message : 'Could not save the highlight. Please try again.'
      toast({
        variant: 'destructive',
        title: 'Failed to add highlight',
        description: errorMessage,
      })
    }
  }

  const handleUpdateHighlight = async (updatedHighlight: Highlight) => {
    const previousHighlights = highlights
    const newHighlights = highlights.map(highlight => 
      highlight.id === updatedHighlight.id ? updatedHighlight : highlight
    )
    setHighlights(newHighlights)
    
    try {
      await onUpdate({ highlights: newHighlights as any })
      
      toast({
        title: 'Highlight updated',
        description: 'Your highlight has been updated',
      })

      onBack()
      setEditingHighlight(null)
    } catch (error) {
      // Revert on error
      setHighlights(previousHighlights)
      toast({
        variant: 'destructive',
        title: 'Failed to update highlight',
        description: 'Could not save changes. Please try again.',
      })
    }
  }

  const handleDeleteHighlight = async (highlightId: string) => {
    const previousHighlights = highlights
    const newHighlights = highlights.filter(highlight => highlight.id !== highlightId)
    setHighlights(newHighlights)
    
    try {
      await onUpdate({ highlights: newHighlights as any })
      
      toast({
        title: 'Highlight removed',
        description: 'Highlight has been removed',
      })

      onBack()
      setEditingHighlight(null)
    } catch (error) {
      // Revert on error
      setHighlights(previousHighlights)
      toast({
        variant: 'destructive',
        title: 'Failed to delete highlight',
        description: 'Could not delete the highlight. Please try again.',
      })
    }
  }

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight)
    setCurrentView('edit')
  }

  const handleBackToManager = () => {
    // Go back to overview instead of showing manager
    onBack()
    setEditingHighlight(null)
  }

  // Render different views
  if (currentView === 'add') {
    return (
      <AddHighlightPage
        onBack={handleBackToManager}
        onSave={handleAddHighlight}
        theme={store.theme}
      />
    )
  }

  if (currentView === 'edit' && editingHighlight) {
    return (
      <EditHighlightPage
        highlight={editingHighlight}
        onBack={handleBackToManager}
        onSave={handleUpdateHighlight}
        onDelete={handleDeleteHighlight}
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
          <h3 className="text-base font-semibold">Highlights</h3>
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
          {/* Add Highlight Button */}
          {highlights.length < 3 && (
            <Button
              type="button"
              className="w-full mb-4"
              variant="gradient"
              onClick={() => setCurrentView('add')}
            >
              <Plus className="w-4 h-4 mr-2 text-white" />
              Add highlight
            </Button>
          )}

          {/* Highlights List */}
          {highlights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Video className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm">No highlights yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div
                  key={highlight.id}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 bg-white dark:bg-gray-950"
                >
                  {/* Video Preview Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Highlight Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {highlight.title || `Highlight ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Video
                    </p>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(highlight)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    aria-label="Edit highlight"
                  >
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {highlights.length >= 3 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-sm text-center">
              You've reached the maximum of 3 highlights
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

