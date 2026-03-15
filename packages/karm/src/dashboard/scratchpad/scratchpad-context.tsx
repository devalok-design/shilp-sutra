'use client'

import * as React from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

// ============================================================
// Types
// ============================================================

export interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}

export interface ScratchpadContextValue {
  items: ScratchpadItem[]
  visibleItems: ScratchpadItem[]
  maxItems: number
  showCompleted: boolean
  setShowCompleted: (show: boolean) => void
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  canAdd: boolean
  canDelete: boolean
  canEdit: boolean
  canReorder: boolean
  canPromote: boolean
}

export interface ScratchpadProviderProps {
  children: React.ReactNode
  items: ScratchpadItem[]
  maxItems?: number
  onToggle: (id: string, done: boolean) => void
  onAdd?: (text: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, text: string) => void
  onReorder?: (items: ScratchpadItem[]) => void
  onPromote?: (id: string) => void
  defaultShowCompleted?: boolean
}

// ============================================================
// Context
// ============================================================

const ScratchpadContext = createContext<ScratchpadContextValue | null>(null)

export function useScratchpad(): ScratchpadContextValue {
  const ctx = useContext(ScratchpadContext)
  if (!ctx) {
    throw new Error('useScratchpad must be used within a ScratchpadProvider')
  }
  return ctx
}

// ============================================================
// Provider
// ============================================================

function ScratchpadProvider({
  children,
  items,
  maxItems = 20,
  onToggle,
  onAdd,
  onDelete,
  onEdit,
  onReorder,
  onPromote,
  defaultShowCompleted = true,
}: ScratchpadProviderProps) {
  const [showCompleted, setShowCompleted] = useState(defaultShowCompleted)

  const visibleItems = useMemo(
    () => (showCompleted ? items : items.filter((item) => !item.done)),
    [items, showCompleted],
  )

  const value = useMemo<ScratchpadContextValue>(
    () => ({
      items,
      visibleItems,
      maxItems,
      showCompleted,
      setShowCompleted,
      onToggle,
      onAdd,
      onDelete,
      onEdit,
      onReorder,
      onPromote,
      canAdd: !!onAdd,
      canDelete: !!onDelete,
      canEdit: !!onEdit,
      canReorder: !!onReorder,
      canPromote: !!onPromote,
    }),
    [items, visibleItems, maxItems, showCompleted, onToggle, onAdd, onDelete, onEdit, onReorder, onPromote],
  )

  return <ScratchpadContext.Provider value={value}>{children}</ScratchpadContext.Provider>
}

ScratchpadProvider.displayName = 'ScratchpadProvider'

export { ScratchpadProvider }
