import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/auth/sign-in')
  }

  // Fetch user data with store info
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      store: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  const userData = user
    ? {
        email: user.email,
        displayName: user.store?.displayName,
        avatarUrl: user.store?.avatarUrl,
      }
    : { email: session.email }

  // Fetch pending collab requests count and newest timestamp
  let pendingCount = 0
  let totalCollabCount = 0
  let newestPendingTimestamp: string | null = null
  if (user?.store?.id) {
    const pendingRequests = await prisma.collabRequest.findMany({
      where: {
        creatorId: user.store.id,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
      select: {
        createdAt: true,
      },
    })
    
    pendingCount = await prisma.collabRequest.count({
      where: {
        creatorId: user.store.id,
        status: 'PENDING',
      },
    })
    
    totalCollabCount = await prisma.collabRequest.count({
      where: {
        creatorId: user.store.id,
      },
    })
    
    if (pendingRequests.length > 0) {
      newestPendingTimestamp = pendingRequests[0].createdAt.toISOString()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <DashboardNav 
        user={userData} 
        pendingCollabCount={pendingCount}
        totalCollabCount={totalCollabCount}
        newestPendingTimestamp={newestPendingTimestamp}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

