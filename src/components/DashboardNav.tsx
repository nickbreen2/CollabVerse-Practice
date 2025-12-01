'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Store, SendHorizontal, BarChart3, LogOut, MessageSquareText, Bug, Lightbulb, ChevronDown, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'My Store',
    href: '/dashboard/my-store',
    icon: Store,
  },
  {
    label: 'Collabs',
    href: '/dashboard/collabs',
    icon: SendHorizontal,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

interface DashboardNavProps {
  user?: {
    email: string
    displayName?: string | null
    avatarUrl?: string | null
  }
  pendingCollabCount?: number
  totalCollabCount?: number
  newestPendingTimestamp?: string | null
}

export default function DashboardNav({ user, pendingCollabCount = 0, totalCollabCount = 0, newestPendingTimestamp }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      })
      router.push('/auth/sign-in')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out',
      })
    }
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const avatarFallback = displayName.substring(0, 2).toUpperCase()

  // Navigation content component to avoid duplication
  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Main
        </h2>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-[#EAECF2] text-[#1F2124] dark:bg-[#EAECF2] dark:text-[#1F2124]'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('h-5 w-5', isActive && 'text-[#1F2124] dark:text-[#1F2124]')} />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* SUPPORT Section */}
      <div className="px-4 py-4 space-y-1 flex-shrink-0">
        <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Support
        </h2>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
          onClick={() => {}}
        >
          <MessageSquareText className="h-5 w-5" />
          Contact
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
          onClick={() => {}}
        >
          <Bug className="h-5 w-5" />
          Report a Bug
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
          onClick={() => {}}
        >
          <Lightbulb className="h-5 w-5" />
          Request a Feature
        </Button>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full focus:outline-none">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Avatar className="h-9 w-9">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="cursor-pointer bg-[#FFF1F1] text-[#FA0606] hover:bg-[#FFE5E5] focus:bg-[#FFE5E5] focus:text-[#FA0606]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-col h-screen sticky top-0">
        <div className="p-6 flex-shrink-0">
          <Image 
            src="/icons/final-collablink-logo.svg" 
            alt="CollabLink" 
            width={200} 
            height={60}
            className="w-auto h-12"
          />
        </div>

        <NavContent />
      </aside>
    </>
  )
}

