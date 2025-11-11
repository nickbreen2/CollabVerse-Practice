'use client'

import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { CreatorStore } from '@prisma/client'
import { toast } from '@/components/ui/use-toast'

interface BioTabProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void | Promise<void>
  onBack: () => void
}

export default function BioTab({ store, onUpdate, onBack }: BioTabProps) {
  const [bio, setBio] = useState(store.bio || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onUpdate({ bio })
    setSaved(true)
    toast({
      title: 'Success',
      description: 'Bio updated successfully',
    })
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Button */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-950 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Bio</h3>
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
          {/* Saved indicator */}
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>Saved</span>
            </div>
          )}

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={280}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/280
            </p>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full"
            disabled={bio === store.bio}
            variant="gradient"
          >
            Save Bio
          </Button>
        </div>
      </div>
    </div>
  )
}

