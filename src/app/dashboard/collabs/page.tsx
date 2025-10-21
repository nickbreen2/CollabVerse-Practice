'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Users, Mail, CheckCircle, Clock } from 'lucide-react'
import { CollabRequest } from '@/types'

interface CollabStats {
  pending: number
  accepted: number
  total: number
}

export default function CollabsPage() {
  const [handle, setHandle] = useState<string | null>(null)
  const [requests, setRequests] = useState<CollabRequest[]>([])
  const [stats, setStats] = useState<CollabStats>({ pending: 0, accepted: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
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
        setRequests(collabsData.requests)
        setStats(collabsData.stats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* FIXED HEADER */}
      <DashboardHeader
        title="Collabs"
        subtitle="Manage your collaboration opportunities"
        handle={handle}
      />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Accepted
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.accepted}</div>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
          </div>

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
              <h3 className="text-lg font-semibold px-2">Collaboration Requests</h3>
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-950 rounded-xl border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{request.senderName}</h4>
                      {request.brandName && (
                        <p className="text-sm text-muted-foreground">{request.brandName}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : request.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {request.status}
                    </span>
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

                    {request.links && request.links.length > 0 && (
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

                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Received {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
