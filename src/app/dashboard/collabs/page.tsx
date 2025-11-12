'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Users, Mail, Pin, Trash2, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CollabRequest } from '@/types'
import BrandAvatar from '@/components/BrandAvatar'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffMs / 604800000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
  
  // For older dates, show the actual date
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export default function CollabsPage() {
  const [handle, setHandle] = useState<string | null>(null)
  const [requests, setRequests] = useState<CollabRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOption, setFilterOption] = useState('recent')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    // Mark collabs as seen when the page is visited
    localStorage.setItem('collabs_last_seen', new Date().toISOString())
  }, [])

  const fetchData = async () => {
    try {
      const [storeRes, collabsRes] = await Promise.all([
        fetch('/api/store'),
        fetch('/api/collabs'),
      ])

      if (storeRes.ok) {
        const storeData = await storeRes.json()
        setHandle(storeData.handle)
      }

      if (collabsRes.ok) {
        const collabsData = await collabsRes.json()
        console.log('📥 Received collab data:', collabsData)
        console.log('🔗 Requests with links:', collabsData.requests.map((r: CollabRequest) => ({
          id: r.id,
          senderName: r.senderName,
          links: r.links,
          hasLinks: !!r.links,
          linksLength: Array.isArray(r.links) ? r.links.length : 0
        })))
        setRequests(collabsData.requests)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (requestId: string) => {
    setRequestToDelete(requestId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return

    try {
      const response = await fetch(`/api/collabs/${requestToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete request')
      }

      toast({
        title: 'Request deleted',
        description: 'The collaboration request has been removed.',
      })

      setDeleteDialogOpen(false)
      setRequestToDelete(null)

      // Refresh the list
      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete the request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleTogglePin = async (requestId: string, currentPinned: boolean) => {
    try {
      const response = await fetch(`/api/collabs/${requestId}`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle pin')
      }

      // Refresh the list
      fetchData()
    } catch (error) {
      console.error('Toggle pin error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update pin status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Filter and sort requests based on search query and filter option
  const filteredRequests = requests
    .filter((request) => {
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const brandName = request.brandName?.toLowerCase() || ''
        const senderName = request.senderName?.toLowerCase() || ''
        if (!brandName.includes(query) && !senderName.includes(query)) {
          return false
        }
      }

      // Apply filter option
      if (filterOption === 'pinned') {
        return (request as any).pinned === true
      }

      return true
    })
    .sort((a, b) => {
      // Always prioritize pinned items first, regardless of filter option
      const pinnedA = (a as any).pinned ? 1 : 0
      const pinnedB = (b as any).pinned ? 1 : 0
      if (pinnedA !== pinnedB) {
        return pinnedB - pinnedA // Pinned items come first
      }

      // Apply secondary sorting based on filter option
      if (filterOption === 'amount') {
        const budgetA = a.budget || 0
        const budgetB = b.budget || 0
        return budgetB - budgetA // Sort descending (highest first)
      } else if (filterOption === 'recent') {
        // Sort by createdAt descending (most recent first)
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      } else if (filterOption === 'pinned') {
        // Already sorted by pinned status above, now sort by date
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      }
      return 0
    })

  return (
    <div className="flex h-full flex-col">
      {/* FIXED HEADER */}
      <DashboardHeader
        title="Collabs"
        subtitle="Manage your collaboration opportunities"
        handle={handle}
        badge={
          !loading && requests.length > 0 ? (
            <span className="px-2.5 py-0.5 text-sm font-medium bg-primary/10 text-primary rounded-full">
              {filteredRequests.length}
            </span>
          ) : null
        }
      />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-8 space-y-6">
          {/* Requests List */}
          {loading ? (
            <div className="bg-white dark:bg-gray-950 rounded-xl border p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white dark:bg-gray-950 rounded-xl border p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">No Collaboration Requests Yet</h2>
                <p className="text-muted-foreground">
                  When brands reach out to collaborate with you, their requests will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="search brand"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 font-normal" style={{ color: '#64738b' }}>
                        {filterOption === 'recent' && 'Recent'}
                        {filterOption === 'pinned' && 'Pinned'}
                        {filterOption === 'amount' && 'Sort by Amount'}
                        <ChevronDown className="h-4 w-4" style={{ color: '#64738b' }} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={filterOption}
                        onValueChange={setFilterOption}
                      >
                        <DropdownMenuRadioItem value="recent">
                          Recent
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="pinned">
                          Pinned
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="amount">
                          Sort by Amount
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {filteredRequests.map((request) => {
                const isPinned = (request as any).pinned || false
                return (
                  <div
                    key={request.id}
                    className={`rounded-xl border p-6 hover:shadow-md transition-shadow ${
                      isPinned 
                        ? 'bg-[#F9FAFF] dark:bg-[#F9FAFF]/10 border-[#C1C5FF]' 
                        : 'bg-white dark:bg-gray-950'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <BrandAvatar
                        brandName={request.brandName}
                        senderName={request.senderName}
                        email={request.senderEmail}
                        emailDomain={request.emailDomain}
                        size={48}
                      />
                      <div className="flex-1 flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">{request.senderName}</h4>
                          {request.brandName && (
                            <p className="text-sm text-muted-foreground">{request.brandName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {getTimeAgo(request.createdAt)}
                          </span>
                          <button
                            onClick={() => handleTogglePin(request.id, isPinned)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            aria-label={isPinned ? 'Unpin request' : 'Pin request'}
                          >
                            <Pin 
                              className={`h-5 w-5 transition-colors ${
                                isPinned ? '' : 'text-muted-foreground'
                              }`}
                              style={isPinned ? { fill: '#535EFF', color: '#535EFF' } : undefined}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(request.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            aria-label="Delete request"
                          >
                            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${request.senderEmail}`}
                        className="text-primary hover:underline"
                      >
                        {request.senderEmail}
                      </a>
                    </div>

                    {request.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">${request.budget.toString()}</span>
                      </div>
                    )}

                    {request.description && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {Array.isArray(request.links) && request.links.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Additional Links:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {request.links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                            >
                              Link {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${request.senderEmail}`, '_blank')}
                        className="h-8 gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Open Email
                      </Button>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collaboration Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collaboration request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setRequestToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
