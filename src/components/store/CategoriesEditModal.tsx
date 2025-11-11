'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface CategoriesEditModalProps {
  open: boolean
  currentCategories: string[]
  onClose: () => void
  onSave: (newCategories: string[]) => void
}

const CONTENT_CATEGORIES = [
  'Fashion',
  'Beauty',
  'Lifestyle',
  'Fitness',
  'Gaming',
  'Technology',
  'Food',
  'Travel',
  'Music',
  'Dance',
  'Comedy',
  'Education',
]

export default function CategoriesEditModal({
  open,
  currentCategories,
  onClose,
  onSave,
}: CategoriesEditModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when currentCategories changes or modal opens
  useEffect(() => {
    if (open) {
      setSelectedCategories(currentCategories)
    }
  }, [open, currentCategories])

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      if (selectedCategories.length >= 5) {
        toast({
          variant: 'destructive',
          title: 'Maximum reached',
          description: 'You can select up to 5 categories',
        })
        return
      }
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedCategories)
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedCategories(currentCategories) // Reset to original
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Content Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select up to 5 categories</Label>
              <span className="text-xs text-muted-foreground">
                {selectedCategories.length}/5
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTENT_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category)
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
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

