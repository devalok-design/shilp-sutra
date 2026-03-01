'use client'

/**
 * TopBar -- Application top bar with sidebar trigger, user menu, and action
 * buttons. All data is props-driven (no Zustand stores or Remix hooks).
 */
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
import { LogOut, Search, User, Moon, Sun, Sparkles } from 'lucide-react'
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

export default function TopBar({
  pageTitle = '',
  user,
  onNavigate,
  onLogout,
  onSearchClick,
  onAiChatClick,
  mobileLogo,
  notificationSlot,
  className,
}: TopBarProps) {
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
      className={cn(
        'z-20 flex w-full items-center border-b border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-4 py-3 md:px-6',
        className,
      )}
    >
      {/* Left: Sidebar trigger + page title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hidden text-[var(--color-text-secondary)] md:flex" />

        {/* Mobile Logo */}
        {mobileLogo && (
          <div className="md:hidden">{mobileLogo}</div>
        )}

        {/* Desktop page title */}
        {pageTitle && (
          <h2 className="hidden text-lg font-normal text-[var(--color-text-primary)] md:block">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {/* Search (Cmd+K) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSearchClick}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-layer-02)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-03)]"
            >
              <Search className="h-4 w-4" />
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
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-layer-02)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-03)]"
              >
                <Sparkles className="h-4 w-4" />
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
                  <button className="flex items-center gap-2 outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-[var(--color-layer-02)] text-[var(--color-text-primary)]">
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
              className="w-[200px] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0"
              sideOffset={8}
              align="end"
              style={{
                boxShadow: '0px 25px 40px 0px var(--color-shadow, rgba(0,0,0,0.08))',
              }}
            >
              {/* User Info */}
              <div className="border-b border-[var(--color-border-default)] px-4 py-3">
                <p className="text-sm text-[var(--color-text-primary)]">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-xs text-[var(--color-text-placeholder)]">
                    {user.email}
                  </p>
                )}
              </div>

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 hover:bg-[var(--color-layer-02)]"
                onClick={() => onNavigate?.('/profile')}
              >
                <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Profile
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 hover:bg-[var(--color-layer-02)]"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-[var(--color-text-secondary)]" />
                ) : (
                  <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                )}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </DropdownMenuItem>

              {onLogout && (
                <>
                  <DropdownMenuSeparator className="bg-[var(--color-border-default)]" />
                  <DropdownMenuItem
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 hover:bg-[var(--color-layer-02)]"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 text-[var(--color-danger)]" />
                    <span className="text-sm text-[var(--color-danger)]">
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
}

TopBar.displayName = 'TopBar'
