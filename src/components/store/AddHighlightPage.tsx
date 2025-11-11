'use client'

import { useState } from 'react'
import { Video as VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidVideoUrl, getVideoPlatformName, getVideoUrlFormatHint } from '@/lib/videoEmbed'
import VideoEmbed from './VideoEmbed'

interface AddHighlightPageProps {
  onBack: () => void
  onSave: (videoUrl: string, title?: string) => void
  theme?: 'LIGHT' | 'DARK'
}

export default function AddHighlightPage({ onBack, onSave, theme }: AddHighlightPageProps) {
  const [videoUrl, setVideoUrl] = useState('')
  const [errors, setErrors] = useState({ videoUrl: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const normalizeUrl = (value: string): string => {
    value = value.trim()
    
    if (/^https?:\/\//i.test(value)) {
      return value
    }
    
    if (/^(mailto|tel|ftp|ftps):/i.test(value)) {
      return value
    }
    
    if (value.startsWith('//')) {
      return 'https:' + value
    }
    
    return 'https://' + value
  }

  const handleUrlBlur = () => {
    if (videoUrl.trim()) {
      const normalized = normalizeUrl(videoUrl)
      setVideoUrl(normalized)
      
      // Validate video URL
      const valid = isValidVideoUrl(normalized)
      setIsValid(valid)
      
      if (!valid) {
        const hint = getVideoUrlFormatHint(normalized)
        setErrors({ 
          ...errors, 
          videoUrl: hint || 'Please enter a valid YouTube, TikTok, Instagram, or Vimeo video URL' 
        })
        setShowPreview(false)
      } else {
        setErrors({ ...errors, videoUrl: '' })
        setShowPreview(true)
      }
    } else {
      setIsValid(false)
    }
  }

  const handleSave = async () => {
    // Validate
    const newErrors = { videoUrl: '' }
    
    if (!videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL is required'
      setIsValid(false)
    } else {
      const normalized = normalizeUrl(videoUrl)
      const valid = isValidVideoUrl(normalized)
      setIsValid(valid)
      
      if (!valid) {
        const hint = getVideoUrlFormatHint(normalized)
        newErrors.videoUrl = hint || 'Please enter a valid YouTube, TikTok, Instagram, or Vimeo video URL'
      } else {
        // Ensure we're using the normalized URL
        setVideoUrl(normalized)
      }
    }
    
    if (newErrors.videoUrl) {
      setErrors(newErrors)
      return
    }
    
    setIsSaving(true)
    
    try {
      // Use normalized URL for saving
      const normalized = normalizeUrl(videoUrl)
      await onSave(normalized, undefined)
    } catch (error) {
      console.error('Error saving highlight:', error)
      setErrors({ ...errors, videoUrl: 'Failed to save highlight. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const platformName = videoUrl ? getVideoPlatformName(videoUrl) : ''

  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Button */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Add Highlight</h3>
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
        <div className="space-y-6">
          {/* Video URL Input */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <VideoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value)
                if (errors.videoUrl) setErrors({ ...errors, videoUrl: '' })
                setShowPreview(false)
                setIsValid(false) // Reset validation state when user types
              }}
                onBlur={handleUrlBlur}
                className={`pl-10 ${errors.videoUrl ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.videoUrl && (
              <p className="text-xs text-red-500">{errors.videoUrl}</p>
            )}
            {platformName && !errors.videoUrl && (
              <p className="text-xs text-gray-500">Detected: {platformName}</p>
            )}
          </div>

          {/* Preview */}
          {showPreview && videoUrl && !errors.videoUrl && isValid && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <VideoEmbed url={videoUrl} theme={theme} />
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-lg text-sm bg-[#ebecf3]">
            <p className="font-medium mb-1 text-black">Supported platforms:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-black">
              <li>YouTube</li>
              <li>TikTok</li>
              <li>Instagram (Posts & Reels)</li>
              <li>Vimeo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="gradient"
            className="flex-1"
            disabled={isSaving || !videoUrl.trim() || !isValid}
          >
            {isSaving ? 'Saving...' : 'Save Highlight'}
          </Button>
        </div>
      </div>
    </div>
  )
}

