'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Link2, Mail, Lock, User, ChevronDown } from 'lucide-react'
import { getAllPlatforms, getPlatformById } from '@/lib/platformCategories'
import { PlatformIcon } from '@/components/icons/PlatformIcons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    handle: '',
    displayName: '',
    socialPlatform: '',
    socialHandle: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const platforms = getAllPlatforms()
  const selectedPlatform = formData.socialPlatform 
    ? getPlatformById(formData.socialPlatform) 
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validate display name
    if (!formData.displayName.trim()) {
      setErrors({ displayName: 'Display name is required' })
      setLoading(false)
      return
    }

    // Validate social account if platform is selected
    if (formData.socialPlatform && !formData.socialHandle.trim()) {
      setErrors({ socialHandle: 'Please enter your social account handle or URL' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          handle: formData.handle,
          displayName: formData.displayName,
          socialPlatform: formData.socialPlatform || undefined,
          socialHandle: formData.socialHandle || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle 409 Conflict (duplicate email/handle)
        if (response.status === 409 && data.field && data.message) {
          setErrors({ [data.field]: data.message })
          return
        }

        // Handle other errors
        if (data.error) {
          // Try to determine which field the error is for
          if (data.error.toLowerCase().includes('email')) {
            setErrors({ email: data.error })
          } else if (data.error.toLowerCase().includes('handle')) {
            setErrors({ handle: data.error })
          } else if (data.error.toLowerCase().includes('password')) {
            setErrors({ password: data.error })
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: data.error,
            })
          }
        } else if (data.message) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: data.message,
          })
        }
        return
      }

      toast({
        title: 'Success',
        description: 'Account created successfully!',
      })

      router.push('/dashboard/my-store')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/icons/final-collablink-logo.svg"
              alt="CollabLink"
              width={268}
              height={56}
              priority
            />
          </div>
          <p className="mt-2 text-muted-foreground">
            Create your creator profile
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-xl border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CollabLink Handle */}
            <div className="space-y-2">
              <Label htmlFor="handle">CollabLink Handle</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="flex items-center rounded-md border bg-background overflow-hidden">
                  <span className="pl-10 pr-1 py-2.5 text-sm text-muted-foreground select-none whitespace-nowrap">
                    collabl.ink/
                  </span>
                  <Input
                    id="handle"
                    className="border-0 focus-visible:ring-0 shadow-none pl-0"
                    value={formData.handle}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                      })
                    }
                    placeholder="username"
                    required
                  />
                </div>
              </div>
              {errors.handle && (
                <p className="text-sm text-destructive">{errors.handle}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <PasswordInput
                  id="password"
                  className="pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  className="pl-10"
                  placeholder="Your Name"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  required
                />
              </div>
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName}</p>
              )}
            </div>

            {/* Link a Social Account */}
            <div className="space-y-2">
              <Label>Link a Social Account (Optional)</Label>
              <div className="space-y-3">
                {/* Platform Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {selectedPlatform ? (
                          <>
                            <PlatformIcon 
                              iconName={selectedPlatform.icon} 
                              className="h-4 w-4" 
                            />
                            <span>{selectedPlatform.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Select a platform</span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                    {platforms.map((platform) => (
                      <DropdownMenuItem
                        key={platform.id}
                        onClick={() =>
                          setFormData({ ...formData, socialPlatform: platform.id })
                        }
                      >
                        <PlatformIcon 
                          iconName={platform.icon} 
                          className="h-4 w-4 mr-2" 
                        />
                        {platform.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Social Handle Input */}
                {formData.socialPlatform && (
                  <div className="relative">
                    {selectedPlatform && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <PlatformIcon 
                          iconName={selectedPlatform.icon} 
                          className="h-4 w-4" 
                        />
                      </div>
                    )}
                    <Input
                      type="text"
                      className="pl-10"
                      placeholder={selectedPlatform?.placeholder || 'Enter handle or URL'}
                      value={formData.socialHandle}
                      onChange={(e) =>
                        setFormData({ ...formData, socialHandle: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              {errors.socialHandle && (
                <p className="text-sm text-destructive">{errors.socialHandle}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

