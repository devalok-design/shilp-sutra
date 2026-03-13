'use client'

/**
 * TopBar -- Application top bar with sidebar trigger, user menu, and action
 * buttons. All data is props-driven (no Zustand stores or Remix hooks).
 */
import * as React from 'react'
import { useColorMode } from '../hooks/use-color-mode'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip'
import { SidebarTrigger } from '../ui/sidebar'
import { IconLogout, IconSearch, IconUser, IconMoon, IconSun, IconSparkles } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface TopBarUser {
  name: string
  email?: string
  image?: string | null
}

export interface UserMenuItem {
  /** Display label */
  label: string
  /** Optional icon (ReactNode) */
  icon?: React.ReactNode
  /** Navigate via onNavigate when clicked */
  href?: string
  /** Custom click handler */
  onClick?: () => void
  /** Render a separator before this item */
  separator?: boolean
  /** Text color semantic token (e.g. "error") — maps to text-{color} */
  color?: string
  /** Badge content — string for count, true for dot indicator */
  badge?: string | boolean
  /** Whether the item is disabled */
  disabled?: boolean
}

export interface TopBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title displayed on desktop */
  pageTitle?: string
  /** Current user information for the avatar dropdown */
  user?: TopBarUser | null
  /** Called when the user clicks a navigation item (e.g. "Profile", "Login") */
  onNavigate?: (path: string) => void
  /** Called when the user clicks the logout button */
  onLogout?: () => void
  /** Called when the search button is clicked */
  onSearchClick?: () => void
  /** Called when the AI chat button is clicked */
  onAiChatClick?: () => void
  /** Optional mobile logo element */
  mobileLogo?: React.ReactNode
  /** Notification center slot -- render your NotificationCenter here */
  notificationSlot?: React.ReactNode
  /** Custom menu items rendered between Profile and Dark/Light Mode */
  userMenuItems?: UserMenuItem[]
  /** Additional className */
  className?: string
}

// -----------------------------------------------------------------------
// TopBar
// -----------------------------------------------------------------------

const TopBar = React.forwardRef<HTMLDivElement, TopBarProps>(
  (
    {
      pageTitle = '',
      user,
      onNavigate,
      onLogout,
      onSearchClick,
      onAiChatClick,
      mobileLogo,
      notificationSlot,
      userMenuItems,
      className,
      ...props
    },
    ref,
  ) => {
    const { colorMode, toggleColorMode } = useColorMode()

    const handleSearchClick = () => {
      if (onSearchClick) {
        onSearchClick()
      } else {
        // Fallback: dispatch Ctrl+K to open the command palette
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            bubbles: true,
          }),
        )
      }
    }

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'z-sticky flex w-full items-center border-b border-surface-border-strong bg-surface-1 px-ds-05 py-ds-04 md:px-ds-06',
          className,
        )}
      >
      {/* Left: Sidebar trigger + page title */}
      <div className="flex items-center gap-ds-04">
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />

        {/* Mobile Logo */}
        {mobileLogo && (
          <div className="md:hidden">{mobileLogo}</div>
        )}

        {/* Desktop page title */}
        {pageTitle && (
          <h2 className="hidden text-ds-lg text-surface-fg md:block">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-ds-03 md:gap-ds-05">
        {/* IconSearch (Cmd+K) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="Search (Ctrl+K)"
              className="flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-ds-full border border-surface-border-strong bg-surface-2 text-surface-fg-muted transition-colors hover:bg-surface-3"
            >
              <IconSearch className="h-ico-sm w-ico-sm" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Search (Ctrl+K)
          </TooltipContent>
        </Tooltip>

        {/* Notifications slot */}
        {notificationSlot}

        {/* AI Chat */}
        {onAiChatClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onAiChatClick}
                aria-label="AI Chat"
                className="flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-ds-full border border-surface-border-strong bg-surface-2 text-surface-fg-muted transition-colors hover:bg-surface-3"
              >
                <IconSparkles className="h-ico-sm w-ico-sm" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              AI Chat
            </TooltipContent>
          </Tooltip>
        )}

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-ds-03 outline-none">
                    <Avatar className="h-ds-sm-plus w-ds-sm-plus cursor-pointer">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-surface-2 text-surface-fg">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                User Menu
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent
              className="w-[200px] rounded-ds-xl border border-surface-border-strong bg-surface-1 p-0 shadow-03"
              sideOffset={8}
              align="end"
            >
              {/* User Info */}
              <div className="border-b border-surface-border-strong px-ds-05 py-ds-04">
                <p className="text-ds-md text-surface-fg">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-ds-sm text-surface-fg-subtle">
                    {user.email}
                  </p>
                )}
              </div>

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2"
                onClick={() => onNavigate?.('/profile')}
              >
                <IconUser className="h-ico-sm w-ico-sm text-surface-fg-muted" />
                <span className="text-ds-md text-surface-fg-muted">
                  Profile
                </span>
              </DropdownMenuItem>

              {/* Custom user menu items */}
              {userMenuItems?.map((item, index) => {
                const colorMap: Record<string, string> = {
                  error: 'text-error',
                  success: 'text-success',
                  warning: 'text-warning',
                  info: 'text-info',
                }
                const textColor = item.color ? (colorMap[item.color] ?? 'text-surface-fg-muted') : 'text-surface-fg-muted'
                return (
                  <React.Fragment key={item.label + index}>
                    {item.separator && <DropdownMenuSeparator className="bg-border" />}
                    <DropdownMenuItem
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2',
                        item.disabled && 'pointer-events-none opacity-[0.38]',
                      )}
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return
                        if (item.onClick) item.onClick()
                        else if (item.href) onNavigate?.(item.href)
                      }}
                    >
                      {item.icon && (
                        <span className={cn('[&>svg]:h-ico-sm [&>svg]:w-ico-sm', textColor)}>
                          {item.icon}
                        </span>
                      )}
                      <span className={cn('text-ds-md', textColor)}>
                        {item.label}
                      </span>
                      {item.badge != null && item.badge !== false && (
                        typeof item.badge === 'string' ? (
                          <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-ds-full bg-error px-ds-02 text-[10px] font-semibold leading-none text-accent-fg">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="ml-auto h-[8px] w-[8px] rounded-ds-full bg-error" />
                        )
                      )}
                    </DropdownMenuItem>
                  </React.Fragment>
                )
              })}

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2"
                onClick={toggleColorMode}
              >
                {colorMode === 'dark' ? (
                  <IconSun className="h-ico-sm w-ico-sm text-surface-fg-muted" />
                ) : (
                  <IconMoon className="h-ico-sm w-ico-sm text-surface-fg-muted" />
                )}
                <span className="text-ds-md text-surface-fg-muted">
                  {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </DropdownMenuItem>

              {onLogout && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2"
                    onClick={onLogout}
                  >
                    <IconLogout className="h-ico-sm w-ico-sm text-error" />
                    <span className="text-ds-md text-error">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
    )
  },
)
TopBar.displayName = 'TopBar'

export { TopBar }
