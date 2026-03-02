'use client'

/**
 * TopBar -- Application top bar with sidebar trigger, user menu, and action
 * buttons. All data is props-driven (no Zustand stores or Remix hooks).
 */
import * as React from 'react'
import { useState, useEffect } from 'react'
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

export interface TopBarProps {
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
      className,
    },
    ref,
  ) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        setTheme('dark')
      }
    }, [])

    const toggleTheme = () => {
      document.documentElement.classList.toggle('dark')
      const themeToSet = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
      localStorage.setItem('theme', themeToSet)
      setTheme(themeToSet)
    }

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
        ref={ref}
        className={cn(
          'z-sticky flex w-full items-center border-b border-border bg-layer-01 px-ds-05 py-ds-04 md:px-ds-06',
          className,
        )}
      >
      {/* Left: Sidebar trigger + page title */}
      <div className="flex items-center gap-ds-04">
        <SidebarTrigger className="hidden text-text-secondary md:flex" />

        {/* Mobile Logo */}
        {mobileLogo && (
          <div className="md:hidden">{mobileLogo}</div>
        )}

        {/* Desktop page title */}
        {pageTitle && (
          <h2 className="hidden text-ds-lg text-text-primary md:block">
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
              onClick={handleSearchClick}
              className="flex h-9 w-9 items-center justify-center rounded-ds-full border border-border bg-layer-02 text-text-secondary transition-colors hover:bg-layer-03"
            >
              <IconSearch className="h-ico-sm w-ico-sm" />
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
                onClick={onAiChatClick}
                className="flex h-9 w-9 items-center justify-center rounded-ds-full border border-border bg-layer-02 text-text-secondary transition-colors hover:bg-layer-03"
              >
                <IconSparkles className="h-ico-sm w-ico-sm" />
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
                  <button className="flex items-center gap-ds-03 outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-layer-02 text-text-primary">
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
              className="w-[200px] rounded-ds-xl border border-border bg-layer-01 p-0 shadow-03"
              sideOffset={8}
              align="end"
            >
              {/* User Info */}
              <div className="border-b border-border px-ds-05 py-ds-04">
                <p className="text-ds-md text-text-primary">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-ds-sm text-text-placeholder">
                    {user.email}
                  </p>
                )}
              </div>

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-layer-02"
                onClick={() => onNavigate?.('/profile')}
              >
                <IconUser className="h-ico-sm w-ico-sm text-text-secondary" />
                <span className="text-ds-md text-text-secondary">
                  Profile
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-layer-02"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <IconSun className="h-ico-sm w-ico-sm text-text-secondary" />
                ) : (
                  <IconMoon className="h-ico-sm w-ico-sm text-text-secondary" />
                )}
                <span className="text-ds-md text-text-secondary">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </DropdownMenuItem>

              {onLogout && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-layer-02"
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
