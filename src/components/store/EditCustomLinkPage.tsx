'use client'

import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomLink } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditCustomLinkPageProps {
  link: CustomLink
  onBack: () => void
  onSave: (link: CustomLink) => void
  onDelete: (linkId: string) => void
}

export default function EditCustomLinkPage({ link, onBack, onSave, onDelete }: EditCustomLinkPageProps) {
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [errors, setErrors] = useState({ title: '', url: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const normalizeUrl = (value: string): string => {
    // Step 1: Trim whitespace
    value = value.trim()
    
    // Step 2: Check if it already has a valid scheme
    if (/^https?:\/\//i.test(value)) {
      return value
    }
    
    // Step 3: Check for other known schemes (leave as is)
    if (/^(mailto|tel|ftp|ftps|chrome-extension|file):/i.test(value)) {
      return value
    }
    
    // Step 4: Protocol-relative URL (starts with //)
    if (value.startsWith('//')) {
      return 'https:' + value
    }
    
    // Step 5: No scheme detected, prefix with https://
    return 'https://' + value
  }

  const validateUrl = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleUrlBlur = () => {
    if (url.trim()) {
      const normalized = normalizeUrl(url)
      setUrl(normalized)
      if (errors.url) setErrors({ ...errors, url: '' })
    }
  }

  const handleSave = () => {
    const newErrors = { title: '', url: '' }
    let hasError = false

    if (!title.trim()) {
      newErrors.title = 'Title is required'
      hasError = true
    }

    // Normalize URL before validation
    const normalizedUrl = url.trim() ? normalizeUrl(url) : ''
    
    if (!normalizedUrl) {
      newErrors.url = 'URL is required'
      hasError = true
    } else if (!validateUrl(normalizedUrl)) {
      newErrors.url = 'Please enter a valid URL'
      hasError = true
    }

    setErrors(newErrors)

    if (!hasError) {
      setIsSaving(true)
      // Update the URL field to show normalized value
      setUrl(normalizedUrl)
      onSave({
        ...link,
        title: title.trim(),
        url: normalizedUrl
      })
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    onDelete(link.id)
    setShowDeleteDialog(false)
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
          <h3 className="text-base font-semibold">Edit Link</h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: '' })
              }}
              placeholder="e.g., My Portfolio"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {title.length}/100
            </p>
          </div>

          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="url">
              URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (errors.url) setErrors({ ...errors, url: '' })
              }}
              onBlur={handleUrlBlur}
              placeholder="example.com or https://example.com"
              type="text"
            />
            {errors.url && (
              <p className="text-xs text-red-500">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              We'll automatically add https:// if needed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Delete Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Link
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{link.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



