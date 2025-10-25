'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import HandleInput from '@/components/HandleInput'
import { toast } from '@/components/ui/use-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    handle: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">CollabLink</h1>
          <p className="mt-2 text-muted-foreground">
            Create your creator profile
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-xl border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">Your Handle</Label>
              <HandleInput
                value={formData.handle}
                onChange={(value) =>
                  setFormData({ ...formData, handle: value })
                }
                error={errors.handle}
              />
              <p className="text-xs text-muted-foreground">
                3-30 characters. Letters, numbers, and hyphens only.
              </p>
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

