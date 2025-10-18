'use client'

import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreatorStore } from '@prisma/client'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/components/ui/use-toast'
import LinkManager from './LinkManager'
import AddLinkModal from './AddLinkModal'
import AddedLinksList from './AddedLinksList'
import { Platform } from '@/lib/platformCategories'

interface ManagePlatformsTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onBack: () => void
}

export default function ManagePlatformsTab({ store, onUpdate, onBack }: ManagePlatformsTabProps) {
  const [socialLinks, setSocialLinks] = useState<any[]>((store.social as any[]) || [])
  const [showLinkManager, setShowLinkManager] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Debounced save
  const debouncedSave = useDebounce((data: any) => {
    onUpdate(data)
  }, 400)

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform)
    setShowAddModal(true)
  }

  const handleAddLink = (url: string) => {
    if (!selectedPlatform) return

    const newLinks = [...socialLinks]
    const existingIndex = newLinks.findIndex((l) => l.network === selectedPlatform.id)

    if (existingIndex !== -1) {
      newLinks[existingIndex] = { network: selectedPlatform.id, url }
    } else {
      newLinks.push({ network: selectedPlatform.id, url })
    }

    setSocialLinks(newLinks)
    debouncedSave({ social: newLinks })
    
    toast({
      title: 'Link added',
      description: `${selectedPlatform.name} link has been added`,
    })
  }

  const handleDeleteLink = (network: string) => {
    const newLinks = socialLinks.filter((l) => l.network !== network)
    setSocialLinks(newLinks)
    debouncedSave({ social: newLinks })
    
    toast({
      title: 'Link removed',
      description: 'Social link has been removed',
    })
  }


  // If showing link manager, render that instead
  if (showLinkManager) {
    return (
      <>
        <LinkManager
          onSelectPlatform={handleSelectPlatform}
          onBack={() => setShowLinkManager(false)}
          addedPlatformIds={socialLinks.map(link => link.network)}
        />
        <AddLinkModal
          platform={selectedPlatform}
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setSelectedPlatform(null)
          }}
          onAdd={handleAddLink}
        />
      </>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-base font-semibold">Manage Platforms</h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Social Media Links</h4>
            
            {/* Added Links List */}
            <AddedLinksList 
              links={socialLinks} 
              onDelete={handleDeleteLink}
            />

            {socialLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No social links added yet</p>
                <p className="text-xs mt-1">Add your first link to get started</p>
              </div>
            )}
          </div>

          {/* Add New Link Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowLinkManager(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a New Link
          </Button>
        </div>
      </div>
    </div>
  )
}

