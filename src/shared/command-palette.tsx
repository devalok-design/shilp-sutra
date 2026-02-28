'use client'

/**
 * CommandPalette -- Keyboard-driven command palette (Ctrl+K / Cmd+K).
 *
 * Adapted from Karm V2. Uses @radix-ui/react-dialog as the overlay.
 * All V1 color tokens replaced with semantic design-system tokens.
 */
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../ui/lib/utils'
import VisuallyHidden from '../ui/visually-hidden'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  shortcut?: string
  onSelect: () => void
}

export interface CommandGroup {
  label: string
  items: CommandItem[]
}

export interface CommandPaletteProps {
  groups?: CommandGroup[]
  placeholder?: string
  onSearch?: (query: string) => void
  emptyMessage?: string
}

// -----------------------------------------------------------------------
// CommandPalette
// -----------------------------------------------------------------------

function CommandPalette({
  groups = [],
  placeholder = 'Search or jump to...',
  onSearch,
  emptyMessage = 'No results found.',
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Filter groups based on query
  const filteredGroups = React.useMemo(() => {
    if (!query.trim()) return groups
    const q = query.toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, query])

  const filteredItems = React.useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  )

  // Global keyboard shortcut
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        )
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        )
        break
      }
      case 'Enter': {
        e.preventDefault()
        const item = filteredItems[activeIndex]
        if (item) {
          item.onSelect()
          setOpen(false)
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        setOpen(false)
        break
      }
    }
  }

  // Scroll active item into view
  React.useEffect(() => {
    const activeEl = listRef.current?.querySelector(
      `[data-command-index="${activeIndex}"]`,
    )
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActiveIndex(0)
    onSearch?.(value)
  }

  // Build a map of item id -> flat index for keyboard navigation
  const itemIndexMap = React.useMemo(() => {
    const map = new Map<string, number>()
    let idx = 0
    for (const group of filteredGroups) {
      for (const item of group.items) {
        map.set(item.id, idx++)
      }
    }
    return map
  }, [filteredGroups])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-50 w-full max-w-[560px] -translate-x-1/2',
            'overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-layer-01)] shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
          )}
          onKeyDown={handleKeyDown}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Command Palette</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Search or jump to pages, projects, tasks, and actions
            </DialogPrimitive.Description>
          </VisuallyHidden>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[var(--color-border-default)] px-4 py-3">
            <Search
              className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-placeholder)]"
              strokeWidth={1.5}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)] outline-none',
                'placeholder:text-[var(--color-text-placeholder)]',
              )}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <kbd className="hidden shrink-0 select-none rounded-md border border-[var(--color-border-default)] bg-[var(--color-layer-02)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-placeholder)] sm:inline-flex">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[320px] overflow-y-auto px-2 py-2"
          >
            {filteredGroups.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-[var(--color-text-placeholder)]">
                  {emptyMessage}
                </p>
              </div>
            )}

            {filteredGroups.map((group) => (
              <div key={group.label} className="mb-1">
                <div className="px-2 pb-1 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-placeholder)]">
                    {group.label}
                  </span>
                </div>

                {group.items.map((item) => {
                  const itemIndex = itemIndexMap.get(item.id) ?? 0
                  const isActive = itemIndex === activeIndex
                  const ItemIcon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-command-index={itemIndex}
                      onClick={() => {
                        item.onSelect()
                        setOpen(false)
                      }}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                        isActive
                          ? 'bg-[var(--color-layer-03)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-layer-02)]',
                      )}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          className="h-4 w-4 shrink-0 text-[var(--color-text-placeholder)]"
                          strokeWidth={1.5}
                        />
                      )}
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm">{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-[var(--color-text-placeholder)]">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="shrink-0 rounded border border-[var(--color-border-default)] bg-[var(--color-layer-02)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-placeholder)]">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isActive && (
                        <CornerDownLeft
                          className="h-3 w-3 shrink-0 text-[var(--color-text-placeholder)]"
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center gap-4 border-t border-[var(--color-border-default)] px-4 py-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-layer-02)]">
                  <ArrowUp className="h-2.5 w-2.5 text-[var(--color-text-placeholder)]" strokeWidth={2} />
                </kbd>
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-layer-02)]">
                  <ArrowDown className="h-2.5 w-2.5 text-[var(--color-text-placeholder)]" strokeWidth={2} />
                </kbd>
              </div>
              <span className="text-[10px] text-[var(--color-text-placeholder)]">
                Navigate
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-layer-02)] px-1.5">
                <CornerDownLeft className="h-2.5 w-2.5 text-[var(--color-text-placeholder)]" strokeWidth={2} />
              </kbd>
              <span className="text-[10px] text-[var(--color-text-placeholder)]">
                Select
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-layer-02)] px-1.5 text-[10px] font-medium text-[var(--color-text-placeholder)]">
                Esc
              </kbd>
              <span className="text-[10px] text-[var(--color-text-placeholder)]">
                Close
              </span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

CommandPalette.displayName = 'CommandPalette'

export { CommandPalette }
