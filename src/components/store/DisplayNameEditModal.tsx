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

interface DisplayNameEditModalProps {
  open: boolean
  currentName: string
  onClose: () => void
  onSave: (newName: string) => void
}

export default function DisplayNameEditModal({
  open,
  currentName,
  onClose,
  onSave,
}: DisplayNameEditModalProps) {
  const [displayName, setDisplayName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when currentName changes or modal opens
  useEffect(() => {
    if (open) {
      setDisplayName(currentName)
    }
  }, [open, currentName])

  const handleSave = async () => {
    if (!displayName.trim()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(displayName.trim())
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(currentName) // Reset to original
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Display Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your Name"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {displayName.length}/50
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
              disabled={isSaving || !displayName.trim()}
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

