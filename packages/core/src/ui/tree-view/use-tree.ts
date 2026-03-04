import { useState, useCallback } from 'react'

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  disabled?: boolean
}

interface UseTreeOptions {
  defaultExpanded?: string[]
  defaultSelected?: string[]
  multiSelect?: boolean
  onSelect?: (selectedIds: string[]) => void
  onExpand?: (expandedIds: string[]) => void
}

export function useTree(options: UseTreeOptions = {}) {
  const { defaultExpanded, defaultSelected, multiSelect, onSelect, onExpand } = options

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(defaultExpanded ?? []),
  )
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected ?? []),
  )

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        onExpand?.(Array.from(next))
        return next
      })
    },
    [onExpand],
  )

  const select = useCallback(
    (id: string, event?: React.MouseEvent) => {
      setSelected((prev) => {
        let next: Set<string>
        if (multiSelect && event?.ctrlKey) {
          next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
        } else {
          next = new Set([id])
        }
        onSelect?.(Array.from(next))
        return next
      })
    },
    [multiSelect, onSelect],
  )

  return {
    expanded,
    selected,
    toggle,
    select,
    isExpanded: (id: string) => expanded.has(id),
    isSelected: (id: string) => selected.has(id),
    expandAll: (ids: string[]) => setExpanded(new Set(ids)),
    collapseAll: () => setExpanded(new Set()),
  }
}
