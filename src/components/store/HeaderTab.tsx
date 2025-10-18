'use client'

import React, { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Upload, Check } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/components/ui/use-toast'

interface HeaderTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onBack: () => void
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

export default function HeaderTab({ store, onUpdate, onBack }: HeaderTabProps) {
  const [formData, setFormData] = useState({
    displayName: store.displayName || '',
    location: store.location || '',
    bio: store.bio || '',
  })
  const [categories, setCategories] = useState<string[]>(store.categories || [])
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const initials = formData.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

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
          <h3 className="text-base font-semibold">Header</h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="City, Country"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {formData.location.length}/60
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
      </div>
    </div>
  )
}

