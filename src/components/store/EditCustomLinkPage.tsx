'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Trash2, Link as LinkIcon, Image as ImageIcon, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomLink } from '@/types'
import { PlatformIcon } from '@/components/icons/PlatformIcons'
import { detectPlatformFromUrl } from '@/lib/detectPlatform'
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
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(link.thumbnailUrl)
  const [thumbnailSize, setThumbnailSize] = useState<'big' | 'small' | 'none'>(link.thumbnailSize || 'none')
  const [customIconUrl, setCustomIconUrl] = useState<string | undefined>(link.customIconUrl)
  const [errors, setErrors] = useState({ title: '', url: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [isHoveringPreview, setIsHoveringPreview] = useState(false)
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or SVG)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploadingThumbnail(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setThumbnailUrl(data.url)
      // Default to big thumbnail when uploading
      if (thumbnailSize === 'none') {
        setThumbnailSize('big')
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or SVG)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploadingIcon(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setCustomIconUrl(data.url)
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('Failed to upload icon')
    } finally {
      setIsUploadingIcon(false)
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
        url: normalizedUrl,
        thumbnailUrl,
        thumbnailSize,
        customIconUrl
      })
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    onDelete(link.id)
    setShowDeleteDialog(false)
  }

  const platformIcon = url ? detectPlatformFromUrl(url) : 'custom-link'
  const displayIcon = customIconUrl ? customIconUrl : platformIcon

  // Calculate preview dimensions based on thumbnail size
  const getPreviewDimensions = () => {
    if (thumbnailSize === 'none') {
      return { height: 'h-16' } // Default link height
    }
    if (thumbnailSize === 'big') {
      return { height: 'h-[262px] md:h-[262px]' } // Big thumbnail
    }
    return { height: 'h-[161px] md:h-[161px]' } // Small thumbnail
  }

  const previewDimensions = getPreviewDimensions()

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
          <h3 className="text-base font-semibold">Edit Featured Link</h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-44">
        <div className="space-y-6">
          {/* Preview Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Preview:</Label>
            
            {/* Link Preview */}
            <div
              className={`
                w-full rounded-xl overflow-hidden transition-all duration-200
                ${thumbnailSize !== 'none' 
                  ? 'bg-gray-900 dark:bg-gray-800' 
                  : 'bg-gray-100 dark:bg-gray-800'
                } relative cursor-pointer
                ${previewDimensions.height}
              `}
              onClick={() => thumbnailInputRef.current?.click()}
              onMouseEnter={() => setIsHoveringPreview(true)}
              onMouseLeave={() => setIsHoveringPreview(false)}
            >
              {/* Thumbnail Background */}
              {thumbnailUrl && thumbnailSize !== 'none' ? (
                <div className="absolute inset-0">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ) : thumbnailSize !== 'none' ? (
                // Placeholder for when size is selected but no image uploaded
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              ) : null}

              {/* Hover Overlay - Only for thumbnail modes */}
              {thumbnailSize !== 'none' && isHoveringPreview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200">
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {thumbnailUrl ? 'Switch image' : 'Upload image'}
                    </span>
                  </div>
                </div>
              )}

              {/* Link Content */}
              {thumbnailSize === 'none' ? (
                // Standard link layout (no thumbnail)
                <div className="relative h-full flex items-center gap-3 px-6 py-4">
                  {/* Icon */}
                  {customIconUrl ? (
                    <img
                      src={customIconUrl}
                      alt="Custom icon"
                      className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <PlatformIcon iconName={displayIcon} className="h-8 w-8 flex-shrink-0" />
                  )}
                  
                  {/* Title (live preview) */}
                  <span className="flex-1 text-center font-medium text-gray-900 dark:text-white">
                    {title.trim() || 'Title'}
                  </span>
                  
                  {/* Spacer */}
                  <div className="w-8" />
                </div>
              ) : (
                // Thumbnail layout (small or big)
                <div className="relative h-full flex flex-col">
                  {/* Icon at top-left */}
                  <div className="absolute top-4 left-4 z-10">
                    {customIconUrl ? (
                      <img
                        src={customIconUrl}
                        alt="Custom icon"
                        className="h-8 w-8 rounded-lg object-cover shadow-lg"
                      />
                    ) : (
                      <PlatformIcon iconName={displayIcon} className="h-8 w-8 drop-shadow-lg" />
                    )}
                  </div>

                  {/* Title at bottom-center */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-center">
                      <span className="text-white font-semibold text-lg drop-shadow-lg">
                        {title.trim() || 'Title'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Thumbnail Button */}
            <button
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isUploadingThumbnail}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isUploadingThumbnail ? 'Uploading...' : 'Click on preview to upload thumbnail'}
            </button>

            {/* Thumbnail Size Info */}
            {thumbnailSize === 'big' && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Big featured links render roughly 538×262 (~2:1) on desktop
                <br />
                and 398×241 (~5:3) on mobile.
              </p>
            )}
            {thumbnailSize === 'small' && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Small featured links render roughly 262×161 (~13:8) on
                <br />
                desktop and 193×122 (~8:5) on mobile.
              </p>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </div>

          {/* URL Field (moved before title as shown in screenshot) */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm">
              Website URL, phone number or email
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (errors.url) setErrors({ ...errors, url: '' })
              }}
              onBlur={handleUrlBlur}
              placeholder="Website URL, phone number or email"
              type="text"
              className="bg-gray-100 dark:bg-gray-800 border-0"
            />
            {errors.url && (
              <p className="text-xs text-red-500">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tip: Enter a phone number or email — we'll auto-format it as an SMS or Email link on save.
            </p>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: '' })
              }}
              placeholder="Title"
              maxLength={100}
              className="bg-gray-100 dark:bg-gray-800 border-0"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
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

      {/* Fixed Footer with Actions and Save Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 space-y-3">
          {/* Action Buttons - Side by Side */}
          <div className="flex gap-2">
            {/* Resize Thumbnail Button */}
            <Button
              onClick={() => setShowThumbnailSelector(true)}
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs h-9"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Resize thumbnail
            </Button>

            {/* Upload Link Icon Button */}
            <Button
              onClick={() => iconInputRef.current?.click()}
              disabled={isUploadingIcon}
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs h-9"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {isUploadingIcon ? 'Uploading...' : 'Upload link icon'}
            </Button>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={handleIconUpload}
              className="hidden"
            />
          </div>

          {/* Reset Icon Button (if custom icon is uploaded) */}
          {customIconUrl && (
            <button
              onClick={() => setCustomIconUrl(undefined)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors w-full justify-center"
            >
              <X className="h-4 w-4" />
              Reset to platform icon
            </button>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#0E172A] hover:bg-[#1a2942] text-white font-semibold py-6 text-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
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

      {/* Thumbnail Size Selector Bottom Sheet */}
      {showThumbnailSelector && (
        <>
          {/* Backdrop - dims only canvas/left side, not the sidebar */}
          <div
            className="fixed inset-y-0 left-0 right-[380px] bg-black/50 z-30 animate-in fade-in duration-200"
            onClick={() => setShowThumbnailSelector(false)}
          />
          
          {/* Bottom Sheet - attached to sidebar, same width */}
          <div className="fixed right-0 bottom-0 w-[380px] z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white dark:bg-gray-950 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-l border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Resize Thumbnail</h3>
                  <button
                    onClick={() => setShowThumbnailSelector(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Choose a thumbnail size for your featured link</p>
                
                <div className="space-y-3">
                  {/* Big Thumbnail Option */}
                  <button
                    onClick={() => {
                      setThumbnailSize('big')
                      setShowThumbnailSelector(false)
                    }}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all
                      ${thumbnailSize === 'big' 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-8 w-8" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">Big Thumbnail</p>
                        <p className="text-xs text-muted-foreground">538×262 (desktop) / 398×241 (mobile)</p>
                      </div>
                    </div>
                  </button>

                  {/* Small Thumbnail Option */}
                  <button
                    onClick={() => {
                      setThumbnailSize('small')
                      setShowThumbnailSelector(false)
                    }}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all
                      ${thumbnailSize === 'small' 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-6 w-6" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">Small Thumbnail</p>
                        <p className="text-xs text-muted-foreground">262×161 (desktop) / 193×122 (mobile)</p>
                      </div>
                    </div>
                  </button>

                  {/* No Thumbnail Option */}
                  <button
                    onClick={() => {
                      setThumbnailSize('none')
                      setShowThumbnailSelector(false)
                    }}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all
                      ${thumbnailSize === 'none' 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">No Thumbnail</p>
                        <p className="text-xs text-muted-foreground">Default link size</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
