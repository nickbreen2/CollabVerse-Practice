'use client'

import { useState } from 'react'
import { ExternalLink, GripVertical, Pencil } from 'lucide-react'
import { CustomLink } from '@/types'
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

interface DraggableCustomLinksListProps {
  links: CustomLink[]
  onEdit: (link: CustomLink) => void
  onReorder: (newLinks: CustomLink[]) => void
}

interface SortableLinkItemProps {
  link: CustomLink
  onEdit: (link: CustomLink) => void
}

function SortableLinkItem({ link, onEdit }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
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

      {/* Link Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {link.title}
        </p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate"
        >
          <span className="truncate">{formatUrl(link.url)}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(link)}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        aria-label="Edit link"
      >
        <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )
}

function DragOverlayItem({ link }: { link: CustomLink | null }) {
  if (!link) return null

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '') + urlObj.pathname.slice(0, 20) + 
             (urlObj.pathname.length > 20 ? '...' : '')
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-2xl opacity-90 min-w-[300px]">
      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {link.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {formatUrl(link.url)}
        </p>
      </div>
    </div>
  )
}

export default function DraggableCustomLinksList({
  links,
  onEdit,
  onReorder,
}: DraggableCustomLinksListProps) {
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
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

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
        items={items.map((link) => link.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((link) => (
            <SortableLinkItem key={link.id} link={link} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <DragOverlayItem link={items.find((l) => l.id === activeId) || null} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

