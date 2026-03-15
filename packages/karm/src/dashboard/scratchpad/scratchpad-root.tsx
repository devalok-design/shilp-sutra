'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { ScratchpadProvider } from './scratchpad-context'
import type { ScratchpadProviderProps } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'>,
    Omit<ScratchpadProviderProps, 'children'> {}

// ============================================================
// Component
// ============================================================

const ScratchpadRoot = React.forwardRef<HTMLDivElement, ScratchpadRootProps>(
  function ScratchpadRoot(
    {
      items,
      maxItems,
      onToggle,
      onAdd,
      onDelete,
      onEdit,
      onReorder,
      onPromote,
      defaultShowCompleted,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <ScratchpadProvider
        items={items}
        maxItems={maxItems}
        onToggle={onToggle}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        onReorder={onReorder}
        onPromote={onPromote}
        defaultShowCompleted={defaultShowCompleted}
      >
        <div ref={ref} className={cn('flex flex-col', className)} {...props}>
          {children}
        </div>
      </ScratchpadProvider>
    )
  },
)

ScratchpadRoot.displayName = 'ScratchpadRoot'

export { ScratchpadRoot }
