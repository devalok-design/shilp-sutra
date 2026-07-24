'use client'

/**
 * BottomNavbar -- Mobile bottom navigation bar.
 *
 * Props-driven (currentPath / user / items) and router-agnostic via `useLink`.
 * The "More" overflow uses the DS `Sheet` primitive, so it inherits focus trap,
 * scroll lock, return-focus, `aria-modal`, and trigger↔panel ARIA wiring.
 */
import { IconDots } from '@tabler/icons-react'
import { motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'
import { useState } from 'react'

import { Badge } from '../ui/badge'
import { Icon } from '../ui/icon'
import { IconProvider } from '../ui/icon-context'
import type { IconInput } from '../ui/lib/icon-input'
import { springs } from '../ui/lib/motion'
import { normalizeIcon } from '../ui/lib/normalize-icon'
import { cn } from '../ui/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { useLink } from './link-context'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface BottomNavbarUser {
  name: string
  role?: string
}

export interface BottomNavItem {
  title: string
  href: string
  /** Icon for this nav item. Accepts any `IconInput`. */
  icon: IconInput
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
  /** Notification badge count. 0 or undefined = hidden, 1–99 = shown, >99 = "99+" */
  badge?: number
  /**
   * Roles allowed to see this item, matched against `user.role`. Omit to show
   * it to everyone. For arbitrary logic, use `canView` instead.
   */
  roles?: string[]
  /**
   * Visibility predicate — full control over whether this item renders.
   * Receives the current `user` (or `null`). Takes precedence over `roles`.
   */
  canView?: (user: BottomNavbarUser | null) => boolean
}

/** Active-item indicator: a top underline (default) or a Material-3 pill behind the icon. */
export type BottomNavIndicator = 'underline' | 'pill'
/** Show labels always (default) or only for the selected item (narrow viewports). */
export type BottomNavLabelVisibility = 'always' | 'selected'

export interface BottomNavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Currently active pathname */
  currentPath?: string
  /** Current user. Drives per-item role gating via `item.roles` / `item.canView`. */
  user?: BottomNavbarUser | null
  /** Primary nav items shown directly in the bottom bar (max 4 recommended) */
  primaryItems?: BottomNavItem[]
  /** Additional items shown in the "More" overflow sheet */
  moreItems?: BottomNavItem[]
  /** Active-indicator style. @default 'underline' */
  indicator?: BottomNavIndicator
  /** Label visibility. @default 'always' */
  labelVisibility?: BottomNavLabelVisibility
  /** Additional className for the nav element */
  className?: string
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Per-item role/visibility gate. `canView` wins; else `roles` matched against user.role; else visible. */
function itemVisible(item: BottomNavItem, user: BottomNavbarUser | null): boolean {
  if (item.canView) return item.canView(user)
  if (item.roles && item.roles.length > 0) {
    return !!user?.role && item.roles.includes(user.role)
  }
  return true
}

// -----------------------------------------------------------------------
// NavBadge (composes Badge)
// -----------------------------------------------------------------------

function NavBadge({ count }: { count: number }) {
  if (!count || count <= 0) return null
  const display = count > 99 ? '99+' : String(count)
  return (
    <Badge
      color="error"
      variant="solid"
      size="xs"
      aria-label={`${count} notifications`}
      className="pointer-events-none absolute -end-1 -top-1 justify-center px-ds-01 tabular-nums motion-safe:animate-in motion-safe:zoom-in-75"
    >
      {display}
    </Badge>
  )
}

// -----------------------------------------------------------------------
// Active indicator (shared-element)
// -----------------------------------------------------------------------

function ActiveIndicator({
  indicator,
  reduced,
}: {
  indicator: BottomNavIndicator
  reduced: boolean
}) {
  const transition = reduced ? { duration: 0 } : springs.snappy
  if (indicator === 'pill') {
    return (
      <motion.span
        layoutId="bottom-nav-indicator"
        aria-hidden="true"
        transition={transition}
        className="absolute inset-0 rounded-pill bg-accent-3"
      />
    )
  }
  return (
    <motion.span
      layoutId="bottom-nav-indicator"
      aria-hidden="true"
      transition={transition}
      className="absolute top-0 h-[3px] w-full rounded-b-control-inner bg-accent-9"
    />
  )
}

// -----------------------------------------------------------------------
// BottomNavLink (internal)
// -----------------------------------------------------------------------

const itemClass =
  'flex h-16 w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-ds-02 px-ds-01 pt-0 text-body-sm transition-colors duration-fast-02 ease-productive-standard'

