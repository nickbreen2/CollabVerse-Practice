import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import CollabRequestPage from '@/components/store/CollabRequestPage'

interface PageProps {
  params: Promise<{ handle: string }>
}

export default async function CollaborationRequestPage({ params }: PageProps) {
  const { handle } = await params
  
  // Get the store by handle
  const store = await prisma.creatorStore.findUnique({
    where: { handle },
  })

  if (!store) {
    notFound()
  }

  // Check if this is the owner viewing their own store
  const session = await getSession()
  const isSelfView = session.isLoggedIn && session.userId === store.userId

  // Redirect self-view users back to the store page
  // They'll see the modal there if they click the collab button
  if (isSelfView) {
    redirect(`/${handle}`)
  }

  return (
    <CollabRequestPage
      handle={handle}
      creatorId={store.id}
      creatorAvatar={store.avatarUrl || undefined}
      creatorName={store.displayName || undefined}
      theme={store.theme}
    />
  )
}

