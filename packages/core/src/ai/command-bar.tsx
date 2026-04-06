'use client'

/**
 * CommandBar -- Unified AI command interface.
 *
 * Three variants:
 * - hero:     Full-featured inline bar with greeting, hints, placeholder rotation
 * - inline:   Compact inline bar for embedding in panels/toolbars
 * - floating:  Modal overlay (same pattern as CommandPalette) with global keybinding
 *
 * Supports both command-palette filtering (when `groups` provided) and
 * AI natural-language submission via `onSubmit`.
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
import {
  IconSearch,
  IconX,
  IconCornerDownLeft,
  IconArrowUp,
  IconArrowDown,
  IconLoader2,
} from '@tabler/icons-react'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { tweens, springs } from '../ui/lib/motion'
import { VisuallyHidden } from '../ui/visually-hidden'
import { useMotion } from '../motion/motion-provider'
import { matchesKeybinding, getIsMac, getModifierDisplay } from '../ui/lib/keybinding'
import type { CommandGroup, CommandItem } from '../composed/command-palette'

// -----------------------------------------------------------------------
// GradientBorderWrap — animated gradient border during processing
// -----------------------------------------------------------------------

/**
 * Wraps the input row with an animated gradient border during processing.
 * Uses the Devalok brand palette (pink → purple → magenta) flowing around
 * the border. When inactive, renders children directly with no wrapper overhead.
 *
 * Technique: outer div with gradient background + padding-[1.5px] creates
 * a visible gradient border. The inner content covers the center, leaving
 * only the edge visible as a "border".
 */
