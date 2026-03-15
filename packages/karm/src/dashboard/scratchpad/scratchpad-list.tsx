'use client'

import * as React from 'react'
import { useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { cn } from '@/ui/lib/utils'
import { useScratchpad } from './scratchpad-context'
import { ScratchpadItem } from './scratchpad-item'
import type { DragEndEvent } from '@dnd-kit/core'

// ============================================================
// Types
// ============================================================

export interface ScratchpadListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Compact layout passed to each item */
  compact?: boolean
}

// ============================================================
// Component
// ============================================================

const ScratchpadList = React.forwardRef<HTMLDivElement, ScratchpadListProps>(
  function ScratchpadList({ compact = false, className, ...props }, ref) {
    const { visibleItems, items, canReorder, onReorder } = useScratchpad()

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor),
    )

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id || !onReorder) return

        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          onReorder(arrayMove(items, oldIndex, newIndex))
        }
      },
      [items, onReorder],
    )

    const itemIds = visibleItems.map((i) => i.id)

    // When sortable, dnd-kit adds role="button" to items which conflicts
    // with role="list" expecting role="listitem" children
    const listContent = (
      <div
        ref={ref}
        className={cn('flex flex-col gap-ds-02b', className)}
        {...(!canReorder ? { role: 'list' } : undefined)}
        {...props}
      >
        <AnimatePresence initial={false}>
          {visibleItems.map((item) => (
            <ScratchpadItem
              key={item.id}
              item={item}
              compact={compact}
              sortable={canReorder}
              {...(!canReorder ? { role: 'listitem' } : undefined)}
            />
          ))}
        </AnimatePresence>
      </div>
    )

    if (canReorder) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {listContent}
          </SortableContext>
        </DndContext>
      )
    }

    return listContent
  },
)

ScratchpadList.displayName = 'ScratchpadList'

export { ScratchpadList }
