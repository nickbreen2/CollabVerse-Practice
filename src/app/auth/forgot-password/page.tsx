'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to send reset email',
        })
        return
      }

      setSent(true)
      toast({
        title: 'Email sent',
        description: 'Check your inbox for password reset instructions',
      })
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
          <div className="flex justify-center mb-4">
            <Image
              src="/icons/collablink-full-logo.svg"
              alt="CollabLink"
              width={268}
              height={56}
              priority
            />
          </div>
          <p className="mt-2 text-muted-foreground">
            {sent ? 'Check your email' : 'Reset your password'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-xl border">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                If an account exists with that email, we&apos;ve sent you a
                password reset link.
              </p>
              <p className="text-sm text-muted-foreground">
                Check your inbox and click the link to reset your password.
              </p>
              <Button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                Send another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/auth/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

