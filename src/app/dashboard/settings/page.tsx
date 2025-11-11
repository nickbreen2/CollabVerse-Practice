import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsShell from '@/components/settings/SettingsShell'

export default async function SettingsPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/auth/sign-in')
  }

  // Fetch user data with store info
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      birthDate: true,
      accountStatus: true,
      scheduledDeletionAt: true,
      store: {
        select: {
          handle: true,
          displayName: true,
          location: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  return <SettingsShell user={user} />
}

