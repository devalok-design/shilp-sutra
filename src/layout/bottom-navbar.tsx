'use client'

/**
 * BottomNavbar -- Mobile bottom navigation bar.
 *
 * Props-driven: accepts currentPath, user, navItems instead of
 * reading from Remix hooks or Zustand stores.
 */
import * as React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { IconDots, IconX } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface BottomNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
}

export interface BottomNavbarUser {
  name: string
  role?: string
}

export interface BottomNavbarProps {
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
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.title}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-1 p-1 pt-0 text-[11px]',
        isActive
          ? 'font-semibold text-[var(--color-interactive)]'
          : 'text-[var(--color-text-helper)]',
      )}
    >
      <div className="relative flex w-full flex-col items-center gap-1">
        <div
          className={cn(
            'absolute top-0 h-[3px] w-full rounded-b-[var(--radius-sm)] bg-[var(--color-interactive)] p-0 transition-opacity duration-[var(--duration-slow)]',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />
        <div className="p-2.5">
          <item.icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-center leading-none">{item.title}</span>
      </div>
    </Link>
  )
}

// -----------------------------------------------------------------------
// BottomNavbar
// -----------------------------------------------------------------------

const BottomNavbar = React.forwardRef<HTMLElement, BottomNavbarProps>(
  (
    {
      currentPath = '/',
      user,
      primaryItems = [],
      moreItems = [],
      className,
    },
    ref,
  ) => {
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

    if (!user) return null

    return (
      <>
        {/* More Menu Overlay */}
        {showMore && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-[72px] left-0 right-0 rounded-t-[var(--radius-2xl)] border-t border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-4 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                aria-label="Close more menu"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] hover:bg-[var(--color-layer-02)]"
              >
                <IconX className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-[var(--radius-xl)] p-3 text-[11px] transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-[var(--color-layer-02)] text-[var(--color-interactive)]'
                      : 'text-[var(--color-text-helper)] hover:bg-[var(--color-layer-02)]',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-center leading-tight">
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
        ref={ref}
        aria-label="Mobile navigation"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 flex w-full flex-row items-start justify-between border-t border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-4 pb-5 pt-0 md:hidden',
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
          <button
            onClick={() => setShowMore(!showMore)}
            aria-label="More navigation options"
            aria-expanded={showMore}
            className={cn(
              'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-1 p-1 pt-0 text-[11px]',
              showMore || isMoreActive
                ? 'font-semibold text-[var(--color-interactive)]'
                : 'text-[var(--color-text-helper)]',
            )}
          >
            <div className="relative flex w-full flex-col items-center gap-1">
              <div
                className={cn(
                  'absolute top-0 h-[3px] w-full rounded-b-[var(--radius-sm)] bg-[var(--color-interactive)] p-0 transition-opacity duration-[var(--duration-slow)]',
                  showMore || isMoreActive ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
              <div className="p-2.5">
                <IconDots className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-center leading-none">More</span>
            </div>
          </button>
        )}
      </nav>
    </>
    )
  },
)
BottomNavbar.displayName = 'BottomNavbar'

export { BottomNavbar }
