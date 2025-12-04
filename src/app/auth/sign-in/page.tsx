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

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Invalid credentials',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Signed in successfully!',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 relative overflow-hidden">
      {/* Blue blur effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] sm:h-[500px] md:h-[600px] pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse 200% 50% at 50% 100%, rgba(45, 98, 255, 0.5) 0%, rgba(45, 98, 255, 0.3) 20%, rgba(45, 98, 255, 0.1) 40%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-40 dark:opacity-25"
          style={{
            background: 'radial-gradient(ellipse 250% 60% at 50% 100%, rgba(45, 98, 255, 0.6) 0%, rgba(45, 98, 255, 0.2) 25%, rgba(45, 98, 255, 0.05) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Additional side gradients for better coverage */}
        <div 
          className="absolute inset-0 opacity-25 dark:opacity-15"
          style={{
            background: 'radial-gradient(ellipse 150% 40% at 20% 100%, rgba(45, 98, 255, 0.3) 0%, rgba(45, 98, 255, 0.1) 30%, transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-25 dark:opacity-15"
          style={{
            background: 'radial-gradient(ellipse 150% 40% at 80% 100%, rgba(45, 98, 255, 0.3) 0%, rgba(45, 98, 255, 0.1) 30%, transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-2 sm:mb-0">
            <Image
              src="/icons/collablink-full-logo.svg"
              alt="CollabLink"
              width={300}
              height={64}
              className="w-[200px] h-auto sm:w-[250px] md:w-[300px]"
              priority
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl border">
          <h1 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Sign in to your CollabLink</h1>
          
          <div className="mb-5 sm:mb-6 text-center text-xs sm:text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{' '}
            </span>
            <Link
              href="/auth/sign-up"
              className="hover:underline font-medium"
              style={{ color: '#2D62FF' }}
            >
              Sign up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
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
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full mt-1 sm:mt-0" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative mt-5 sm:mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 sm:mt-5 md:mt-6"
            onClick={() => {
              window.location.href = '/api/auth/google'
            }}
          >
            <Image
              src="/icons/Google_Symbol_0.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Sign in with Google
          </Button>

          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm">
            <span className="text-muted-foreground">
              Forgot your password?{' '}
            </span>
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              Reset password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

