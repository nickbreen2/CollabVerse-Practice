'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { CreatorStore } from '@prisma/client'

interface DesignFormProps {
  store: CreatorStore
  onUpdate: (data: Partial<CreatorStore>) => void
  onPreviewUpdate?: (data: Partial<CreatorStore>) => void
}

export default function DesignForm({ store, onUpdate, onPreviewUpdate }: DesignFormProps) {
  // Track the selected theme (what user has chosen)
  const [selectedTheme, setSelectedTheme] = useState<'LIGHT' | 'DARK'>(store.theme)
  // Track what's actually saved in the backend (to compare against for hasChanges)
  const [savedTheme, setSavedTheme] = useState<'LIGHT' | 'DARK'>(store.theme)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync from store only on initial load or external changes
  useEffect(() => {
    // Only update if store.theme changed externally (e.g., from server reload)
    // and it's different from what we have saved
    if (store.theme !== savedTheme && store.theme !== selectedTheme) {
      setSelectedTheme(store.theme)
      setSavedTheme(store.theme)
    }
  }, [store.theme, savedTheme, selectedTheme])

  // Check if there are unsaved changes (compare against what's saved)
  const hasChanges = selectedTheme !== savedTheme

  const handleThemeChange = (theme: 'LIGHT' | 'DARK') => {
    // Only update the selected theme (for button highlighting)
    // Don't update the preview or save yet
    setSelectedTheme(theme)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to backend
      await onUpdate({ theme: selectedTheme })
      // Update saved theme after successful save
      setSavedTheme(selectedTheme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      // Error handling is done in onUpdate
      // On error, don't update savedTheme so user can try again
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {/* Saved indicator */}
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="space-y-3">
          <Label>Theme</Label>
          <p className="text-xs text-muted-foreground">
            Choose the color theme for your store
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange('DARK')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTheme === 'DARK'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="space-y-2">
                <div className="w-full h-16 bg-black rounded border flex items-center justify-center text-xs font-medium text-gray-300">
                  Dark
                </div>
                <div className="text-sm font-medium text-center">Dark</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('LIGHT')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTheme === 'LIGHT'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="space-y-2">
                <div className="w-full h-16 bg-white rounded border flex items-center justify-center text-xs font-medium text-gray-700">
                  Light
                </div>
                <div className="text-sm font-medium text-center">Light</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Save Button Footer - Shows when there are changes */}
      {hasChanges && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
            variant="gradient"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}

