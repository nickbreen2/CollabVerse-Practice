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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <DashboardNav user={userData} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

