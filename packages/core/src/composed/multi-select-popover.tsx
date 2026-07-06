'use client'

import { IconCheck, IconSearch } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from '../ui/icon'
import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Spinner } from '../ui/spinner'

// ============================================================
// Types
// ============================================================

export interface MultiSelectItem {
  id: string
  label: string
  image?: string
  description?: string
  disabled?: boolean
}

export interface MultiSelectGroup {
  label: string
  items: MultiSelectItem[]
}

export interface MultiSelectPopoverProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  /** Flat list of items (use `groups` for grouped rendering) */
  items?: MultiSelectItem[]
  /** Grouped items with section headers */
  groups?: MultiSelectGroup[]
  /** Currently selected item IDs */
  value: string[]
  /** Called when selection changes */
  onValueChange: (ids: string[]) => void
  /** @default 'Search...' */
  searchPlaceholder?: string
  /** Async search — replaces local filter with server results */
  onSearch?: (query: string) => Promise<MultiSelectItem[]>
  /** Debounce for async search in ms @default 300 */
  searchDebounce?: number
  /** Custom item renderer */
  renderItem?: (item: MultiSelectItem, selected: boolean) => React.ReactNode
  /** Message when no items match filter @default 'No results found' */
  emptyMessage?: string
  /** Maximum number of selections */
  maxSelections?: number
  /** Popover alignment @default 'start' */
  align?: 'start' | 'center' | 'end'
  /** Popover width */
  width?: string | number
  /** Trigger element */
  children: React.ReactNode
}

// ============================================================
// MultiSelectPopover
// ============================================================

