'use client'

import { useState } from 'react'
import { Trash2, ExternalLink, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPlatformById } from '@/lib/platformCategories'
import { getPlatformIcon } from '@/components/icons/PlatformIcons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SocialLink {
  network: string
  url: string
}

interface DraggableAddedLinksListProps {
  links: SocialLink[]
  onDelete: (network: string) => void
  onReorder: (newLinks: SocialLink[]) => void
  theme?: 'LIGHT' | 'DARK'
}

interface SortableLinkItemProps {
  link: SocialLink
  onDelete: (network: string) => void
  theme?: 'LIGHT' | 'DARK'
}

function SortableLinkItem({ link, onDelete, theme }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.network })

  const platform = getPlatformById(link.network)
  const Icon = platform ? getPlatformIcon(platform.icon, theme) : null

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '') + urlObj.pathname.slice(0, 20) + 
             (urlObj.pathname.length > 20 ? '...' : '')
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 
        hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 
        bg-white dark:bg-gray-950
        ${isDragging ? 'shadow-2xl z-50' : ''}
      `}
    >
      {/* 6-Dot Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -ml-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Platform Icon */}
      {Icon && (
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-8 h-8 object-contain" />
        </div>
      )}

      {/* Link Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium capitalize">
          {platform?.name || link.network}
        </p>
        <a
          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate"
        >
          <span className="truncate">{formatUrl(link.url)}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(link.network)}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
        <span className="sr-only">Delete {link.network} link</span>
      </Button>
    </div>
  )
}

function DragOverlayItem({ link, theme }: { link: SocialLink | null, theme?: 'LIGHT' | 'DARK' }) {
  if (!link) return null

  const platform = getPlatformById(link.network)
  const Icon = platform ? getPlatformIcon(platform.icon, theme) : null

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.replace('www.', '') + urlObj.pathname.slice(0, 20) + 
             (urlObj.pathname.length > 20 ? '...' : '')
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-2xl opacity-90 min-w-[300px]">
      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
      {Icon && (
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-8 h-8 object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium capitalize">
          {platform?.name || link.network}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {formatUrl(link.url)}
        </p>
      </div>
    </div>
  )
}

export default function DraggableAddedLinksList({
  links,
  onDelete,
  onReorder,
  theme,
}: DraggableAddedLinksListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState(links)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.network === active.id)
        const newIndex = items.findIndex((item) => item.network === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onReorder(items)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setItems(links)
    setActiveId(null)
  }

  // Update items when links prop changes
  if (links !== items && !activeId) {
    setItems(links)
  }

  if (links.length === 0) {
    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((link) => link.network)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((link) => (
            <SortableLinkItem key={link.network} link={link} onDelete={onDelete} theme={theme} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <DragOverlayItem link={items.find((l) => l.network === activeId) || null} theme={theme} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