function GradientBorderWrap({
  active,
  rounded,
  reducedMotion,
  children,
}: {
  active: boolean
  rounded: string
  reducedMotion: boolean
  children: React.ReactNode
}) {
  if (!active) return <>{children}</>

  if (reducedMotion) {
    return (
      <div className={cn('p-[1.5px] bg-accent-9', rounded)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={cn('relative p-[1.5px]', rounded)}
      style={{
        background: 'linear-gradient(var(--gradient-angle, 0deg), #D33163, #9B5DE5, #C850C0, #D33163)',
        backgroundSize: '300% 300%',
      }}
      animate={{
        // Rotate the gradient angle — creates the flowing border effect
        // Using CSS custom property animation via backgroundPosition as proxy
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      }}
      transition={{
        backgroundPosition: {
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
    >
      {/* Subtle outer glow */}
      <motion.div
        className={cn('absolute inset-0 -z-10', rounded)}
        style={{
          background: 'linear-gradient(var(--gradient-angle, 0deg), #D33163, #9B5DE5, #C850C0, #D33163)',
          backgroundSize: '300% 300%',
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' },
        }}
      />
      {children}
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/**
 * Unified AI command interface with three visual variants:
 * - `hero`: full-featured inline bar with greeting, animated placeholder rotation, and hints
 * - `inline`: compact bar for embedding in panels or toolbars
 * - `floating`: modal overlay with global keybinding (same pattern as CommandPalette)
 *
 * Supports both command-palette filtering (when `groups` provided) and
 * natural-language AI submission via `onSubmit`.
 */
export interface CommandBarProps
  extends Omit<React.ComponentPropsWithRef<'div'>, 'onSubmit'> {
  // -- AI submission --
  /** Called when the user submits a query (Enter key). */
  onSubmit?: (query: string) => void
  /** Current interaction state. Controls visual feedback (gradient border, placeholder). */
  state?: 'idle' | 'typing' | 'processing' | 'responded'

  // -- Command palette mode (optional) --
  /** When provided, enables command-palette filtering alongside AI submission. */
  groups?: CommandGroup[]
  onSearch?: (query: string) => void
  emptyMessage?: string
  emptyState?: React.ReactNode

  // -- Visual --
  /** Layout variant. @default 'hero' */
  variant?: 'hero' | 'inline' | 'floating'
  /** Placeholder text, or an array of strings that rotate on an interval. */
  placeholder?: string | string[]
  /** Rotation interval in ms when `placeholder` is an array. @default 4000 */
  placeholderInterval?: number
  /** Greeting text shown above the input in `hero` variant. */
  greeting?: string
  /** Hint strings shown below the input in `hero` variant. */
  hints?: string[]
  agentName?: string
  agentIcon?: React.ReactNode

  // -- Floating variant (modal) --
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Keybinding to toggle the floating bar. @default 'mod+k' */
  keybinding?: string | string[] | false

  // -- Interaction --
  disabled?: boolean
  maxHeight?: string | number

  // -- Composition --
  children?: React.ReactNode
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function getFilterValue(item: CommandItem): string {
  if (item.filterValue) return item.filterValue
  if (typeof item.label === 'string') return item.label
  return ''
}

function getFilterDescription(item: CommandItem): string {
  if (typeof item.description === 'string') return item.description
  return ''
}

// -----------------------------------------------------------------------
// Rotating Placeholder
// -----------------------------------------------------------------------

function RotatingPlaceholder({
  placeholders,
  interval,
  paused,
}: {
  placeholders: string[]
  interval: number
  paused: boolean
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const { reducedMotion } = useMotion()

  React.useEffect(() => {
    if (paused || placeholders.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length)
    }, interval)
    return () => clearInterval(timer)
  }, [paused, placeholders.length, interval])

  if (reducedMotion) {
    return (
      <span className="pointer-events-none absolute text-surface-fg-subtle">
        {placeholders[currentIndex]}
      </span>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={placeholders[currentIndex]}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={tweens.fade}
        className="pointer-events-none absolute text-surface-fg-subtle"
      >
        {placeholders[currentIndex]}
      </motion.span>
    </AnimatePresence>
  )
}

// -----------------------------------------------------------------------
// CommandBar
// -----------------------------------------------------------------------

const CommandBar = React.forwardRef<HTMLDivElement, CommandBarProps>(
  function CommandBar(
    {
      onSubmit,
      state = 'idle',
      groups = [],
      onSearch,
      emptyMessage = 'No results found.',
      emptyState,
      variant = 'hero',
      placeholder = 'Ask anything...',
      placeholderInterval = 5000,
      greeting,
      hints,
      agentName,
      agentIcon,
      open: openProp,
      defaultOpen,
      onOpenChange,
      keybinding = 'mod+j',
      disabled = false,
      maxHeight = '320px',
      children,
      className,
      ...props
    },
    ref,
  ) {
    // -- Controlled/uncontrolled open state (floating) --
    const isControlled = openProp !== undefined
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
    const open = isControlled ? openProp : internalOpen

    const openRef = React.useRef(open)
    openRef.current = open

    const setOpen = React.useCallback(
      (nextOpen: boolean | ((prev: boolean) => boolean)) => {
        const resolved =
          typeof nextOpen === 'function' ? nextOpen(openRef.current) : nextOpen
        if (!isControlled) {
          setInternalOpen(resolved)
        }
        onOpenChange?.(resolved)
      },
      [isControlled, onOpenChange],
    )

    // -- Core state --
    const [query, setQuery] = React.useState('')
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const [lastQuery, setLastQuery] = React.useState('')
    const [isFocused, setIsFocused] = React.useState(false)
    const [shake, setShake] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    const instanceId = React.useId()
    const listboxId = `command-bar-listbox-${instanceId}`

    // -- Motion --
    const { reducedMotion: isReduced } = useMotion()
    const noMotionTransition = { duration: 0 }

    // -- Platform detection --
    const isMac = React.useMemo(() => getIsMac(), [])

    // -- Placeholders --
    const placeholders = React.useMemo(
      () => (Array.isArray(placeholder) ? placeholder : [placeholder]),
      [placeholder],
    )

    // -- Has groups --
    const hasGroups = groups.length > 0

    // -- Filter groups --
    const filteredGroups = React.useMemo(() => {
      if (!hasGroups) return []
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
    }, [groups, query, hasGroups])

    const filteredItems = React.useMemo(
      () => filteredGroups.flatMap((g) => g.items),
      [filteredGroups],
    )

    // Build item index map for keyboard navigation
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

    // -- Max height CSS --
    const maxHeightValue =
      typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

    // -- Global keybinding (floating variant) --
    React.useEffect(() => {
      if (variant !== 'floating' || keybinding === false) return

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
    }, [variant, keybinding, setOpen])

    // -- Reset on floating open --
    React.useEffect(() => {
      if (variant === 'floating' && open) {
        setQuery('')
        setActiveIndex(-1)
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }
    }, [variant, open])

    // -- Scroll active item into view --
    React.useEffect(() => {
      if (activeIndex < 0) return
      const activeEl = listRef.current?.querySelector(
        `[data-command-index="${activeIndex}"]`,
      )
      activeEl?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex])

    // -- Query change handler --
    const handleQueryChange = (value: string) => {
      setQuery(value)
      setActiveIndex(hasGroups && value.trim() ? 0 : -1)
      onSearch?.(value)
    }

    // -- Submit handler --
    const handleSubmit = React.useCallback(() => {
      if (!query.trim() || disabled) return
      setLastQuery(query)
      onSubmit?.(query)
    }, [query, disabled, onSubmit])

    // -- Keyboard handler --
    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          if (!hasGroups || filteredItems.length === 0) return
          e.preventDefault()
          setActiveIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0,
          )
          break
        }
        case 'ArrowUp': {
          if (hasGroups && filteredItems.length > 0) {
            e.preventDefault()
            setActiveIndex((prev) =>
              prev > 0 ? prev - 1 : filteredItems.length - 1,
            )
          } else if (!hasGroups && !query && lastQuery) {
            // Recall last query
            e.preventDefault()
            setQuery(lastQuery)
          }
          break
        }
        case 'Enter': {
          e.preventDefault()
          const isCmdEnter = e.metaKey || e.ctrlKey

          if (isCmdEnter) {
            // Cmd+Enter always submits
            handleSubmit()
          } else if (
            hasGroups &&
            activeIndex >= 0 &&
            filteredItems[activeIndex]
          ) {
            // Enter selects active command item
            filteredItems[activeIndex].onSelect()
            if (variant === 'floating') setOpen(false)
          } else {
            // Enter submits query
            handleSubmit()
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          if (state === 'responded') {
            setQuery('')
          } else if (variant === 'floating') {
            setOpen(false)
          } else {
            inputRef.current?.blur()
          }
          break
        }
      }
    }

    // -- Clear handler --
    const handleClear = () => {
      setQuery('')
      setActiveIndex(-1)
      inputRef.current?.focus()
    }

    // -- Shake animation reset --
    React.useEffect(() => {
      if (shake) {
        const timer = setTimeout(() => setShake(false), 500)
        return () => clearTimeout(timer)
      }
    }, [shake])

    // -- Shared spring/tween for reduced motion --
    const springSnappy = isReduced ? noMotionTransition : springs.snappy
    const tweenFade = isReduced ? noMotionTransition : tweens.fade
    const noInit = isReduced ? { opacity: 1, scale: 1, y: 0 } : undefined

    // =====================================================================
    // Shared Input Row
    // =====================================================================
    const isCompact = variant === 'inline'
    const isProcessing = state === 'processing'
    const isResponded = state === 'responded'

    const renderInputRow = () => (
      <GradientBorderWrap
        active={isProcessing}
        rounded={isCompact ? 'rounded-ds-md' : 'rounded-ds-lg'}
        reducedMotion={isReduced}
      >
        <div
          className={cn(
            'flex items-center gap-ds-04 border bg-surface-overlay transition-colors transition-shadow duration-fast-02 ease-productive-standard',
            isCompact
              ? 'rounded-ds-md px-ds-04'
              : 'rounded-ds-lg px-ds-05',
            isProcessing
              ? 'border-transparent'
              : 'border-surface-border-strong',
            isFocused && !isProcessing && 'border-accent-7 shadow-ring',
            shake && 'animate-shake',
          )}
        >
        {/* Search icon */}
        <Icon
          icon={IconSearch}
          size={isCompact ? 'xs' : 'sm'}
          stroke="light"
          className={cn(
            'shrink-0 transition-colors duration-fast-02 ease-productive-standard',
            isFocused ? 'text-accent-9' : 'text-surface-fg-subtle',
          )}
        />

        {/* Input wrapper */}
        <div className="relative flex flex-1 items-center">
          {!query && !isFocused && placeholders.length > 1 && (
            <RotatingPlaceholder
              placeholders={placeholders}
              interval={placeholderInterval}
              paused={isFocused || !!query}
            />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholders.length === 1 || isFocused ? placeholders[0] : ''
            }
            readOnly={isProcessing}
            disabled={disabled}
            role="combobox"
            aria-expanded={hasGroups && filteredItems.length > 0}
            aria-controls={hasGroups ? listboxId : undefined}
            aria-activedescendant={
              hasGroups && activeIndex >= 0 && filteredItems[activeIndex]
                ? `command-bar-item-${instanceId}-${filteredItems[activeIndex].id}`
                : undefined
            }
            aria-autocomplete={hasGroups ? 'list' : undefined}
            aria-label={agentName ? `Ask ${agentName}` : 'AI Command Bar'}
            className={cn(
              'flex-1 bg-transparent text-surface-fg outline-none',
              'placeholder:text-surface-fg-subtle',
              isCompact ? 'h-9 text-ds-sm' : 'h-12 text-ds-base',
              isProcessing && 'cursor-wait',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Right side: spinner / clear / shortcut badge */}
        {isProcessing ? (
          <span data-testid="command-bar-spinner" className="shrink-0">
            <Icon
              icon={IconLoader2}
              size={isCompact ? 'xs' : 'sm'}
              stroke="light"
              animate="spin"
              className="text-accent-9"
            />
          </span>
        ) : isResponded ? (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-ds-sm p-ds-01 text-surface-fg-subtle transition-colors duration-fast-01 hover:bg-surface-raised-hover hover:text-surface-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label="Clear"
          >
            <Icon
              icon={IconX}
              size={isCompact ? 'xs' : 'sm'}
              stroke="light"
            />
          </button>
        ) : variant === 'hero' ? (
          <AnimatePresence>
            {!isFocused && (
              <motion.kbd
                initial={noInit ?? { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={isReduced ? undefined : { opacity: 0 }}
                transition={tweenFade}
                className="hidden shrink-0 select-none rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b py-ds-01 text-ds-sm font-medium text-surface-fg-subtle shadow-kbd sm:inline-flex"
              >
                {getModifierDisplay(isMac)}J
              </motion.kbd>
            )}
          </AnimatePresence>
        ) : null}
        </div>
      </GradientBorderWrap>
    )

    // =====================================================================
    // Command Results (shared between variants)
    // =====================================================================
    const renderCommandResults = () => {
      if (!hasGroups) return null

      const showResults =
        filteredItems.length > 0 || (query.trim() && filteredGroups.length === 0)

      if (!showResults && !query.trim()) return null

      return (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Command results"
          className="overflow-y-auto px-ds-03 py-ds-03"
          style={{ maxHeight: maxHeightValue }}
        >
          {filteredGroups.length === 0 && query.trim() && (
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
              transition={
                isReduced
                  ? noMotionTransition
                  : { ...tweens.fade, delay: groupIdx * 0.06 }
              }
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
                    id={`command-bar-item-${instanceId}-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-command-index={itemIndex}
                    initial={noInit ?? { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      isReduced
                        ? noMotionTransition
                        : { ...springs.snappy, delay: itemIndex * 0.03 }
                    }
                    onClick={() => {
                      item.onSelect()
                      if (variant === 'floating') setOpen(false)
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
                          isActive
                            ? 'text-accent-11'
                            : 'text-surface-fg-subtle',
                        )}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    )}
                    <div className="flex flex-1 flex-col">
                      <span className="text-ds-md">
                        {item.renderLabel
                          ? item.renderLabel(query)
                          : item.label}
                      </span>
                      {item.description && (
                        <span className="text-ds-sm text-surface-fg-subtle">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={isReduced ? undefined : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={isReduced ? undefined : { opacity: 0 }}
                          transition={tweenFade}
                          className="inline-flex shrink-0"
                        >
                          <Icon
                            icon={IconCornerDownLeft}
                            size="sm"
                            stroke="light"
                            className="text-surface-fg-subtle"
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
      )
    }

    // =====================================================================
    // Hero Variant
    // =====================================================================
    if (variant === 'hero') {
      return (
        <div
          ref={ref}
          role="search"
          className={cn(
            'bg-surface-raised rounded-ds-xl shadow-raised p-ds-07',
            className,
          )}
          {...props}
        >
          {greeting && (
            <p className="text-ds-lg text-surface-fg-muted mb-ds-04">
              {greeting}
            </p>
          )}

          {renderInputRow()}
          {renderCommandResults()}

          {/* Hints */}
          {hints && hints.length > 0 && (
            <div className="mt-ds-04 flex flex-wrap gap-ds-02b">
              {hints.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => {
                    setQuery(hint)
                    onSearch?.(hint)
                    inputRef.current?.focus()
                  }}
                  className="rounded-ds-md border border-surface-border-strong bg-surface-overlay px-ds-03 py-ds-01 text-ds-sm text-surface-fg-subtle transition-colors duration-fast-02 ease-productive-standard hover:bg-surface-raised-hover hover:text-surface-fg-muted"
                >
                  {hint}
                </button>
              ))}
            </div>
          )}

          {/* Response area (children) */}
          {children && <div className="mt-ds-05">{children}</div>}
        </div>
      )
    }

    // =====================================================================
    // Inline Variant
    // =====================================================================
    if (variant === 'inline') {
      return (
        <div
          ref={ref}
          role="search"
          className={cn('w-full', className)}
          {...props}
        >
          {renderInputRow()}
          {renderCommandResults()}
          {children && <div className="mt-ds-03">{children}</div>}
        </div>
      )
    }

    // =====================================================================
    // Floating Variant
    // =====================================================================
    const handleDialogOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen)
    }

    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-overlay bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
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
          >
            <VisuallyHidden>
              <DialogTitle>AI Command Bar</DialogTitle>
              <DialogDescription>
                Search commands or ask a question
              </DialogDescription>
            </VisuallyHidden>

            <div className="p-ds-04">{renderInputRow()}</div>

            {renderCommandResults()}

            {children && (
              <div className="border-t border-surface-border-strong p-ds-04">
                {children}
              </div>
            )}

            {/* Footer hints */}
            <motion.div
              initial={noInit ?? { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={tweenFade}
              className="flex items-center gap-ds-05 border-t border-surface-border-strong px-ds-05 py-ds-03"
            >
              {hasGroups && (
                <div className="flex items-center gap-ds-02b">
                  <div className="flex items-center gap-ds-01">
                    <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-raised shadow-kbd">
                      <Icon icon={IconArrowUp} size="xs" className="text-surface-fg-subtle" />
                    </kbd>
                    <kbd className="inline-flex h-ico-md w-ico-md items-center justify-center rounded border border-surface-border-strong bg-surface-raised shadow-kbd">
                      <Icon icon={IconArrowDown} size="xs" className="text-surface-fg-subtle" />
                    </kbd>
                  </div>
                  <span className="text-ds-xs text-surface-fg-subtle">
                    Navigate
                  </span>
                </div>
              )}
              <div className="flex items-center gap-ds-02b">
                <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b shadow-kbd">
                  <Icon icon={IconCornerDownLeft} size="xs" className="text-surface-fg-subtle" />
                </kbd>
                <span className="text-ds-xs text-surface-fg-subtle">
                  Submit
                </span>
              </div>
              <div className="flex items-center gap-ds-02b">
                <kbd className="inline-flex h-[20px] items-center justify-center rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b text-ds-xs font-medium text-surface-fg-subtle shadow-kbd">
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

CommandBar.displayName = 'CommandBar'

export { CommandBar }
export type { CommandGroup, CommandItem }
