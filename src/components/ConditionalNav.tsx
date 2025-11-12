'use client'

import { usePathname } from 'next/navigation'
import DashboardNav from './DashboardNav'

interface ConditionalNavProps {
  user?: {
    email: string
    displayName?: string | null
    avatarUrl?: string | null
  }
  pendingCollabCount?: number
  totalCollabCount?: number
  newestPendingTimestamp?: string | null
}

export default function ConditionalNav(props: ConditionalNavProps) {
  const pathname = usePathname()
  const isSettingsPage = pathname === '/dashboard/settings'
  
  if (isSettingsPage) {
    return null
  }
  
  return <DashboardNav {...props} />
}

