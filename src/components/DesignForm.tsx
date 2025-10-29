'use client'

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Check } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface DesignFormProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
}

export default function DesignForm({ store, onUpdate }: DesignFormProps) {
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      onUpdate({ bannerUrl: data.url })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast({
        title: 'Success',
        description: 'Banner image uploaded',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload banner',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleThemeChange = (theme: 'LIGHT' | 'DARK') => {
    onUpdate({ theme })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      {/* Background Image */}
      <div className="space-y-2">
        <Label>Background Image</Label>
        {store.bannerUrl && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
            <Image
              src={store.bannerUrl}
              alt="Banner preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleBannerUpload}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : store.bannerUrl ? 'Change Image' : 'Upload Image'}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max 2MB. Recommended: 1200x400px
        </p>
      </div>

      {/* Theme Toggle */}
      <div className="space-y-3">
        <Label>Base Color Theme</Label>
        <p className="text-xs text-muted-foreground">
          The background image will fade into this base color
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleThemeChange('LIGHT')}
            className={`p-4 rounded-lg border-2 transition-all ${
              store.theme === 'LIGHT'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="space-y-2">
              <div className="w-full h-16 bg-white rounded border flex items-center justify-center text-xs font-medium text-gray-700">
                Light
              </div>
              <div className="text-sm font-medium text-center">Light</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('DARK')}
            className={`p-4 rounded-lg border-2 transition-all ${
              store.theme === 'DARK'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="space-y-2">
              <div className="w-full h-16 bg-black rounded border flex items-center justify-center text-xs font-medium text-gray-300">
                Dark
              </div>
              <div className="text-sm font-medium text-center">Dark</div>
            </div>
          </button>
        </div>
      </div>

      {/* Gradient Preview */}
      <div className="space-y-2">
        <Label>Gradient Preview</Label>
        <div
          className={`relative h-32 rounded-lg overflow-hidden border ${
            store.theme === 'LIGHT' ? 'bg-white' : 'bg-black'
          }`}
        >
          {store.bannerUrl && (
            <Image
              src={store.bannerUrl}
              alt="Gradient preview"
              fill
              className="object-cover"
              unoptimized
            />
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${
              store.theme === 'LIGHT' ? 'to-white' : 'to-black'
            }`}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This shows how your banner will fade into the base color
        </p>
      </div>
    </div>
  )
}

