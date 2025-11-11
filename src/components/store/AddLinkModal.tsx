'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Platform } from '@/lib/platformCategories'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'

interface AddLinkModalProps {
  platform: Platform | null
  open: boolean
  onClose: () => void
  onAdd: (url: string) => void
  theme?: 'LIGHT' | 'DARK'
}

export default function AddLinkModal({
  platform,
  open,
  onClose,
  onAdd,
  theme,
}: AddLinkModalProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleAdd = () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    if (!platform?.id.includes('zelle') && !isValidUrl(url.trim())) {
      setError('Please enter a valid URL')
      return
    }

    onAdd(url.trim())
    setUrl('')
    setError('')
    onClose()
  }

  const isValidUrl = (str: string): boolean => {
    try {
      // Allow URLs with or without protocol
      const urlString = str.startsWith('http') ? str : `https://${str}`
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleClose = () => {
    setUrl('')
    setError('')
    onClose()
  }

  if (!platform) return null

  const Icon = getPlatformIcon(platform.icon, theme)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Icon className="w-8 h-8 object-contain" />
            </div>
            <DialogTitle>Add {platform.name} link</DialogTitle>
          </div>
          <DialogDescription>
            Enter your {platform.name} profile URL below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">
              {platform.id === 'zelle' ? 'Email or Phone' : 'Profile URL'}
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              placeholder={platform.placeholder || `https://${platform.name.toLowerCase()}.com/...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd()
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!url.trim()}>
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

