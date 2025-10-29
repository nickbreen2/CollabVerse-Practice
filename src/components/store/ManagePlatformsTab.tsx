'use client'

import { useState, useEffect } from 'react'
import { MoveLeft, MoveRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreatorStore } from '@prisma/client'
import { toast } from '@/components/ui/use-toast'
import LinkManager from './LinkManager'
import AddLinkModal from './AddLinkModal'
import { Platform, getPlatformById } from '@/lib/platformCategories'

interface SocialLink {
  network: string
  url: string
}

interface ManagePlatformsTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onBack: () => void
  initialView?: 'add' | 'edit'
  editingPlatformNetwork?: string
}

type PlatformView = 'add' | 'edit'

export default function ManagePlatformsTab({ store, onUpdate, onBack, initialView, editingPlatformNetwork }: ManagePlatformsTabProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>((store.social as any) || [])
  const [currentView, setCurrentView] = useState<PlatformView>(initialView || 'add')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [editUrl, setEditUrl] = useState('')

  // Update view when initialView changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
    }
  }, [initialView])

  // Update editing platform when editingPlatformNetwork changes
  useEffect(() => {
    if (editingPlatformNetwork) {
      const link = socialLinks.find(l => l.network === editingPlatformNetwork)
      if (link) {
        setEditingLink(link)
        setEditUrl(link.url)
        setCurrentView('edit')
      }
    }
  }, [editingPlatformNetwork, socialLinks])

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform)
    setShowAddModal(true)
  }

  const handleAddLink = async (url: string) => {
    if (!selectedPlatform) return

    const newLinks = [...socialLinks]
    const existingIndex = newLinks.findIndex((l) => l.network === selectedPlatform.id)

    if (existingIndex !== -1) {
      newLinks[existingIndex] = { network: selectedPlatform.id, url }
    } else {
      newLinks.push({ network: selectedPlatform.id, url })
    }

    setSocialLinks(newLinks as any)
    
    try {
      await onUpdate({ social: newLinks as any })
      
      toast({
        title: 'Link added',
        description: `${selectedPlatform.name} link has been added`,
      })

      // Close modal and go back
      setShowAddModal(false)
      setSelectedPlatform(null)
      onBack()
    } catch (error) {
      setSocialLinks(socialLinks as any)
      toast({
        variant: 'destructive',
        title: 'Failed to add link',
        description: 'Could not save the link. Please try again.',
      })
    }
  }

  const handleUpdateLink = async () => {
    if (!editingLink) return

    if (!editUrl.trim()) {
      toast({
        variant: 'destructive',
        title: 'URL required',
        description: 'Please enter a URL',
      })
      return
    }

    const previousLinks = socialLinks
    const newLinks = socialLinks.map((l) =>
      l.network === editingLink.network ? { ...l, url: editUrl } : l
    )

    setSocialLinks(newLinks as any)

    try {
      await onUpdate({ social: newLinks as any })

      const platform = getPlatformById(editingLink.network)
      toast({
        title: 'Link updated',
        description: `${platform?.name || 'Platform'} link has been updated`,
      })

      // Update the editingLink to reflect the new URL
      setEditingLink({ ...editingLink, url: editUrl })
    } catch (error) {
      setSocialLinks(previousLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to update link',
        description: 'Could not save changes. Please try again.',
      })
    }
  }

  const handleDeleteLink = async () => {
    if (!editingLink) return

    const platform = getPlatformById(editingLink.network)
    
    if (!window.confirm(`Are you sure you want to delete the ${platform?.name || 'platform'} link?`)) {
      return
    }

    const previousLinks = socialLinks
    const newLinks = socialLinks.filter((l) => l.network !== editingLink.network)

    setSocialLinks(newLinks as any)

    try {
      await onUpdate({ social: newLinks as any })

      toast({
        title: 'Link deleted',
        description: `${platform?.name || 'Platform'} link has been removed`,
      })

      onBack()
      setEditingLink(null)
    } catch (error) {
      setSocialLinks(previousLinks)
      toast({
        variant: 'destructive',
        title: 'Failed to delete link',
        description: 'Could not delete the link. Please try again.',
      })
    }
  }

  const handleMoveLeft = async () => {
    if (!editingLink) return

    const currentIndex = socialLinks.findIndex((l) => l.network === editingLink.network)
    if (currentIndex <= 0) return

    const newLinks = [...socialLinks]
    ;[newLinks[currentIndex - 1], newLinks[currentIndex]] = [newLinks[currentIndex], newLinks[currentIndex - 1]]

    setSocialLinks(newLinks as any)

    try {
      await onUpdate({ social: newLinks as any })
    } catch (error) {
      setSocialLinks(socialLinks as any)
      toast({
        variant: 'destructive',
        title: 'Failed to move',
        description: 'Could not reorder links. Please try again.',
      })
    }
  }

  const handleMoveRight = async () => {
    if (!editingLink) return

    const currentIndex = socialLinks.findIndex((l) => l.network === editingLink.network)
    if (currentIndex < 0 || currentIndex >= socialLinks.length - 1) return

    const newLinks = [...socialLinks]
    ;[newLinks[currentIndex], newLinks[currentIndex + 1]] = [newLinks[currentIndex + 1], newLinks[currentIndex]]

    setSocialLinks(newLinks as any)

    try {
      await onUpdate({ social: newLinks as any })
    } catch (error) {
      setSocialLinks(socialLinks as any)
      toast({
        variant: 'destructive',
        title: 'Failed to move',
        description: 'Could not reorder links. Please try again.',
      })
    }
  }

  // Edit view
  if (currentView === 'edit' && editingLink) {
    const platform = getPlatformById(editingLink.network)
    const currentIndex = socialLinks.findIndex((l) => l.network === editingLink.network)
    const isFirst = currentIndex === 0
    const isLast = currentIndex === socialLinks.length - 1

    return (
      <div className="h-full flex flex-col">
        {/* Header with Close Button */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Edit {platform?.name || 'Platform'}</h3>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* URL Field */}
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onBlur={() => {
                  if (editUrl !== editingLink?.url) {
                    handleUpdateLink()
                  }
                }}
                placeholder={platform?.placeholder || 'https://...'}
                type="text"
              />
              <p className="text-xs text-muted-foreground">
                Enter the full URL for your {platform?.name || 'platform'} profile
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Move Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleMoveLeft}
                  disabled={isFirst}
                  variant="outline"
                  className="w-full"
                >
                  <MoveLeft className="h-4 w-4 mr-2" />
                  Move Left
                </Button>
                <Button
                  onClick={handleMoveRight}
                  disabled={isLast}
                  variant="outline"
                  className="w-full"
                >
                  <MoveRight className="h-4 w-4 mr-2" />
                  Move Right
                </Button>
              </div>

            </div>

            {/* Delete Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={handleDeleteLink}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add view (platform selector + modal)
  return (
    <>
      <LinkManager
        onSelectPlatform={handleSelectPlatform}
        onBack={onBack}
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
