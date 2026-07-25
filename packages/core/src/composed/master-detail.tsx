'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'

/**
 * A responsive master-detail layout. Desktop: fixed-width list panel + detail
 * panel. Below the breakpoint: stacked view with a back button. The list is an
 * ARIA `listbox` with roving keyboard nav (Arrow/Home/End + Enter/Space).
 *
 * Selection can be **controlled** (`selected`) or **owned** by the component
 * (`defaultSelected` + `onSelect`, deriving each row's active state from its
 * `value` — no hand-wiring `active` + `onClick` per row).
 */
export interface MasterDetailProps
  // Replaces the rarely-used native text-selection `onSelect` with our row-select callback.
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Controlled selected item id. `null` = no selection. Omit for uncontrolled. */
  selected?: string | null
  /** Uncontrolled initial selection. */
  defaultSelected?: string | null
  /** Called with a row's `value` when it's chosen (click or Enter/Space). */
  onSelect?: (value: string) => void
  /** Accessible name for the list (the `listbox`). @default 'Items' */
  label?: string
  /** Called when mobile back button is pressed. */
  onBack?: () => void
  /** Master panel width on desktop. @default '280px' */
  masterWidth?: string
  /** Breakpoint below which stacked mode activates. @default 'md' */
  breakpoint?: 'sm' | 'md' | 'lg'
  /** Content to show in the detail pane when nothing is selected. */
  emptyState?: React.ReactNode
  /** Called when the user presses ArrowUp/ArrowDown while the list has focus. */
  onNavigate?: (direction: 'up' | 'down') => void
}

interface MasterDetailListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface MasterDetailDetailProps extends React.HTMLAttributes<HTMLDivElement> {}
interface MasterDetailListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Explicit active state. Omit to derive from `value` === the selected id. */
  active?: boolean
  /** Row id — enables derived selection + auto-fires `onSelect` on activate. */
  value?: string
}

const breakpoints: Record<string, string> = { sm: '640px', md: '768px', lg: '1024px' }

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

interface MasterDetailContextValue {
  selected: string | null
  onSelect?: (value: string) => void
  label: string
  isMobile: boolean
  onBack?: () => void
  emptyState?: React.ReactNode
  onNavigate?: (direction: 'up' | 'down') => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  registerItemRef: (index: number, el: HTMLButtonElement | null) => void
}

const MasterDetailContext = React.createContext<MasterDetailContextValue>({
  selected: null,
  label: 'Items',
  isMobile: false,
  activeIndex: 0,
  setActiveIndex: () => {},
  registerItemRef: () => {},
})

function itemIsActive(child: React.ReactNode, selected: string | null): boolean {
  if (!React.isValidElement(child)) return false
  const p = child.props as { active?: boolean; value?: string }
  return p.active ?? (p.value != null && p.value === selected)
}

function MasterDetailList({ children, className, 'aria-label': ariaLabel, ...props }: MasterDetailListProps) {
  const { selected, label, isMobile, onNavigate, activeIndex, setActiveIndex, registerItemRef } =
    React.useContext(MasterDetailContext)
  const itemRefsLocal = React.useRef<(HTMLButtonElement | null)[]>([])
  const childCount = React.Children.count(children)

  // Roving focus starts on the active/selected row (derived from `active` or `value`).
  const activeChildIndex = React.useMemo(() => {
    let idx = -1
    React.Children.forEach(children, (child, i) => {
      if (itemIsActive(child, selected)) idx = i
    })
    return idx
  }, [children, selected])
  React.useEffect(() => {
    if (activeChildIndex >= 0) setActiveIndex(activeChildIndex)
  }, [activeChildIndex, setActiveIndex])

  if (isMobile && selected) return null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(activeIndex + 1, childCount - 1)
      setActiveIndex(next); itemRefsLocal.current[next]?.focus(); onNavigate?.('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(activeIndex - 1, 0)
      setActiveIndex(prev); itemRefsLocal.current[prev]?.focus(); onNavigate?.('up')
    } else if (e.key === 'Home') {
      e.preventDefault(); setActiveIndex(0); itemRefsLocal.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = childCount - 1
      setActiveIndex(last); itemRefsLocal.current[last]?.focus()
    }
  }

  return (
    <div
      role="listbox"
      aria-label={ariaLabel ?? label}
      tabIndex={-1}
      className={cn('overflow-y-auto focus-visible:outline-hidden', !isMobile && 'border-e border-surface-border', className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<any>, {
          ref: (el: HTMLButtonElement | null) => {
            itemRefsLocal.current[i] = el
            registerItemRef(i, el)
          },
          tabIndex: i === activeIndex ? 0 : -1,
        })
      })}
    </div>
  )
}