const MultiSelectPopover = React.forwardRef<HTMLDivElement, MultiSelectPopoverProps>(
  (
    {
      items,
      groups,
      value,
      onValueChange,
      searchPlaceholder = 'Search...',
      onSearch,
      searchDebounce = 300,
      renderItem,
      emptyMessage = 'No results found',
      maxSelections,
      align = 'start',
      width,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [asyncItems, setAsyncItems] = React.useState<MultiSelectItem[] | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const listRef = React.useRef<HTMLDivElement>(null)

    // Reset search and focus when popover closes
    React.useEffect(() => {
      if (!open) {
        setSearch('')
        setAsyncItems(null)
        setFocusedIndex(-1)
      }
    }, [open])

    // Async search
    React.useEffect(() => {
      if (!onSearch || !open) return
      if (!search.trim()) {
        setAsyncItems(null)
        setLoading(false)
        return
      }
      setLoading(true)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearch(search)
          .then((results) => setAsyncItems(results))
          .catch(() => setAsyncItems([]))
          .finally(() => setLoading(false))
      }, searchDebounce)
      return () => clearTimeout(debounceRef.current)
    }, [search, onSearch, searchDebounce, open])

    // Resolve visible items
    const allItems = React.useMemo(() => {
      if (asyncItems) return asyncItems
      if (groups) return groups.flatMap((g) => g.items)
      return items ?? []
    }, [items, groups, asyncItems])

    const filteredItems = React.useMemo(() => {
      if (onSearch) return allItems // async search handles its own filtering
      const q = search.toLowerCase()
      if (!q) return allItems
      return allItems.filter((item) => item.label.toLowerCase().includes(q))
    }, [allItems, search, onSearch])

    const filteredGroups = React.useMemo(() => {
      if (!groups || onSearch || asyncItems) return null
      const q = search.toLowerCase()
      return groups
        .map((g) => ({
          ...g,
          items: q ? g.items.filter((item) => item.label.toLowerCase().includes(q)) : g.items,
        }))
        .filter((g) => g.items.length > 0)
    }, [groups, search, onSearch, asyncItems])

    function toggle(id: string) {
      const isSelected = value.includes(id)
      if (isSelected) {
        onValueChange(value.filter((v) => v !== id))
      } else {
        if (maxSelections && value.length >= maxSelections) {
          // Replace: drop the first selected item to make room for the new one
          onValueChange([...value.slice(1), id])
        } else {
          onValueChange([...value, id])
        }
      }
    }

    // Reset focused index when search text changes
     
    React.useEffect(() => { setFocusedIndex(-1) }, [search])

    // Scroll focused item into view
    React.useEffect(() => {
      if (focusedIndex < 0) return
      const list = listRef.current
      if (!list) return
      const items = list.querySelectorAll('[data-multiselect-item]')
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }, [focusedIndex])

    function handleSearchKeyDown(e: React.KeyboardEvent) {
      const count = filteredItems.length
      if (count === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev < count - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev <= 0 ? count - 1 : prev - 1))
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault()
        const item = filteredItems[focusedIndex]
        if (item && !item.disabled) toggle(item.id)
      }
    }

    let itemCounter = 0

    function renderItemRow(item: MultiSelectItem) {
      const isSelected = value.includes(item.id)
      const index = itemCounter++
      const isFocused = index === focusedIndex
      return (
        <motion.button
          key={item.id}
          id={`msp-item-${index}`}
          type="button"
          role="option"
          aria-selected={isSelected}
          disabled={item.disabled}
          data-multiselect-item=""
          data-focused={isFocused ? '' : undefined}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springs.snappy, delay: index * 0.02 }}
          onClick={() => toggle(item.id)}
          className={cn(
            'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left transition-colors duration-fast-01 ease-productive-standard',
            'hover:bg-surface-raised-hover',
            'disabled:opacity-action-disabled disabled:cursor-not-allowed',
            isSelected && 'bg-accent-2 text-accent-11',
            isFocused && 'bg-surface-raised-hover',
          )}
        >
          {renderItem ? (
            <span className="flex-1 min-w-0">{renderItem(item, isSelected)}</span>
          ) : (
            <>
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="h-ico-md w-ico-md rounded-pill object-cover shrink-0"
                />
              )}
              <span className="flex-1 min-w-0">
                <span className="block truncate text-ds-md font-body text-surface-fg">{item.label}</span>
                {item.description && (
                  <span className="block truncate text-ds-xs text-surface-fg-subtle">{item.description}</span>
                )}
              </span>
            </>
          )}
          {isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springs.snappy}
              className="inline-flex shrink-0"
            >
              <Icon icon={IconCheck} size="sm" className="text-accent-11" />
            </motion.span>
          )}
        </motion.button>
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          ref={ref}
          {...props}
          className={cn(
            'border-surface-border-strong bg-surface-overlay p-0',
            className,
          )}
          style={{ width: width ?? 240 }}
          align={align}
          sideOffset={4}
        >
          {/* Search */}
          <div className="flex items-center gap-ds-03 border-b border-surface-border-strong px-ds-04 py-ds-03">
            <Icon icon={IconSearch} size="sm" stroke="light" className="shrink-0 text-surface-fg-subtle" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search"
              aria-activedescendant={focusedIndex >= 0 ? `msp-item-${focusedIndex}` : undefined}
              className="w-full bg-transparent text-ds-md font-body text-surface-fg placeholder:text-surface-fg-subtle outline-hidden"
            />
            {loading && <Spinner size="sm" />}
          </div>

          {/* Items */}
          <div ref={listRef} role="listbox" aria-multiselectable="true" className="max-h-[240px] overflow-y-auto py-ds-02">
            {filteredGroups
              ? filteredGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-ds-04 py-ds-02 text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
                      {group.label}
                    </div>
                    {group.items.map(renderItemRow)}
                  </div>
                ))
              : filteredItems.map(renderItemRow)}
            {!loading && filteredItems.length === 0 && (
              <p className="px-ds-04 py-ds-05 text-center text-ds-sm font-body text-surface-fg-subtle">
                {emptyMessage}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)
MultiSelectPopover.displayName = 'MultiSelectPopover'

export { MultiSelectPopover }
