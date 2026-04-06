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
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { tweens, springs } from '../ui/lib/motion'
import { VisuallyHidden } from '../ui/visually-hidden'
import { useMotion } from '../motion/motion-provider'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface CommandItem {
  id: string
  /** Display label — string or ReactNode. When ReactNode, provide `filterValue` for search filtering. */
  label: string | React.ReactNode
  /** Optional description — string or ReactNode. */
  description?: string | React.ReactNode
  icon?: React.ReactNode
  /** Keyboard shortcut hint displayed as keycap badges (e.g., "G D", "Ctrl+N"). */
  shortcut?: string
  /** Custom render override for the label. Receives the current search query for match highlighting. */
  renderLabel?: (query: string) => React.ReactNode
  /** Plain-text value used for search filtering when `label` is a ReactNode. Falls back to `label` if string. */
  filterValue?: string
  onSelect: () => void
}

export interface CommandGroup {
  label: string
  items: CommandItem[]
}

/** A single keyboard hint shown in the footer. */
export interface FooterHint {
  /** Key(s) to display — rendered as text inside `<kbd>` or as an icon. */
  keys: string
  /** Human-readable label for the hint (e.g., "Navigate", "Select"). */
  label: string
}

export interface CommandPaletteProps extends React.ComponentPropsWithoutRef<'div'> {
  groups?: CommandGroup[]
  placeholder?: string
  onSearch?: (query: string) => void
  emptyMessage?: string
  /** Full custom empty state ReactNode — overrides `emptyMessage` when provided. */
  emptyState?: React.ReactNode
  // -- Controlled/uncontrolled open state (P1 #4) --
  /** Controlled open state. */
  open?: boolean
  /** Default open state for uncontrolled usage. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  // -- Keyboard shortcut customization (P1 #6) --
  /** Keybinding(s) to toggle the palette. Pass `false` to disable.
   *  String format: modifier+key, e.g., 'mod+k', 'ctrl+shift+p'.
   *  'mod' maps to Meta on macOS, Ctrl otherwise. */
  keybinding?: string | string[] | false
  // -- Configurable max-height (P2 #8) --
  /** Max height of the results container. CSS value. Default '320px'. */
  maxHeight?: string | number
  // -- Custom footer hints (P2 #11) --
  /** Custom footer keyboard hints. Pass `false` to hide the footer entirely. */
  footerHints?: FooterHint[] | false
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

import { getIsMac, matchesKeybinding, getModifierDisplay } from '../ui/lib/keybinding'

/** Get the text-searchable value from a CommandItem. */
function getFilterValue(item: CommandItem): string {
  if (item.filterValue) return item.filterValue
  if (typeof item.label === 'string') return item.label
  return ''
}

/** Get the text-searchable description from a CommandItem. */
function getFilterDescription(item: CommandItem): string {
  if (typeof item.description === 'string') return item.description
  return ''
}

/** Parse a shortcut string like "G D" or "Ctrl+N" into individual keycap segments. */
function parseShortcutKeys(shortcut: string): string[] {
  // If it has "+" separator (Ctrl+Shift+N style), split on +
  if (shortcut.includes('+')) {
    return shortcut.split('+').map(s => s.trim()).filter(Boolean)
  }
  // Otherwise split on spaces (G D style)
  return shortcut.split(/\s+/).filter(Boolean)
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
      emptyState,
      open: openProp,
      defaultOpen,
      onOpenChange,
      keybinding = 'mod+k',
      maxHeight = '320px',
      footerHints,
      className,
      ...props
    },
    ref,
  ) {
  // -- Controlled/uncontrolled open state --
  const isControlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const open = isControlled ? openProp : internalOpen

  // Use a ref for the current open value to avoid stale closures in setOpen
  const openRef = React.useRef(open)
  openRef.current = open

  const setOpen = React.useCallback(
    (nextOpen: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof nextOpen === 'function' ? nextOpen(openRef.current) : nextOpen
      if (!isControlled) {
        setInternalOpen(resolved)
      }
      onOpenChange?.(resolved)
    },
    [isControlled, onOpenChange],
  )

  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const instanceId = React.useId()
  const listboxId = `command-palette-listbox-${instanceId}`

  // -- Reduced motion (P2 #12) --
  const { reducedMotion: isReduced } = useMotion()
  const noMotionTransition = { duration: 0 }

  // -- Platform detection (P2 #13) --
  const isMac = React.useMemo(() => getIsMac(), [])

  // Filter groups based on query
  const filteredGroups = React.useMemo(() => {
    if (!query.trim()) return groups
    const q = query.toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            getFilterValue(item).toLowerCase().includes(q) ||
            getFilterDescription(item).toLowerCase().includes(q),
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
    if (keybinding === false) return

    const bindings = Array.isArray(keybinding) ? keybinding : [keybinding]

    function handleKeyDown(e: KeyboardEvent) {
      for (const binding of bindings) {
        if (matchesKeybinding(e, binding)) {
          e.preventDefault()
          setOpen((prev) => !prev)
          return
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keybinding, setOpen])

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

  // -- Resolve motion transitions --
  const springSnappy = isReduced ? noMotionTransition : springs.snappy
  const tweenFade = isReduced ? noMotionTransition : tweens.fade
  const noInit = isReduced ? { opacity: 1, scale: 1, y: 0 } : undefined

  // -- Resolve max height CSS value --
  const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

  // -- Resolve footer hints --
  const resolvedFooterHints: FooterHint[] | false =
    footerHints === false
      ? false
      : footerHints ?? [
          { keys: '↑↓', label: 'Navigate' },
          { keys: '↵', label: 'Select' },
          { keys: 'Esc', label: 'Close' },
        ]

  // Handle dialog open change (from Dialog's own close mechanisms)
  const handleDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
    },
    [setOpen],
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="fixed inset-0 z-overlay bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogContentRaw
          ref={ref}
          {...props}
          className={cn(
            'fixed left-1/2 top-[20%] z-modal w-full max-w-[560px] -translate-x-1/2',
            'overflow-hidden rounded-ds-xl border border-surface-border-strong bg-surface-overlay shadow-overlay',
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
              initial={noInit ?? { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springSnappy}
              className="inline-flex shrink-0"
            >
              <Icon icon={IconSearch} size="sm" stroke="light" className="text-surface-fg-subtle" />
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
            <kbd className="hidden shrink-0 select-none rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b py-ds-01 text-ds-sm font-medium text-surface-fg-subtle shadow-kbd sm:inline-flex">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Command results"
            className="overflow-y-auto px-ds-03 py-ds-03"
            style={{ maxHeight: maxHeightValue }}
          >
            {filteredGroups.length === 0 && (
              <motion.div
                initial={noInit ?? { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={tweenFade}
                className="flex items-center justify-center py-ds-07"
              >
                {emptyState ?? (
                  <p className="text-ds-md text-surface-fg-subtle">
                    {emptyMessage}
                  </p>
                )}
              </motion.div>
            )}

            {filteredGroups.map((group, groupIdx) => (
              <motion.div
                key={group.label}
                initial={noInit ?? { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={isReduced ? noMotionTransition : { ...tweens.fade, delay: groupIdx * 0.06 }}
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
                      initial={noInit ?? { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={isReduced ? noMotionTransition : { ...springs.snappy, delay: itemIndex * 0.03 }}
                      onClick={() => {
                        item.onSelect()
                        setOpen(false)
                      }}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      className={cn(
                        'flex w-full items-center gap-ds-04 rounded-ds-lg px-ds-03 py-ds-03 text-left transition-[color,background-color] duration-fast-02 ease-productive-standard',
                        isActive
                          ? 'bg-surface-raised-hover text-surface-fg'
                          : 'text-surface-fg-muted hover:bg-surface-raised',
                      )}
                    >
                      {item.icon && (
                        <span
                          className={cn(
                            '[&>svg]:h-ico-sm [&>svg]:w-ico-sm shrink-0 transition-colors duration-fast-02 ease-productive-standard',
                            isActive ? 'text-accent-11' : 'text-surface-fg-subtle',
                          )}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      )}
                      <div className="flex flex-1 flex-col">
                        <span className="text-ds-md">
                          {item.renderLabel ? item.renderLabel(query) : item.label}
                        </span>
                        {item.description && (
                          <span className="text-ds-sm text-surface-fg-subtle">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.shortcut && (
                        <span className="flex shrink-0 items-center gap-ds-01">
                          {parseShortcutKeys(item.shortcut).map((key, i) => (
                            <kbd
                              key={i}
                              className={cn(
                                'inline-flex min-w-[20px] items-center justify-center rounded border px-ds-02b py-ds-01 text-ds-xs font-medium shadow-kbd transition-colors duration-fast-02 ease-productive-standard',
                                isActive
                                  ? 'bg-accent-2 text-accent-11 border-accent-6'
                                  : 'bg-surface-raised text-surface-fg-subtle border-surface-border-strong',
                              )}
                            >
                              {key === 'Ctrl' || key === 'ctrl' ? getModifierDisplay(isMac) : key}
                            </kbd>
                          ))}
                        </span>
                      )}
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={isReduced ? undefined : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={isReduced ? undefined : { opacity: 0 }}
                            transition={tweenFade}
                            className="inline-flex shrink-0"
                          >
                            <Icon icon={IconCornerDownLeft} size="sm" stroke="light" className="text-surface-fg-subtle" />
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
          {resolvedFooterHints !== false && (
            <motion.div
              initial={noInit ?? { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={tweenFade}
              className="flex items-center gap-ds-05 border-t border-surface-border-strong px-ds-05 py-ds-03"
            >
              {resolvedFooterHints.map((hint, i) => (
                <div key={i} className="flex items-center gap-ds-02b">
                  {hint.keys === '↑↓' ? (
                    <div className="flex items-center gap-ds-01">
                      <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-raised shadow-kbd">
                        <Icon icon={IconArrowUp} size="xs" className="text-surface-fg-subtle" />
                      </kbd>
                      <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-raised shadow-kbd">
                        <Icon icon={IconArrowDown} size="xs" className="text-surface-fg-subtle" />
                      </kbd>
                    </div>
                  ) : hint.keys === '↵' ? (
                    <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b shadow-kbd">
                      <Icon icon={IconCornerDownLeft} size="xs" className="text-surface-fg-subtle" />
                    </kbd>
                  ) : (
                    <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b text-ds-xs font-medium text-surface-fg-subtle shadow-kbd">
                      {hint.keys}
                    </kbd>
                  )}
                  <span className="text-ds-xs text-surface-fg-subtle">
                    {hint.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </DialogContentRaw>
      </DialogPortal>
    </Dialog>
  )
  },
)

CommandPalette.displayName = 'CommandPalette'

export { CommandPalette }
