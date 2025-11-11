'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { User, Building2, Mail, DollarSign, X as XIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CollabRequestPageProps {
  handle: string
  creatorId: string
  creatorAvatar?: string
  creatorName?: string
  theme: 'LIGHT' | 'DARK'
}

export default function CollabRequestPage({
  handle,
  creatorId,
  creatorAvatar,
  creatorName,
  theme,
}: CollabRequestPageProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [email, setEmail] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [links, setLinks] = useState<string[]>([])

  const handleClose = () => {
    router.push(`/${handle}`)
  }

  const normalizeUrl = (url: string): string => {
    url = url.trim()
    if (!url) return url
    
    // If it already has http:// or https://, return as is
    if (/^https?:\/\//i.test(url)) {
      return url
    }
    
    // Add https:// prefix
    return 'https://' + url
  }

  const isValidUrl = (url: string): boolean => {
    try {
      const normalized = normalizeUrl(url)
      new URL(normalized)
      return /^https?:\/\//i.test(normalized)
    } catch {
      return false
    }
  }

  const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = linkInput.trim()
      
      if (!value) return
      
      if (links.length >= 5) {
        setErrors({ ...errors, links: 'Maximum 5 links allowed' })
        return
      }

      if (!isValidUrl(value)) {
        setErrors({ ...errors, links: 'Please enter a valid URL' })
        return
      }

      const normalized = normalizeUrl(value)
      if (links.includes(normalized)) {
        setErrors({ ...errors, links: 'Link already added' })
        return
      }

      setLinks([...links, normalized])
      setLinkInput('')
      setErrors({ ...errors, links: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
    setErrors({ ...errors, links: '' })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (budget && !/^\d*\.?\d+$/.test(budget.replace(/[^0-9.]/g, ''))) {
      newErrors.budget = 'Budget must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/collabs/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          senderName: fullName.trim(),
          brandName: brandName.trim() || undefined,
          senderEmail: email.trim(),
          budget: budget ? budget.replace(/[^0-9.]/g, '') : undefined,
          description: description.trim() || undefined,
          links: links.length > 0 ? links : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request')
      }

      toast({
        title: 'Request sent!',
        description: "We'll email you a copy.",
      })

      // Navigate back to the store
      router.push(`/${handle}`)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't send your request. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'LIGHT' ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className={`relative overflow-hidden rounded-3xl border shadow-2xl ${
          theme === 'LIGHT'
            ? 'bg-white text-black'
            : 'bg-black text-white border-gray-800'
        }`}>
          {/* Close Icon */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center pt-8 pb-6 px-6">
            {/* Creator Avatar */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden mb-4 ring-4 ring-gray-100 dark:ring-gray-800">
              {creatorAvatar ? (
                <Image
                  src={creatorAvatar}
                  alt={creatorName || 'Creator'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {creatorName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-bold mb-2">Request Collaboration</h2>
            <p className="text-sm text-muted-foreground">
              Drop me a message below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Full Name */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setErrors({ ...errors, fullName: '' })
                  }}
                  className={cn(
                    'pl-10',
                    errors.fullName && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  disabled={submitting}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Brand Name */}
            <div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: '' })
                  }}
                  className={cn(
                    'pl-10',
                    errors.email && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  disabled={submitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value)
                    setErrors({ ...errors, budget: '' })
                  }}
                  className={cn(
                    'pl-10',
                    errors.budget && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  disabled={submitting}
                />
              </div>
              {errors.budget && (
                <p className="text-xs text-red-500 mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={submitting}
              />
            </div>

            {/* Additional Links */}
            <div>
              <Input
                type="text"
                placeholder="Additional Links"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value)
                  setErrors({ ...errors, links: '' })
                }}
                onKeyDown={handleAddLink}
                disabled={submitting}
                className={cn(
                  errors.links && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.links && (
                <p className="text-xs text-red-500 mt-1">{errors.links}</p>
              )}
              
              {/* Link Pills */}
              {links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm"
                    >
                      <span className="truncate max-w-[180px]">
                        Link {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        disabled={submitting}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="text-center py-2">
                <p className="text-sm text-red-500">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              className="w-full font-semibold py-6 rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>Send Collaboration Request</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

