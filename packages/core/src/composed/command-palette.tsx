'use client'

/**
 * CommandPalette -- Keyboard-driven command palette (Ctrl+K / Cmd+K).
 *
 * Adapted from Karm V2. Uses ui/Dialog as the overlay.
 * All V1 color tokens replaced with semantic design-system tokens.
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContentRaw,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { IconSearch, IconCornerDownLeft, IconArrowUp, IconArrowDown } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { tweens, springs } from '../ui/lib/motion'
import { VisuallyHidden } from '../ui/visually-hidden'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string
  onSelect: () => void
}

export interface CommandGroup {
  label: string
  items: CommandItem[]
}

export interface CommandPaletteProps extends React.ComponentPropsWithoutRef<'div'> {
  groups?: CommandGroup[]
  placeholder?: string
  onSearch?: (query: string) => void
  emptyMessage?: string
}

// -----------------------------------------------------------------------
// CommandPalette
// -----------------------------------------------------------------------

const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    {
      groups = [],
      placeholder = 'Search or jump to...',
      onSearch,
      emptyMessage = 'No results found.',
      className,
      ...props
    },
    ref,
  ) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const instanceId = React.useId()
  const listboxId = `command-palette-listbox-${instanceId}`

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay
          className="fixed inset-0 z-overlay bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogContentRaw
          ref={ref}
          {...props}
          className={cn(
            'fixed left-1/2 top-[20%] z-modal w-full max-w-[560px] -translate-x-1/2',
            'overflow-hidden rounded-ds-xl border border-surface-border-strong bg-surface-1 shadow-05',
            'duration-moderate-02 data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
            className,
          )}
          onKeyDown={handleKeyDown}
        >
          <VisuallyHidden>
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>
              Search or jump to pages, projects, tasks, and actions
            </DialogDescription>
          </VisuallyHidden>

          {/* Search input */}
          <div className="flex items-center gap-ds-04 border-b border-surface-border-strong px-ds-05 py-ds-04">
            <motion.span
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springs.snappy}
              className="inline-flex shrink-0"
            >
              <IconSearch
                className="h-ico-sm w-ico-sm text-surface-fg-subtle"
                stroke={1.5}
              />
            </motion.span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={placeholder}
              role="combobox"
              aria-expanded={true}
              aria-controls={listboxId}
              aria-activedescendant={filteredItems[activeIndex] ? `command-item-${instanceId}-${filteredItems[activeIndex].id}` : undefined}
              aria-autocomplete="list"
              className={cn(
                'flex-1 bg-transparent text-ds-base text-surface-fg outline-none',
                'placeholder:text-surface-fg-subtle',
              )}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <kbd className="hidden shrink-0 select-none rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-02b py-ds-01 text-ds-sm font-medium text-surface-fg-subtle sm:inline-flex">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Command results"
            className="max-h-[320px] overflow-y-auto px-ds-03 py-ds-03"
          >
            {filteredGroups.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={tweens.fade}
                className="flex items-center justify-center py-ds-07"
              >
                <p className="text-ds-md text-surface-fg-subtle">
                  {emptyMessage}
                </p>
              </motion.div>
            )}

            {filteredGroups.map((group, groupIdx) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...tweens.fade, delay: groupIdx * 0.06 }}
                className="mb-ds-02"
              >
                <div className="px-ds-03 pb-ds-02 pt-ds-03">
                  <span className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
                    {group.label}
                  </span>
                </div>

                {group.items.map((item) => {
                  const itemIndex = itemIndexMap.get(item.id) ?? 0
                  const isActive = itemIndex === activeIndex
                  return (
                    <motion.button
                      key={item.id}
                      id={`command-item-${instanceId}-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-command-index={itemIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springs.snappy, delay: itemIndex * 0.03 }}
                      onClick={() => {
                        item.onSelect()
                        setOpen(false)
                      }}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      className={cn(
                        'flex w-full items-center gap-ds-04 rounded-ds-lg px-ds-03 py-ds-03 text-left transition-all duration-fast-02 ease-productive-standard',
                        isActive
                          ? 'bg-surface-3 text-surface-fg'
                          : 'text-surface-fg-muted hover:bg-surface-2',
                      )}
                    >
                      {item.icon && (
                        <span
                          className={cn(
                            '[&>svg]:h-ico-sm [&>svg]:w-ico-sm shrink-0 transition-colors duration-fast-02',
                            isActive ? 'text-accent-11' : 'text-surface-fg-subtle',
                          )}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <div className="flex flex-1 flex-col">
                        <span className="text-ds-md">{item.label}</span>
                        {item.description && (
                          <span className="text-ds-sm text-surface-fg-subtle">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className={cn(
                          'shrink-0 rounded border border-surface-border-strong px-ds-02b py-ds-01 text-ds-xs font-medium transition-colors duration-fast-02',
                          isActive ? 'bg-accent-2 text-accent-11 border-accent-6' : 'bg-surface-2 text-surface-fg-subtle',
                        )}>
                          {item.shortcut}
                        </kbd>
                      )}
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={tweens.fade}
                            className="inline-flex shrink-0"
                          >
                            <IconCornerDownLeft
                              className="h-ico-sm w-ico-sm text-surface-fg-subtle"
                              stroke={1.5}
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </motion.div>
            ))}
          </div>

          {/* Footer with keyboard hints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={tweens.fade}
            className="flex items-center gap-ds-05 border-t border-surface-border-strong px-ds-05 py-ds-03"
          >
            <div className="flex items-center gap-ds-02b">
              <div className="flex items-center gap-ds-01">
                <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-2">
                  <IconArrowUp className="h-ds-03 w-ds-03 text-surface-fg-subtle" stroke={2} />
                </kbd>
                <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-2">
                  <IconArrowDown className="h-ds-03 w-ds-03 text-surface-fg-subtle" stroke={2} />
                </kbd>
              </div>
              <span className="text-ds-xs text-surface-fg-subtle">
                Navigate
              </span>
            </div>
            <div className="flex items-center gap-ds-02b">
              <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-02b">
                <IconCornerDownLeft className="h-ds-03 w-ds-03 text-surface-fg-subtle" stroke={2} />
              </kbd>
              <span className="text-ds-xs text-surface-fg-subtle">
                Select
              </span>
            </div>
            <div className="flex items-center gap-ds-02b">
              <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-2 px-ds-02b text-ds-xs font-medium text-surface-fg-subtle">
                Esc
              </kbd>
              <span className="text-ds-xs text-surface-fg-subtle">
                Close
              </span>
            </div>
          </motion.div>
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  )
  },
)

CommandPalette.displayName = 'CommandPalette'

export { CommandPalette }
