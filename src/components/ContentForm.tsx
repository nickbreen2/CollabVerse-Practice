'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, Check, Plus } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/components/ui/use-toast'
import LinkManager from '@/components/store/LinkManager'
import AddLinkModal from '@/components/store/AddLinkModal'
import AddedLinksList from '@/components/store/AddedLinksList'
import { Platform } from '@/lib/platformCategories'

interface ContentFormProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onOpenLinkManager?: () => void
}

const CONTENT_CATEGORIES = [
  'Fashion',
  'Beauty',
  'Lifestyle',
  'Fitness',
  'Gaming',
  'Technology',
  'Food',
  'Travel',
  'Music',
  'Dance',
  'Comedy',
  'Education',
]

export default function ContentForm({ store, onUpdate, onOpenLinkManager }: ContentFormProps) {
  const [formData, setFormData] = useState({
    displayName: store.displayName || '',
    bio: store.bio || '',
  })
  const [categories, setCategories] = useState<string[]>(store.categories || [])
  const [socialLinks, setSocialLinks] = useState<any[]>((store.social as any[]) || [])
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showLinkManager, setShowLinkManager] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Expose the function to parent via callback
  useEffect(() => {
    if (onOpenLinkManager) {
      // This allows parent to trigger opening the link manager
      (window as any).__openLinkManager = () => setShowLinkManager(true)
    }
    return () => {
      delete (window as any).__openLinkManager
    }
  }, [onOpenLinkManager])

  // Debounced save
  const debouncedSave = useDebounce((data: any) => {
    onUpdate(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, 400)

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    debouncedSave(newData)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: data.error,
        })
        return
      }

      onUpdate({ avatarUrl: data.url })
      toast({
        title: 'Success',
        description: 'Profile image uploaded',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload image',
      })
    } finally {
      setUploading(false)
    }
  }

  const toggleCategory = (category: string) => {
    let newCategories: string[]
    if (categories.includes(category)) {
      newCategories = categories.filter((c) => c !== category)
    } else {
      if (categories.length >= 5) {
        toast({
          variant: 'destructive',
          title: 'Maximum reached',
          description: 'You can select up to 5 categories',
        })
        return
      }
      newCategories = [...categories, category]
    }
    setCategories(newCategories)
    debouncedSave({ categories: newCategories })
  }

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

  const initials = formData.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  // If showing link manager, render that instead
  if (showLinkManager) {
    return (
      <>
        <LinkManager
          onSelectPlatform={handleSelectPlatform}
          onBack={() => setShowLinkManager(false)}
          addedPlatformIds={socialLinks.map(link => link.network)}
          theme={store.theme}
        />
        <AddLinkModal
          platform={selectedPlatform}
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setSelectedPlatform(null)
          }}
          onAdd={handleAddLink}
          theme={store.theme}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saved indicator */}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span>Saved</span>
        </div>
      )}

      {/* Profile Image */}
      <div className="space-y-2">
        <Label>Profile Image</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={store.avatarUrl || undefined} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max 2MB.
        </p>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => handleFieldChange('displayName', e.target.value)}
          placeholder="Your Name"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          {formData.displayName.length}/50
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleFieldChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={280}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/280
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <Label>Social Media Links</Label>
        
        {/* Added Links List */}
        <AddedLinksList 
          links={socialLinks} 
          onDelete={handleDeleteLink}
          theme={store.theme}
        />

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

      {/* Categories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Content Categories</Label>
          <span className="text-xs text-muted-foreground">
            {categories.length}/5
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CONTENT_CATEGORIES.map((category) => {
            const isSelected = categories.includes(category)
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

