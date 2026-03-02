import { IconChevronRight } from '@tabler/icons-react'
import * as React from 'react'

import { cn } from '../lib/utils'
import { Checkbox } from '../checkbox'
import { useTreeContext } from './tree-view'

export interface TreeItemProps {
  /** Unique identifier for this tree item */
  itemId: string
  /** Primary label content */
  label: React.ReactNode
  /** Optional icon rendered before the label */
  icon?: React.ReactNode
  /** Secondary label rendered after the primary label */
  secondaryLabel?: React.ReactNode
  /** Action buttons rendered at the end of the row */
  actions?: React.ReactNode
  /** Whether this item is disabled */
  disabled?: boolean
  /** Nested tree items */
  children?: React.ReactNode
  /** Depth level (used internally) */
  depth?: number
}

const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  (
    {
      itemId,
      label,
      icon,
      secondaryLabel,
      actions,
      disabled = false,
      children,
      depth = 0,
    },
    ref,
  ) => {
    const ctx = useTreeContext()
    const hasChildren = React.Children.count(children) > 0
    const isExpanded = ctx.tree.isExpanded(itemId)
    const isSelected = ctx.tree.isSelected(itemId)

    const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      ctx.tree.select(itemId, e)
    }

    const handleChevronClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (disabled) return
      ctx.tree.toggle(itemId)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        ctx.tree.select(itemId)
      }
      if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
        e.preventDefault()
        e.stopPropagation()
        ctx.tree.toggle(itemId)
      }
      if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
        e.preventDefault()
        e.stopPropagation()
        ctx.tree.toggle(itemId)
      }
    }

    // Compute indeterminate state for checkbox mode
    const checkboxState = React.useMemo(() => {
      if (!ctx.checkboxes || !hasChildren) {
        return { checked: isSelected, indeterminate: false }
      }
      // Collect all descendant IDs
      const descendants: string[] = []
      const collectIds = (nodes: React.ReactNode) => {
        React.Children.forEach(nodes, (child) => {
          if (React.isValidElement<TreeItemProps>(child) && child.props.itemId) {
            descendants.push(child.props.itemId)
            if (child.props.children) {
              collectIds(child.props.children)
            }
          }
        })
      }
      collectIds(children)
      const selectedCount = descendants.filter((id) =>
        ctx.tree.isSelected(id),
      ).length
      if (selectedCount === 0 && !isSelected) {
        return { checked: false, indeterminate: false }
      }
      if (selectedCount === descendants.length) {
        return { checked: true, indeterminate: false }
      }
      return { checked: false, indeterminate: true }
    }, [ctx.checkboxes, hasChildren, children, isSelected, ctx.tree])

    return (
      <li
        ref={ref}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        aria-disabled={disabled || undefined}
        className="list-none"
      >
        {/* Row */}
        <div
          role="presentation"
          data-tree-item={itemId}
          tabIndex={disabled ? -1 : 0}
          onClick={handleRowClick}
          onKeyDown={handleKeyDown}
          style={{ paddingLeft: depth * 20 + 8 }}
          className={cn(
            'flex items-center gap-[var(--spacing-02)] py-[var(--spacing-02)] px-[var(--spacing-02)] rounded-[var(--radius-md)] cursor-pointer transition-colors duration-[var(--duration-fast)]',
            'hover:bg-[var(--color-layer-02)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
            isSelected &&
              'bg-[var(--color-interactive-selected)] text-[var(--color-text-interactive)]',
            disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          )}
        >
          {/* Expand chevron */}
          {hasChildren ? (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={handleChevronClick}
              className="flex shrink-0 items-center justify-center p-0 border-0 bg-transparent cursor-pointer"
            >
              <IconChevronRight
                size={16}
                className={cn(
                  'transition-transform duration-[var(--duration-moderate)]',
                  isExpanded && 'rotate-90',
                )}
              />
            </button>
          ) : (
            <span className="inline-block w-4 shrink-0" aria-hidden="true" />
          )}

          {/* Checkbox (optional) */}
          {ctx.checkboxes && (
            <Checkbox
              checked={checkboxState.checked}
              indeterminate={checkboxState.indeterminate}
              disabled={disabled}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => {
                if (!disabled) ctx.tree.select(itemId)
              }}
              className="shrink-0"
            />
          )}

          {/* Icon */}
          {icon && (
            <span className="flex shrink-0 items-center text-[var(--color-icon-secondary)]">
              {icon}
            </span>
          )}

          {/* Label */}
          <span className="truncate text-ds-sm">{label}</span>

          {/* Secondary label */}
          {secondaryLabel && (
            <span className="ml-auto truncate text-ds-xs text-[var(--color-text-secondary)]">
              {secondaryLabel}
            </span>
          )}

          {/* Actions */}
          {actions && (
            <span
              className="ml-auto flex shrink-0 items-center gap-[var(--spacing-01)]"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              {actions}
            </span>
          )}
        </div>

        {/* Children (collapsible) */}
        {hasChildren && (
          <div
            role="group"
            className={cn(
              'grid transition-[grid-template-rows] duration-[var(--duration-moderate)] ease-[var(--easing-standard)]',
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <ul role="group" className="overflow-hidden m-0 p-0">
              {React.Children.map(children, (child) => {
                if (React.isValidElement<TreeItemProps>(child)) {
                  return React.cloneElement(child, {
                    depth: depth + 1,
                  })
                }
                return child
              })}
            </ul>
          </div>
        )}
      </li>
    )
  },
)
TreeItem.displayName = 'TreeItem'

export { TreeItem }
