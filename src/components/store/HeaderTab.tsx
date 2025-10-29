'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X as CloseIcon, Upload, Check, X } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { toast } from '@/components/ui/use-toast'

interface HeaderTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onBack: () => void
}


export default function HeaderTab({ store, onUpdate, onBack }: HeaderTabProps) {
  const [formData, setFormData] = useState({
    displayName: store.displayName || '',
    location: store.location || '',
  })
  const [handle, setHandle] = useState(store.handle || '')
  const [handleError, setHandleError] = useState('')
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)
  const [isCheckingHandle, setIsCheckingHandle] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if there are unsaved changes
  const hasChanges = 
    formData.displayName !== (store.displayName || '') ||
    formData.location !== (store.location || '') ||
    handle !== store.handle

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
  }

  // Real-time handle validation with debounce
  useEffect(() => {
    const checkHandleAvailability = async () => {
      const value = handle.trim()
      
      // Reset states
      setHandleError('')
      setHandleAvailable(null)

      if (!value) {
        setHandleError('Handle is required')
        return
      }

      // Format validation
      const handleRegex = /^[a-z0-9_]{3,20}$/
      if (!handleRegex.test(value)) {
        if (value.length < 3) {
          setHandleError('Handle must be at least 3 characters')
        } else if (value.length > 20) {
          setHandleError('Handle must be 20 characters or less')
        } else {
          setHandleError('Only lowercase letters, numbers, and underscores allowed')
        }
        return
      }

      // Skip uniqueness check if handle hasn't changed
      if (value === store.handle) {
        setHandleAvailable(true)
        return
      }

      // Check uniqueness with debounce
      setIsCheckingHandle(true)
      try {
        const response = await fetch(`/api/settings/check-username?username=${value}`)
        const data = await response.json()

        if (!data.available) {
          setHandleError('Handle already taken')
          setHandleAvailable(false)
        } else {
          setHandleAvailable(true)
        }
      } catch (error) {
        setHandleError('Failed to check handle availability')
        setHandleAvailable(null)
      } finally {
        setIsCheckingHandle(false)
      }
    }

    // Debounce the check
    const timer = setTimeout(() => {
      if (handle) {
        checkHandleAvailability()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [handle, store.handle])

  const checkHandle = async (value: string) => {
    if (!value) {
      setHandleError('Handle is required')
      return false
    }

    // Format validation
    const handleRegex = /^[a-z0-9_]{3,20}$/
    if (!handleRegex.test(value)) {
      return false
    }

    // Skip uniqueness check if handle hasn't changed
    if (value === store.handle) {
      return true
    }

    // Use the already checked availability
    return handleAvailable === true
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

  const handleHandleChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setHandle(sanitized)
  }

  const handleSave = async () => {
    // Validate handle if it changed
    if (handle !== store.handle) {
      const isValid = await checkHandle(handle)
      if (!isValid) {
        toast({
          variant: 'destructive',
          title: 'Invalid Handle',
          description: handleError || 'Please fix the handle before saving',
        })
        return
      }
    }

    setIsSaving(true)
    try {
      // Save all changes
      await onUpdate({
        displayName: formData.displayName,
        location: formData.location,
        handle: handle,
      })
      
      toast({
        title: 'Success',
        description: 'Personal info updated successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save changes',
      })
    } finally {
      setIsSaving(false)
    }
  }


  const initials = formData.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Button */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Personal Info</h3>
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

          {/* Handle */}
          <div className="space-y-2">
            <Label htmlFor="handle">Handle (@username)</Label>
            <div className="flex items-center rounded-md border bg-background overflow-hidden">
              <span className="px-3 py-2 text-sm text-muted-foreground select-none whitespace-nowrap bg-muted">
                collabl.ink/
              </span>
              <Input
                id="handle"
                className="border-0 focus-visible:ring-0 shadow-none"
                value={handle}
                onChange={(e) => handleHandleChange(e.target.value)}
                placeholder="username"
                maxLength={20}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCheckingHandle && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {!isCheckingHandle && handleError && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <X className="h-3 w-3" />
                    <span>{handleError}</span>
                  </div>
                )}
                {!isCheckingHandle && !handleError && handleAvailable && handle !== store.handle && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    <span>Handle available</span>
                  </div>
                )}
                {!isCheckingHandle && !handleError && handle === store.handle && (
                  <p className="text-xs text-muted-foreground">Current handle</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {handle.length}/20
              </p>
            </div>
          </div>

          {/* Save Button at Bottom - Shows when there are changes */}
          {hasChanges && (
            <Button 
              onClick={handleSave}
              disabled={isSaving || isCheckingHandle || !!handleError}
              className="w-full mt-6"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

