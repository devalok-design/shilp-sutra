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

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface BottomNavItem {
  title: string
  href: string
  icon: React.ReactNode
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
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
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.title}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm',
        isActive
          ? 'font-semibold text-interactive'
          : 'text-text-helper',
      )}
    >
      <div className="relative flex w-full flex-col items-center gap-ds-02">
        <div
          className={cn(
            'absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-interactive p-0 transition-opacity duration-slow-01',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />
        <div className="p-ds-03">
          <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">{item.icon}</span>
        </div>
        <span className="text-center">{item.title}</span>
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

    if (!user) return null

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
            className="absolute bottom-[72px] left-0 right-0 rounded-t-ds-2xl border-t border-border bg-layer-01 p-ds-05 pb-ds-03"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="mb-ds-04 flex items-center justify-between">
              <span className="text-ds-md font-semibold text-text-primary">
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                aria-label="Close more menu"
                className="flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-full hover:bg-layer-02"
              >
                <IconX className="h-ico-sm w-ico-sm text-text-secondary" aria-hidden="true" />
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
                      ? 'bg-layer-02 text-interactive'
                      : 'text-text-helper hover:bg-layer-02',
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
          'fixed bottom-0 left-0 right-0 z-sticky flex w-full flex-row items-start justify-between border-t border-border bg-layer-01 px-ds-05 pb-ds-05b pt-0 md:hidden',
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
            type="button"
            onClick={() => setShowMore(!showMore)}
            aria-label="More navigation options"
            aria-expanded={showMore}
            className={cn(
              'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm',
              showMore || isMoreActive
                ? 'font-semibold text-interactive'
                : 'text-text-helper',
            )}
          >
            <div className="relative flex w-full flex-col items-center gap-ds-02">
              <div
                className={cn(
                  'absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-interactive p-0 transition-opacity duration-slow-01',
                  showMore || isMoreActive ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
              <div className="p-ds-03">
                <IconDots className="h-ico-md w-ico-md" aria-hidden="true" />
              </div>
              <span className="text-center">More</span>
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
