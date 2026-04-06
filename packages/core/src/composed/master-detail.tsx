'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconArrowLeft } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { springs } from '../ui/lib/motion'

// ============================================================
// Types
// ============================================================

/**
 * A responsive master-detail layout. On desktop, shows a fixed-width list panel
 * alongside a detail panel. Below the breakpoint, switches to a stacked view
 * with animated transitions and a back button.
 */
export interface MasterDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ID of currently selected item. null = no selection (show list on mobile). */
  selected?: string | null
  /** Called when mobile back button is pressed. */
  onBack?: () => void
  /** Master panel width on desktop. @default '280px' */
  masterWidth?: string
  /** Breakpoint below which stacked mode activates. @default 'md' */
  breakpoint?: 'sm' | 'md' | 'lg'
  /** Content to show in the detail pane when nothing is selected. */
  emptyState?: React.ReactNode
  /** Called when user presses ArrowUp/ArrowDown while the list has focus. */
  onNavigate?: (direction: 'up' | 'down') => void
}

interface MasterDetailListProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MasterDetailDetailProps extends React.HTMLAttributes<HTMLDivElement> {}

interface MasterDetailListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

// ============================================================
// Breakpoint values
// ============================================================

const breakpoints: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
}

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

// ============================================================
// Context
// ============================================================

interface MasterDetailContextValue {
  selected: string | null
  isMobile: boolean
  onBack?: () => void
  emptyState?: React.ReactNode
  onNavigate?: (direction: 'up' | 'down') => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  registerItemRef: (index: number, el: HTMLButtonElement | null) => void
  itemCount: number
  setItemCount: (count: number) => void
}

const MasterDetailContext = React.createContext<MasterDetailContextValue>({
  selected: null,
  isMobile: false,
  activeIndex: 0,
  setActiveIndex: () => {},
  registerItemRef: () => {},
  itemCount: 0,
  setItemCount: () => {},
})

// ============================================================
// Compound Components
// ============================================================

function MasterDetailList({ children, className, ...props }: MasterDetailListProps) {
  const { selected, isMobile, onNavigate, activeIndex, setActiveIndex, registerItemRef, setItemCount } = React.useContext(MasterDetailContext)
  const itemRefsLocal = React.useRef<(HTMLButtonElement | null)[]>([])

  // Count children and register with context
  const childCount = React.Children.count(children)
  React.useEffect(() => {
    setItemCount(childCount)
  }, [childCount, setItemCount])

  // On mobile, hide list when something is selected
  if (isMobile && selected) return null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(activeIndex + 1, childCount - 1)
      setActiveIndex(next)
      itemRefsLocal.current[next]?.focus()
      onNavigate?.('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(activeIndex - 1, 0)
      setActiveIndex(prev)
      itemRefsLocal.current[prev]?.focus()
      onNavigate?.('up')
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
      itemRefsLocal.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = childCount - 1
      setActiveIndex(last)
      itemRefsLocal.current[last]?.focus()
    }
  }

  return (
    <div
      role="listbox"
      className={cn(
        'overflow-y-auto focus-visible:outline-none',
        !isMobile && 'border-r border-surface-border',
        className,
      )}
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

  // On mobile, hide detail when nothing selected
  if (isMobile && !selected) return null

  return (
    <div className={cn('flex-1 overflow-y-auto', className)} {...props}>
      {isMobile && onBack && (
        <div className="border-b border-surface-border px-ds-04 py-ds-03">
          <Button variant="ghost" size="xs" onClick={onBack} startIcon={<Icon icon={IconArrowLeft} />}>
            Back
          </Button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected ?? 'empty'}
          initial={isMobile ? { x: 20, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          exit={isMobile ? { x: -20, opacity: 0 } : undefined}
          transition={springs.snappy}
        >
          {selected ? children : (emptyState ?? children)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const MasterDetailListItem = React.forwardRef<HTMLButtonElement, MasterDetailListItemProps>(
  function MasterDetailListItem({ active = false, children, className, onKeyDown, ...props }, ref) {
    function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        ;(e.target as HTMLButtonElement).click()
      }
      onKeyDown?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={active}
        data-active={active || undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center px-ds-04 py-ds-03 text-left text-ds-md font-sans text-surface-fg',
          'transition-colors duration-fast-01 ease-productive-standard',
          'hover:bg-surface-raised-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7 focus-visible:ring-inset',
          active && 'bg-accent-2 text-accent-11 border-l-2 border-accent-9',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

// ============================================================
// MasterDetail Root
// ============================================================

function MasterDetailRoot({
  selected = null,
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
  const [itemCount, setItemCount] = React.useState(0)
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const registerItemRef = React.useCallback((index: number, el: HTMLButtonElement | null) => {
    itemRefs.current[index] = el
  }, [])

  return (
    <MasterDetailContext.Provider value={{ selected, isMobile, onBack, emptyState, onNavigate, activeIndex, setActiveIndex, registerItemRef, itemCount, setItemCount }}>
      <div
        className={cn(
          'flex h-full',
          !isMobile && 'grid',
          className,
        )}
        style={{
          ...style,
          ...(isMobile ? {} : { gridTemplateColumns: `${masterWidth} 1fr` }),
        }}
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