function BottomNavLink({
  item,
  isActive,
  indicator,
  showLabel,
  reduced,
}: {
  item: BottomNavItem
  isActive: boolean
  indicator: BottomNavIndicator
  showLabel: boolean
  reduced: boolean
}) {
  const Link = useLink()
  return (
    <motion.div
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={reduced ? { duration: 0 } : springs.snappy}
      className="flex min-w-0 flex-1 basis-0"
    >
      <Link
        href={item.href}
        aria-label={item.title}
        aria-current={isActive ? 'page' : undefined}
        className={cn(itemClass, isActive ? 'font-semibold text-accent-11' : 'text-surface-fg-subtle')}
      >
        <div className="relative flex w-full min-w-0 flex-col items-center gap-ds-02">
          {isActive && indicator === 'underline' && (
            <ActiveIndicator indicator="underline" reduced={reduced} />
          )}
          <div className="relative p-ds-03">
            {isActive && indicator === 'pill' && <ActiveIndicator indicator="pill" reduced={reduced} />}
            <span className="relative [&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">
              <IconProvider size="md">{normalizeIcon(item.icon)}</IconProvider>
            </span>
            {item.badge != null && <NavBadge count={item.badge} />}
          </div>
          {showLabel && <span className="max-w-full truncate text-center">{item.title}</span>}
        </div>
      </Link>
    </motion.div>
  )
}

// -----------------------------------------------------------------------
// BottomNavbar
// -----------------------------------------------------------------------

const BottomNavbar = React.forwardRef<HTMLElement, BottomNavbarProps>(
  (
    {
      currentPath = '/',
      user = null,
      primaryItems = [],
      moreItems = [],
      indicator = 'underline',
      labelVisibility = 'always',
      className,
      ...props
    },
    ref,
  ) => {
    const Link = useLink()
    const reduced = useReducedMotion() ?? false
    const [showMore, setShowMore] = useState(false)

    const isActive = (path: string, exact = false) => {
      if (exact || path === '/') return currentPath === path
      return currentPath.startsWith(path)
    }

    // Role/visibility gating
    const visiblePrimary = primaryItems.filter((item) => itemVisible(item, user))
    const visibleMore = moreItems.filter((item) => itemVisible(item, user))

    const isMoreActive = visibleMore.some((item) => isActive(item.href, item.exact))
    const moreSelected = showMore || isMoreActive
    const showMoreLabel = labelVisibility === 'always' || moreSelected

    return (
      <nav
        {...props}
        ref={ref}
        aria-label="Mobile navigation"
        className={cn(
          'fixed bottom-0 start-0 end-0 z-sticky flex w-full flex-row items-stretch justify-between border-t border-surface-border-strong bg-surface-chrome px-ds-05 pb-safe pt-0 md:hidden',
          className,
        )}
      >
        {visiblePrimary.map((item) => (
          <BottomNavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href, item.exact)}
            indicator={indicator}
            showLabel={labelVisibility === 'always' || isActive(item.href, item.exact)}
            reduced={reduced}
          />
        ))}

        {visibleMore.length > 0 && (
          <Sheet open={showMore} onOpenChange={setShowMore}>
            <SheetTrigger asChild>
              <motion.button
                type="button"
                aria-label="More navigation options"
                whileTap={reduced ? undefined : { scale: 0.96 }}
                transition={reduced ? { duration: 0 } : springs.snappy}
                className={cn(
                  itemClass,
                  'min-w-0 flex-1 basis-0',
                  moreSelected ? 'font-semibold text-accent-11' : 'text-surface-fg-subtle',
                )}
              >
                <div className="relative flex w-full min-w-0 flex-col items-center gap-ds-02">
                  {moreSelected && indicator === 'underline' && (
                    <ActiveIndicator indicator="underline" reduced={reduced} />
                  )}
                  <div className="relative p-ds-03">
                    {moreSelected && indicator === 'pill' && <ActiveIndicator indicator="pill" reduced={reduced} />}
                    <Icon icon={IconDots} />
                  </div>
                  {showMoreLabel && <span className="max-w-full truncate text-center">More</span>}
                </div>
              </motion.button>
            </SheetTrigger>

            <SheetContent side="bottom" className="rounded-t-bubble">
              <SheetHeader>
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(72px,1fr))] gap-ds-03 pt-ds-04">
                {visibleMore.map((item) => {
                  const active = isActive(item.href, item.exact)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-w-0 flex-col items-center gap-ds-02b rounded-overlay-lg p-ds-04 text-body-sm transition-colors ease-productive-standard',
                        active
                          ? 'bg-surface-raised-hover text-accent-11'
                          : 'text-surface-fg-subtle hover:bg-surface-raised-hover',
                      )}
                    >
                      <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">
                        <IconProvider size="md">{normalizeIcon(item.icon)}</IconProvider>
                      </span>
                      <span className="max-w-full truncate text-center">{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    )
  },
)
BottomNavbar.displayName = 'BottomNavbar'

export { BottomNavbar }
