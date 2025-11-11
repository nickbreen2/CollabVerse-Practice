'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface BioEditModalProps {
  open: boolean
  currentBio: string
  onClose: () => void
  onSave: (newBio: string) => void
}

export default function BioEditModal({
  open,
  currentBio,
  onClose,
  onSave,
}: BioEditModalProps) {
  const [bio, setBio] = useState(currentBio)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when currentBio changes or modal opens
  useEffect(() => {
    if (open) {
      setBio(currentBio)
    }
  }, [open, currentBio])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(bio.trim())
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setBio(currentBio) // Reset to original
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only Escape to cancel (Enter should create new line in textarea)
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell us about yourself..."
              maxLength={280}
              rows={4}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/280
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
              disabled={isSaving}
              variant="gradient"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

