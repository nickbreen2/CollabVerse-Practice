'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, SendHorizontal, BarChart3 } from 'lucide-react'
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

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md',
        'border-t border-gray-200/50 dark:border-gray-800/50'
      )}
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'transition-colors duration-200',
                isActive
                  ? 'text-[#1F2124] dark:text-white'
                  : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

