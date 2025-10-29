'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface HandleEditModalProps {
  open: boolean
  currentHandle: string
  onClose: () => void
  onSave: (newHandle: string) => Promise<void>
}

export default function HandleEditModal({
  open,
  currentHandle,
  onClose,
  onSave,
}: HandleEditModalProps) {
  const [handle, setHandle] = useState(currentHandle)
  const [isSaving, setIsSaving] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  // Update local state when currentHandle changes or modal opens
  useEffect(() => {
    if (open) {
      setHandle(currentHandle)
      setError('')
      setIsAvailable(null)
    }
  }, [open, currentHandle])

  // Validate and check handle availability
  useEffect(() => {
    const checkHandle = async () => {
      const value = handle.trim()
      
      // Reset states
      setError('')
      setIsAvailable(null)

      if (!value) {
        setError('Username is required')
        return
      }

      // Format validation
      const handleRegex = /^[a-z0-9_]{3,20}$/
      if (!handleRegex.test(value)) {
        if (value.length < 3) {
          setError('Username must be at least 3 characters')
        } else if (value.length > 20) {
          setError('Username must be 20 characters or less')
        } else {
          setError('Only lowercase letters, numbers, and underscores allowed')
        }
        return
      }

      // Skip uniqueness check if handle hasn't changed
      if (value === currentHandle) {
        setIsAvailable(true)
        return
      }

      // Check uniqueness
      setIsChecking(true)
      try {
        const response = await fetch(`/api/settings/check-username?username=${value}`)
        const data = await response.json()

        if (!data.available) {
          setError('Username already taken')
          setIsAvailable(false)
        } else {
          setIsAvailable(true)
        }
      } catch (error) {
        setError('Failed to check username availability')
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    // Debounce the check
    const timer = setTimeout(() => {
      if (handle) {
        checkHandle()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [handle, currentHandle])

  const handleSave = async () => {
    if (!handle.trim() || error || isAvailable === false) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(handle.trim())
      onClose()
    } catch (error) {
      setError('Failed to update username')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setHandle(currentHandle) // Reset to original
    setError('')
    setIsAvailable(null)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!error && isAvailable) {
        handleSave()
      }
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Username</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
                placeholder="username"
                maxLength={20}
                autoFocus
                className="pl-7"
              />
            </div>
            {isChecking && (
              <p className="text-xs text-muted-foreground">
                Checking availability...
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            {isAvailable && !error && handle !== currentHandle && (
              <p className="text-xs text-green-600">Username available!</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters. Lowercase letters, numbers, and underscores only.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isChecking || !!error || isAvailable === false}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

