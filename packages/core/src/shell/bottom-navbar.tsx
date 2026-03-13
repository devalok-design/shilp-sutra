'use client'

/**
 * BottomNavbar -- Mobile bottom navigation bar.
 *
 * Props-driven: accepts currentPath, user, navItems instead of
 * reading from Remix hooks or Zustand stores.
 */
import * as React from 'react'
import { useLink } from './link-context'
import { useState } from 'react'
import { IconDots, IconX } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { motion } from 'framer-motion'
import { springs } from '../ui/lib/motion'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface BottomNavItem {
  title: string
  href: string
  icon: React.ReactNode
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
  /** Notification badge count. 0 or undefined = hidden, 1–99 = shown, >99 = "99+" */
  badge?: number
}

export interface BottomNavbarUser {
  name: string
  role?: string
}

export interface BottomNavbarProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Currently active pathname */
  currentPath?: string
  /** User information (used to determine admin status, presence) */
  user?: BottomNavbarUser | null
  /** Primary nav items shown directly in the bottom bar (max 4 recommended) */
  primaryItems?: BottomNavItem[]
  /** Additional items shown in the "More" overflow menu */
  moreItems?: BottomNavItem[]
  /** Additional className for the nav element */
  className?: string
}

// -----------------------------------------------------------------------
// NavBadge (internal)
// -----------------------------------------------------------------------

function NavBadge({ count }: { count: number }) {
  if (!count || count <= 0) return null
  const display = count > 99 ? '99+' : String(count)
  const isMultiDigit = count >= 10
  return (
    <span
      aria-label={`${count} notifications`}
      className={cn(
        'absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-9 text-[10px] font-semibold leading-none text-accent-fg animate-in zoom-in-75',
        isMultiDigit ? 'px-0.5' : '',
      )}
    >
      {display}
    </span>
  )
}

// -----------------------------------------------------------------------
// BottomNavLink (internal)
// -----------------------------------------------------------------------

function BottomNavLink({
  item,
  isActive,
  onClick,
}: {
  item: BottomNavItem
  isActive: boolean
  onClick?: () => void
}) {
  const Link = useLink()
  return (
    <motion.div whileTap={{ y: -2 }} transition={springs.snappy} className="flex max-w-[70px] flex-1">
      <Link
        href={item.href}
        onClick={onClick}
        aria-label={item.title}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex h-16 w-full cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm',
          isActive
            ? 'font-semibold text-accent-11'
            : 'text-surface-fg-subtle',
        )}
      >
        <div className="relative flex w-full flex-col items-center gap-ds-02">
          {isActive && (
            <motion.div
              layoutId="bottom-nav-indicator"
              className="absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-accent-9 p-0"
              aria-hidden="true"
              transition={springs.snappy}
            />
          )}
          <div className="relative p-ds-03">
            <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">{item.icon}</span>
            {item.badge != null && <NavBadge count={item.badge} />}
          </div>
          <span className="text-center">{item.title}</span>
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
      user: _user,
      primaryItems = [],
      moreItems = [],
      className,
      ...props
    },
    ref,
  ) => {
    const Link = useLink()
    const [showMore, setShowMore] = useState(false)

    const isActive = (path: string, exact = false) => {
      if (exact || path === '/') {
        return currentPath === path
      }
      return currentPath.startsWith(path)
    }

    // Check if any "more" item is active
    const isMoreActive = moreItems.some((item) =>
      isActive(item.href, item.exact),
    )

    return (
      <>
        {/* More Menu Overlay */}
        {showMore && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-overlay md:hidden"
          onClick={() => setShowMore(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowMore(false)
            }
          }}
        >
          <div className="absolute inset-0 bg-overlay" />
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- stopPropagation prevents closing when clicking inside menu */}
          <div
            className="absolute bottom-[72px] left-0 right-0 rounded-t-ds-2xl border-t border-surface-border-strong bg-surface-1 p-ds-05 pb-ds-03"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="mb-ds-04 flex items-center justify-between">
              <span className="text-ds-md font-semibold text-surface-fg">
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                aria-label="Close more menu"
                className="flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-full hover:bg-surface-2"
              >
                <IconX className="h-ico-sm w-ico-sm text-surface-fg-muted" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-ds-03">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex flex-col items-center gap-ds-02b rounded-ds-xl p-ds-04 text-ds-sm transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-surface-2 text-accent-11'
                      : 'text-surface-fg-subtle hover:bg-surface-2',
                  )}
                >
                  <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md">{item.icon}</span>
                  <span className="text-center">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        {...props}
        ref={ref}
        aria-label="Mobile navigation"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-sticky flex w-full flex-row items-start justify-between border-t border-surface-border-strong bg-surface-1 px-ds-05 pb-ds-05b pt-0 md:hidden',
          className,
        )}
      >
        {primaryItems.map((item) => (
          <BottomNavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href, item.exact)}
          />
        ))}

        {/* More Button */}
        {moreItems.length > 0 && (
          <motion.button
            type="button"
            onClick={() => setShowMore(!showMore)}
            aria-label="More navigation options"
            aria-expanded={showMore}
            whileTap={{ y: -2 }}
            transition={springs.snappy}
            className={cn(
              'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm',
              showMore || isMoreActive
                ? 'font-semibold text-accent-11'
                : 'text-surface-fg-subtle',
            )}
          >
            <div className="relative flex w-full flex-col items-center gap-ds-02">
              {(showMore || isMoreActive) && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-accent-9 p-0"
                  aria-hidden="true"
                  transition={springs.snappy}
                />
              )}
              <div className="p-ds-03">
                <IconDots className="h-ico-md w-ico-md" aria-hidden="true" />
              </div>
              <span className="text-center">More</span>
            </div>
          </motion.button>
        )}
      </nav>
    </>
    )
  },
)
BottomNavbar.displayName = 'BottomNavbar'

export { BottomNavbar }
