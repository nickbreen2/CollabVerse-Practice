'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { User, MousePointerClick, Globe, TrendingUp, Users, Clock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Interactive line chart component with tooltips
function ActivityChart({ data }: { data: { time: string; value: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const width = 100
  const height = 60
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (d.value / maxValue) * height
    return { x, y, ...d }
  })

  const pathData = `M 0,${height} L ${points.map(p => `${p.x},${p.y}`).join(' ')} L ${width},${height} Z`
  const lineData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * width
    const index = Math.round((x / width) * (data.length - 1))
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1))
    
    setHoveredIndex(clampedIndex)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-48" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-crosshair"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={pathData}
          fill="url(#areaGradient)"
        />
        
        {/* Line */}
        <path
          d={lineData}
          fill="none"
          stroke="rgb(139, 92, 246)"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Data points - removed to eliminate dots on hover */}
        
        {/* Hover indicator line */}
        {hoveredIndex !== null && (
          <line
            x1={points[hoveredIndex].x}
            y1="0"
            x2={points[hoveredIndex].x}
            y2={height}
            stroke="rgb(139, 92, 246)"
            strokeWidth="0.3"
            strokeDasharray="1,1"
            opacity="0.5"
          />
        )}
      </svg>
      
      
      {/* Time labels */}
      <div className="absolute bottom-0 left-0 right-0 pb-1 pointer-events-none">
        {/* Mobile: Show 3 labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1 sm:hidden">
          {data.filter((_, i) => i % Math.floor(data.length / 3) === 0).map((d, i) => (
            <span key={i} className="truncate">{d.time}</span>
          ))}
        </div>
        {/* Desktop: Show 6 labels */}
        <div className="hidden sm:flex justify-between text-xs text-muted-foreground px-2">
          {data.filter((_, i) => i % Math.floor(data.length / 6) === 0).map((d, i) => (
            <span key={i}>{d.time}</span>
          ))}
        </div>
      </div>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
            top: '-12px',
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-md px-3 py-2 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-gray-300 mb-0.5 whitespace-nowrap">{data[hoveredIndex].time}</div>
            <div className="text-sm font-bold text-white whitespace-nowrap">
              {data[hoveredIndex].value} {data[hoveredIndex].value === 1 ? 'visit' : 'visits'}
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2">
            <div className="w-2 h-2 bg-gray-800 dark:bg-gray-900 rotate-45 border-r border-b border-gray-700/50" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [handle, setHandle] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  // Generate sample data for the chart (30-minute intervals)
  const generateChartData = () => {
    const now = new Date()
    const data = []
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000)
      const hours = time.getHours()
      const minutes = time.getMinutes()
      const timeStr = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
      
      // Generate some realistic activity pattern
      let value = 0
      if (i <= 5) {
        value = Math.floor(Math.random() * 8)
      } else {
        value = Math.floor(Math.random() * 2)
      }
      
      data.push({ time: timeStr, value })
    }
    return data
  }

  const [chartData, setChartData] = useState(generateChartData())

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch('/api/store')
        if (response.ok) {
          const data = await response.json()
          setHandle(data.handle)
        }
      } catch (error) {
        console.error('Failed to fetch store:', error)
      }
    }
    fetchStore()
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setChartData(generateChartData())
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const metrics = [
    {
      label: 'Profile Views',
      value: '38',
      change: '+100.0%',
      changeType: 'positive' as const,
      icon: User,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Link Clicks',
      value: '0',
      change: '0.0%',
      changeType: 'neutral' as const,
      icon: MousePointerClick,
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      label: 'Total Interactions',
      value: '38',
      change: '+100.0%',
      changeType: 'positive' as const,
      icon: Globe,
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Engagement Rate',
      value: '0.0%',
      change: '0.0%',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* FIXED HEADER */}
      <DashboardHeader
        title="Analytics"
        subtitle="Track performance and engagement"
        handle={handle}
      />

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={`gap-2 ${
                  isLive 
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-950/50' 
                    : ''
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                Live
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            {/* Date Range Selector */}
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Oct 10 - 17, 2025
            </Button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-950 rounded-xl border p-6 space-y-4"
                >
                  {/* Header with icon */}
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-4xl font-bold">{metric.value}</div>

                  {/* Change badge */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        metric.changeType === 'positive'
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {metric.changeType === 'positive' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3l7 7-1.41 1.41L11 6.83V17H9V6.83L4.41 11.41 3 10l7-7z" />
                        </svg>
                      )}
                      {metric.change}
                    </div>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Real-Time Activity Section */}
          <div className="bg-white dark:bg-gray-950 rounded-xl border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Real-Time Activity</h2>
                <p className="text-sm text-muted-foreground">Last 30 minutes</p>
              </div>
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-950/30">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Live
                  </span>
                </div>
              )}
            </div>

            {/* Real-time stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Total Visits</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">10</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3l7 7-1.41 1.41L11 6.83V17H9V6.83L4.41 11.41 3 10l7-7z" />
                    </svg>
                    0 / min
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MousePointerClick className="h-4 w-4 text-pink-500" />
                  <span>Total Clicks</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3l7 7-1.41 1.41L11 6.83V17H9V6.83L4.41 11.41 3 10l7-7z" />
                    </svg>
                    0 / min
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  <span>Total Activity</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">10</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3l7 7-1.41 1.41L11 6.83V17H9V6.83L4.41 11.41 3 10l7-7z" />
                    </svg>
                    0 / min
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="pt-4">
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-muted-foreground">Profile Visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-pink-500" />
                  <span className="text-muted-foreground">Link Clicks</span>
                </div>
              </div>
              
              <ActivityChart data={chartData} />
            </div>

            {/* Loading indicator */}
            {isLive && (
              <div className="flex justify-center py-2">
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Period Comparison Section */}
          <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Period Comparison</h2>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Compare performance across different time periods</p>
              <p className="text-sm mt-2">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
