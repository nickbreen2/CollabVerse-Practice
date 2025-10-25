'use client'

import { Input } from '@/components/ui/input'

interface HandleInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function HandleInput({ value, onChange, error }: HandleInputProps) {
  return (
    <div>
      <div className="flex items-center rounded-md border bg-background overflow-hidden">
        <span className="px-3 py-2 text-sm text-muted-foreground select-none whitespace-nowrap bg-muted">
          collabl.ink/
        </span>
        <Input
          className="border-0 focus-visible:ring-0 shadow-none"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="username"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}

