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
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(options.defaultExpanded ?? []),
  )
  const [selected, setSelected] = useState<Set<string>>(
    new Set(options.defaultSelected ?? []),
  )

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        options.onExpand?.(Array.from(next))
        return next
      })
    },
    [options.onExpand],
  )

  const select = useCallback(
    (id: string, event?: React.MouseEvent) => {
      setSelected((prev) => {
        let next: Set<string>
        if (options.multiSelect && event?.ctrlKey) {
          next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
        } else {
          next = new Set([id])
        }
        options.onSelect?.(Array.from(next))
        return next
      })
    },
    [options.multiSelect, options.onSelect],
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
