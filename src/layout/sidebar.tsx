'use client'

/**
 * AppSidebar -- Application-layer sidebar built on the Sidebar primitive.
 *
 * Design-system token migration (2026-02-28):
 *   All V1 colour tokens have been replaced with semantic design-system tokens.
 *   Typography classes replaced with Tailwind equivalents.
 *
 * Props-driven: accepts user info, currentPath, and navItems instead of
 * reading from Remix hooks or Zustand stores.
 */
import Link from 'next/link'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface SidebarUser {
  name: string
  email?: string
  image?: string | null
  designation?: string
  role?: string
}

export interface AppSidebarProps {
  /** Currently active pathname -- used to highlight the active nav item */
  currentPath?: string
  /** User information displayed in the sidebar header */
  user?: SidebarUser | null
  /** Primary navigation groups rendered in the main content area */
  navGroups?: NavGroup[]
  /** Optional logo element. Falls back to a text placeholder. */
  logo?: React.ReactNode
  /** Footer links rendered at the bottom of the sidebar */
  footerLinks?: Array<{ label: string; href: string }>
  /** Additional className for the root sidebar element */
  className?: string
}

// -----------------------------------------------------------------------
// NavLink (internal)
// -----------------------------------------------------------------------

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'relative gap-3 rounded-lg px-3 py-2.5 transition-all',
          isActive
            ? "bg-[var(--color-interactive-subtle)] text-[var(--color-interactive)] after:absolute after:right-0 after:top-0 after:h-full after:w-0.5 after:rounded-l-full after:bg-[var(--color-interactive)] after:content-['']"
            : 'text-[var(--color-text-helper)] hover:bg-[var(--color-layer-02)] hover:text-[var(--color-text-primary)]',
        )}
      >
        <Link
          href={item.href}
          aria-label={item.title}
          aria-current={isActive ? 'page' : undefined}
        >
          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-base">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// -----------------------------------------------------------------------
// AppSidebar
// -----------------------------------------------------------------------

export default function AppSidebar({
  currentPath = '/',
  user,
  navGroups = [],
  logo,
  footerLinks = [],
  className,
}: AppSidebarProps) {
  const isActive = (path: string, exact = false) => {
    if (exact || path === '/') {
      return currentPath === path
    }
    return currentPath.startsWith(path)
  }

  return (
    <ShadcnSidebar
      aria-label="Main navigation"
      className={cn(
        'z-10 hidden h-full flex-col border-r border-[var(--color-border-default)] bg-[var(--color-layer-01)] md:flex',
        className,
      )}
    >
      {/* Logo Header */}
      <SidebarHeader className="px-6 py-6">
        {logo ?? (
          <span className="text-lg font-semibold text-[var(--color-text-primary)]">
            Logo
          </span>
        )}
      </SidebarHeader>

      {/* User Info */}
      {user && (
        <div className="flex items-center gap-3 px-6 pb-4">
          <Avatar className="h-9 w-9">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-[var(--color-layer-03)] text-[var(--color-text-primary)]">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-[var(--color-text-primary)]">
              {user.name}
            </span>
            <span className="truncate text-xs text-[var(--color-text-placeholder)]">
              {user.designation || user.role}
            </span>
          </div>
        </div>
      )}

      <SidebarSeparator />

      {/* Navigation Groups */}
      <SidebarContent className="no-scrollbar px-3">
        {navGroups.map((group, idx) => (
          <div key={group.label}>
            {idx > 0 && <SidebarSeparator />}
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-xs text-[var(--color-text-placeholder)]">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive(item.href, item.exact)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
      </SidebarContent>

      {/* Footer */}
      {footerLinks.length > 0 && (
        <SidebarFooter className="px-6 py-4">
          <div className="flex items-center justify-start gap-2">
            {footerLinks.map((link, i) => (
              <div key={link.href} className="flex items-center gap-2">
                {i > 0 && (
                  <div className="h-4 w-px bg-[var(--color-border-default)]" />
                )}
                <Link
                  className="text-sm text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-interactive)]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </SidebarFooter>
      )}
    </ShadcnSidebar>
  )
}

AppSidebar.displayName = 'AppSidebar'
