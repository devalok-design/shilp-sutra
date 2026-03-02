import * as React from 'react'

import { cn } from '../lib/utils'
import { useTree, type TreeNode } from './use-tree'
import { TreeItem } from './tree-item'

// ─── Context ────────────────────────────────────────────────────────
interface TreeContextValue {
  tree: ReturnType<typeof useTree>
  checkboxes: boolean
}

const TreeContext = React.createContext<TreeContextValue | null>(null)

export function useTreeContext() {
  const ctx = React.useContext(TreeContext)
  if (!ctx) {
    throw new Error('TreeItem must be used within a <TreeView>')
  }
  return ctx
}

// ─── Props ──────────────────────────────────────────────────────────
export interface TreeViewProps {
  /** Data-driven mode: pass items array */
  items?: TreeNode[]
  /** Initially expanded node IDs */
  defaultExpanded?: string[]
  /** Initially selected node IDs */
  defaultSelected?: string[]
  /** Enable multi-select */
  multiSelect?: boolean
  /** Show checkboxes before each item */
  checkboxes?: boolean
  /** Called when selection changes */
  onSelect?: (ids: string[]) => void
  /** Called when expansion changes */
  onExpand?: (ids: string[]) => void
  className?: string
  /** Declarative mode: render TreeItem children directly */
  children?: React.ReactNode
}

// ─── Render nodes recursively (data-driven mode) ───────────────────
function renderNodes(nodes: TreeNode[], depth: number = 0): React.ReactNode {
  return nodes.map((node) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={node.label}
      icon={node.icon}
      disabled={node.disabled}
      depth={depth}
    >
      {node.children && node.children.length > 0
        ? renderNodes(node.children, depth + 1)
        : undefined}
    </TreeItem>
  ))
}

// ─── Helper: collect all visible item IDs ───────────────────────────
function getVisibleItemElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-tree-item]'),
  ).filter((el) => {
    // Items inside collapsed groups should not be focusable
    let parent = el.parentElement
    while (parent && parent !== container) {
      if (parent.getAttribute('role') === 'group') {
        const grid = parent.parentElement
        if (grid && grid.classList.contains('grid-rows-[0fr]')) {
          return false
        }
      }
      parent = parent.parentElement
    }
    return true
  })
}

// ─── Component ──────────────────────────────────────────────────────
const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      items,
      defaultExpanded,
      defaultSelected,
      multiSelect = false,
      checkboxes = false,
      onSelect,
      onExpand,
      className,
      children,
    },
    ref,
  ) => {
    const tree = useTree({
      defaultExpanded,
      defaultSelected,
      multiSelect,
      onSelect,
      onExpand,
    })

    const innerRef = React.useRef<HTMLUListElement>(null)
    const containerRef = (ref as React.RefObject<HTMLUListElement>) ?? innerRef

    const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
      const container = containerRef.current
      if (!container) return

      const visibleItems = getVisibleItemElements(container)
      const currentIndex = visibleItems.findIndex(
        (el) => el === document.activeElement,
      )

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const next = visibleItems[currentIndex + 1]
          next?.focus()
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prev = visibleItems[currentIndex - 1]
          prev?.focus()
          break
        }
        case 'ArrowRight': {
          // Handled in TreeItem for expand; if already expanded, move to first child
          const current = visibleItems[currentIndex]
          if (current) {
            const itemId = current.getAttribute('data-tree-item')
            if (itemId && tree.isExpanded(itemId)) {
              e.preventDefault()
              const nextItem = visibleItems[currentIndex + 1]
              nextItem?.focus()
            }
          }
          break
        }
        case 'ArrowLeft': {
          // Handled in TreeItem for collapse; if already collapsed or leaf, move to parent
          const current = visibleItems[currentIndex]
          if (current) {
            const itemId = current.getAttribute('data-tree-item')
            const treeItem = current.closest('[role="treeitem"]')
            const parentGroup = treeItem?.parentElement?.closest(
              '[role="treeitem"]',
            )
            if (itemId && !tree.isExpanded(itemId) && parentGroup) {
              e.preventDefault()
              const parentRow = parentGroup.querySelector<HTMLElement>(
                '[data-tree-item]',
              )
              parentRow?.focus()
            }
          }
          break
        }
        case 'Home': {
          e.preventDefault()
          visibleItems[0]?.focus()
          break
        }
        case 'End': {
          e.preventDefault()
          visibleItems[visibleItems.length - 1]?.focus()
          break
        }
      }
    }

    const ctxValue = React.useMemo<TreeContextValue>(
      () => ({ tree, checkboxes }),
      [tree, checkboxes],
    )

    const content = items ? renderNodes(items) : children

    return (
      <TreeContext.Provider value={ctxValue}>
        <ul
          ref={containerRef}
          role="tree"
          aria-multiselectable={multiSelect || undefined}
          onKeyDown={handleKeyDown}
          className={cn('m-0 list-none p-0', className)}
        >
          {content}
        </ul>
      </TreeContext.Provider>
    )
  },
)
TreeView.displayName = 'TreeView'

export { TreeView }
