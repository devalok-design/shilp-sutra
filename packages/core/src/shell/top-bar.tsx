'use client'

/**
 * TopBar v2 — Composition-based application top bar.
 *
 * Subcomponents: TopBar.Left, TopBar.Center, TopBar.Right,
 * TopBar.Section, TopBar.IconButton, TopBar.Title, TopBar.UserMenu.
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
import { IconLogout, IconUser, IconMoon, IconSun } from '@tabler/icons-react'
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

// -----------------------------------------------------------------------
// TopBar (root)
// -----------------------------------------------------------------------

interface TopBarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const TopBarRoot = React.forwardRef<HTMLDivElement, TopBarRootProps>(
  ({ className, children, ...props }, ref) => {
    // Detect if a Center zone is present to switch to grid layout
    const hasCenter = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === TopBarCenter,
    )

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'z-sticky w-full border-b border-surface-border-strong bg-surface-2 px-ds-05 py-ds-04 md:px-ds-06',
          hasCenter
            ? 'grid grid-cols-[1fr_auto_1fr] items-center'
            : 'flex items-center',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)
TopBarRoot.displayName = 'TopBar'

// -----------------------------------------------------------------------
// TopBar.Left
// -----------------------------------------------------------------------

interface TopBarLeftProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TopBarLeft = React.forwardRef<HTMLDivElement, TopBarLeftProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-ds-04', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
TopBarLeft.displayName = 'TopBar.Left'

// -----------------------------------------------------------------------
// TopBar.Center
// -----------------------------------------------------------------------

interface TopBarCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TopBarCenter = React.forwardRef<HTMLDivElement, TopBarCenterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-center px-ds-04', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
TopBarCenter.displayName = 'TopBar.Center'

// -----------------------------------------------------------------------
// TopBar.Right
// -----------------------------------------------------------------------

interface TopBarRightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TopBarRight = React.forwardRef<HTMLDivElement, TopBarRightProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('ml-auto flex items-center gap-ds-04', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
TopBarRight.displayName = 'TopBar.Right'

// -----------------------------------------------------------------------
// TopBar.Section
// -----------------------------------------------------------------------

const gapMap = {
  tight: 'gap-ds-02',
  default: 'gap-ds-04',
  loose: 'gap-ds-06',
} as const

interface TopBarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof gapMap
  children: React.ReactNode
}

const TopBarSection = React.forwardRef<HTMLDivElement, TopBarSectionProps>(
  ({ gap = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center', gapMap[gap], className)}
      {...props}
    >
      {children}
    </div>
  ),
)
TopBarSection.displayName = 'TopBar.Section'

// -----------------------------------------------------------------------
// TopBar.IconButton
// -----------------------------------------------------------------------

interface TopBarIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  tooltip: string
}

const TopBarIconButton = React.forwardRef<
  HTMLButtonElement,
  TopBarIconButtonProps
>(({ icon, tooltip, className, ...props }, ref) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-ds-sm-plus w-ds-sm-plus items-center justify-center rounded-ds-full border border-surface-border-strong bg-surface-3 text-surface-fg-muted transition-colors hover:bg-surface-4',
          className,
        )}
        {...props}
      >
        <span className="[&>svg]:h-ico-sm [&>svg]:w-ico-sm" aria-hidden="true">
          {icon}
        </span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" align="center">
      {tooltip}
    </TooltipContent>
  </Tooltip>
))
TopBarIconButton.displayName = 'TopBar.IconButton'

// -----------------------------------------------------------------------
// TopBar.Title
// -----------------------------------------------------------------------

interface TopBarTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const TopBarTitle = React.forwardRef<HTMLHeadingElement, TopBarTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'hidden text-ds-lg text-surface-fg md:block',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
)
TopBarTitle.displayName = 'TopBar.Title'

// -----------------------------------------------------------------------
// TopBar.UserMenu
// -----------------------------------------------------------------------

interface TopBarUserMenuProps {
  user: TopBarUser
  onNavigate?: (path: string) => void
  onLogout?: () => void
  userMenuItems?: UserMenuItem[]
  className?: string
}

const TopBarUserMenu = React.forwardRef<HTMLButtonElement, TopBarUserMenuProps>(
  ({ user, onNavigate, onLogout, userMenuItems, className }, ref) => {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                ref={ref}
                type="button"
                className={cn('flex items-center gap-ds-03 outline-none', className)}
              >
                <Avatar className="h-ds-sm-plus w-ds-sm-plus cursor-pointer">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-surface-3 text-surface-fg">
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
            <p className="text-ds-md text-surface-fg">{user.name}</p>
            {user.email && (
              <p className="text-ds-sm text-surface-fg-subtle">{user.email}</p>
            )}
          </div>

          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2"
            onClick={() => onNavigate?.('/profile')}
          >
            <IconUser className="h-ico-sm w-ico-sm text-surface-fg-muted" />
            <span className="text-ds-md text-surface-fg-muted">Profile</span>
          </DropdownMenuItem>

          {/* Custom user menu items */}
          {userMenuItems?.map((item, index) => {
            const colorMap: Record<string, string> = {
              error: 'text-error-11',
              success: 'text-success-11',
              warning: 'text-warning-11',
              info: 'text-info-11',
            }
            const textColor = item.color
              ? (colorMap[item.color] ?? 'text-surface-fg-muted')
              : 'text-surface-fg-muted'
            return (
              <React.Fragment key={item.label + index}>
                {item.separator && (
                  <DropdownMenuSeparator className="bg-surface-border" />
                )}
                <DropdownMenuItem
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2',
                    item.disabled && 'pointer-events-none opacity-action-disabled',
                  )}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return
                    if (item.onClick) item.onClick()
                    else if (item.href) onNavigate?.(item.href)
                  }}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        '[&>svg]:h-ico-sm [&>svg]:w-ico-sm',
                        textColor,
                      )}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className={cn('text-ds-md', textColor)}>
                    {item.label}
                  </span>
                  {item.badge != null &&
                    item.badge !== false &&
                    (typeof item.badge === 'string' ? (
                      <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-ds-full bg-error-9 px-ds-02 text-[10px] font-semibold leading-none text-accent-fg">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="ml-auto h-[8px] w-[8px] rounded-ds-full bg-error-9" />
                    ))}
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
              <DropdownMenuSeparator className="bg-surface-border" />
              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-ds-03 px-ds-05 py-ds-04 hover:bg-surface-2"
                onClick={onLogout}
              >
                <IconLogout className="h-ico-sm w-ico-sm text-error-11" />
                <span className="text-ds-md text-error-11">Logout</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)
TopBarUserMenu.displayName = 'TopBar.UserMenu'

// -----------------------------------------------------------------------
// Compound export
// -----------------------------------------------------------------------

export type TopBarProps = TopBarRootProps

const TopBar = Object.assign(TopBarRoot, {
  Left: TopBarLeft,
  Center: TopBarCenter,
  Right: TopBarRight,
  Section: TopBarSection,
  IconButton: TopBarIconButton,
  Title: TopBarTitle,
  UserMenu: TopBarUserMenu,
})

export { TopBar }