function MasterDetailDetail({ children, className, ...props }: MasterDetailDetailProps) {
  const { selected, isMobile, onBack, emptyState } = React.useContext(MasterDetailContext)
  const reduced = useReducedMotion()
  if (isMobile && !selected) return null

  return (
    // aria-live so AT users are told the detail changed when the selection swaps.
    <div role="region" aria-label="Detail" aria-live="polite" className={cn('flex-1 overflow-y-auto', className)} {...props}>
      {isMobile && onBack && (
        <div className="border-b border-surface-border px-ds-04 py-ds-03">
          <Button variant="ghost" size="xs" onClick={onBack} startIcon={<Icon icon={IconArrowLeft} className="rtl:-scale-x-100" />}>
            Back
          </Button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected ?? 'empty'}
          initial={isMobile && !reduced ? { x: 20, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          exit={isMobile && !reduced ? { x: -20, opacity: 0 } : undefined}
          transition={reduced ? { duration: 0 } : springs.snappy}
        >
          {selected ? children : (emptyState ?? children)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const MasterDetailListItem = React.forwardRef<HTMLButtonElement, MasterDetailListItemProps>(
  function MasterDetailListItem({ active, value, children, className, onKeyDown, onClick, ...props }, ref) {
    const { selected, onSelect } = React.useContext(MasterDetailContext)
    const isActive = active ?? (value != null && value === selected)

    function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        ;(e.currentTarget as HTMLButtonElement).click()
      }
      onKeyDown?.(e)
    }
    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (value != null) onSelect?.(value)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isActive}
        data-active={isActive || undefined}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        className={cn(
          'flex w-full items-center px-ds-04 py-ds-03 text-left text-body-md font-sans text-surface-fg',
          'transition-colors duration-fast-01 ease-productive-standard',
          'hover:bg-surface-raised-hover',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-7 focus-visible:ring-inset',
          isActive && 'bg-accent-2 text-accent-11 font-medium',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

function MasterDetailRoot({
  selected,
  defaultSelected = null,
  onSelect,
  label = 'Items',
  onBack,
  masterWidth = '280px',
  breakpoint = 'md',
  emptyState,
  onNavigate,
  children,
  className,
  style,
  ...props
}: MasterDetailProps) {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints[breakpoint]})`)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  // Controlled when `selected` is provided; otherwise own the selection.
  const isControlled = selected !== undefined
  const [internalSelected, setInternalSelected] = React.useState<string | null>(defaultSelected)
  const resolvedSelected = isControlled ? selected ?? null : internalSelected

  const handleSelect = React.useCallback(
    (value: string) => {
      if (!isControlled) setInternalSelected(value)
      onSelect?.(value)
    },
    [isControlled, onSelect],
  )

  const registerItemRef = React.useCallback((index: number, el: HTMLButtonElement | null) => {
    itemRefs.current[index] = el
  }, [])

  return (
    <MasterDetailContext.Provider
      value={{ selected: resolvedSelected, onSelect: handleSelect, label, isMobile, onBack, emptyState, onNavigate, activeIndex, setActiveIndex, registerItemRef }}
    >
      <div
        className={cn('flex h-full', !isMobile && 'grid', className)}
        style={{ ...style, ...(isMobile ? {} : { gridTemplateColumns: `${masterWidth} 1fr` }) }}
        {...props}
      >
        {children}
      </div>
    </MasterDetailContext.Provider>
  )
}

const MasterDetail = Object.assign(MasterDetailRoot, {
  List: MasterDetailList,
  Detail: MasterDetailDetail,
  ListItem: MasterDetailListItem,
})

export { MasterDetail }
export type { MasterDetailListItemProps }
