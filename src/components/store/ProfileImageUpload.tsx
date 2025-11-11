'use client'

import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pencil } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface ProfileImageUploadProps {
  avatarUrl: string | null
  initials: string
  onUpdate: (avatarUrl: string) => void
  showHoverOverlay?: boolean
  className?: string
  isBannerMode?: boolean
}

export default function ProfileImageUpload({
  avatarUrl,
  initials,
  onUpdate,
  showHoverOverlay = false,
  className = 'h-32 w-32',
  isBannerMode = false,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      onUpdate(data.url)
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

  const handleClick = () => {
    if (showHoverOverlay && !uploading) {
      fileInputRef.current?.click()
    }
  }

  // Banner mode - full width/height overlay
  if (isBannerMode) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
        
        <div
          className={`absolute inset-0 ${showHoverOverlay ? 'cursor-pointer' : ''} z-40`}
          onMouseEnter={() => showHoverOverlay && setIsHovered(true)}
          onMouseLeave={() => showHoverOverlay && setIsHovered(false)}
          onClick={handleClick}
        >
          {/* Hover Overlay for banner - Pill button with glass effect */}
          {showHoverOverlay && (
            <div
              className={`
                absolute inset-0
                flex items-center justify-center
                transition-opacity duration-200
                ${isHovered || uploading ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <button
                className={`
                  px-6 py-3 rounded-full
                  flex items-center gap-2
                  backdrop-blur-md
                  border border-white/30
                  shadow-lg
                  transition-all duration-200
                  ${uploading 
                    ? 'bg-white/20 text-white cursor-wait' 
                    : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer hover:scale-105'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                disabled={uploading}
              >
                <Pencil className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Change Background image'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default circular avatar mode
  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
      
      <div
        className={`relative ${showHoverOverlay ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => showHoverOverlay && setIsHovered(true)}
        onMouseLeave={() => showHoverOverlay && setIsHovered(false)}
        onClick={handleClick}
      >
        <Avatar className={`${className} border-4 border-white/45 dark:border-black/45 shadow-xl transition-all duration-200 ${isHovered && showHoverOverlay ? 'ring-2 ring-[#D4D7DC]' : ''}`}>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Hover Overlay - Only shown when showHoverOverlay is true */}
        {showHoverOverlay && (
          <div
            className={`
              absolute inset-0 rounded-full
              flex flex-col items-center justify-center
              bg-black/60 backdrop-blur-sm
              transition-opacity duration-200
              ${isHovered || uploading ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <Pencil className="h-5 w-5 text-white mb-1.5" />
            <span className="text-white text-xs font-medium px-2 text-center">
              {uploading ? 'Uploading...' : 'Change profile image'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

