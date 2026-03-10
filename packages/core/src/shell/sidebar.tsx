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
import * as React from 'react'
import { useLink } from './link-context'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '../ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface NavSubItem {
  title: string
  href: string
  icon?: React.ReactNode
  exact?: boolean
}

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  /** When true, the route matches only when the path is exactly equal */
  exact?: boolean
  /** Badge rendered on the right side of the nav item */
  badge?: string | number
  /** Optional child items — renders as collapsible sub-list with chevron */
  children?: NavSubItem[]
  /** Whether the collapsible is open by default. Auto-opens when a child is active. */
  defaultOpen?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
  /** Action rendered next to the group label (e.g., a "+" button) */
  action?: React.ReactNode
}

export interface SidebarUser {
  name: string
  email?: string
  image?: string | null
  designation?: string
  role?: string
}

export interface SidebarFooterConfig {
  /** Legal/utility links rendered as a row separated by dividers */
  links?: Array<{ label: string; href: string }>
  /** Version or build info text rendered below links */
  version?: string
  /** Custom content rendered above the links row */
  slot?: React.ReactNode
}

export interface AppSidebarProps
  extends React.HTMLAttributes<HTMLDivElement> {
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
  /** Structured footer config (takes precedence over footerLinks) */
  footer?: SidebarFooterConfig
  /** Content rendered between user header and navigation */
  headerSlot?: React.ReactNode
  /** Content rendered between navigation and footer */
  preFooterSlot?: React.ReactNode
  /** Override rendering for specific nav items. Return null to use default rendering. */
  renderItem?: (item: NavItem, defaultRender: () => React.ReactNode) => React.ReactNode | null
  /** Additional className for the root sidebar element */
  className?: string
}

// -----------------------------------------------------------------------
// ChevronRight (inline SVG icon for collapsible toggle)
// -----------------------------------------------------------------------

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// -----------------------------------------------------------------------
// Shared styles
// -----------------------------------------------------------------------

const navItemBase = 'relative gap-ds-04 rounded-ds-lg px-ds-04 py-ds-03 transition-colors'
const navItemActive =
  "bg-interactive-subtle text-interactive after:absolute after:right-0 after:top-0 after:h-full after:w-ds-01 after:rounded-l-ds-full after:bg-interactive after:content-['']"
const navItemInactive = 'text-text-helper hover:bg-layer-02 hover:text-text-primary'

// -----------------------------------------------------------------------
// NavLink (internal)
// -----------------------------------------------------------------------

function NavLink({
  item,
  isActive,
  isPathActive,
}: {
  item: NavItem
  isActive: boolean
  isPathActive: (path: string, exact?: boolean) => boolean
}) {
  const Link = useLink()
  const badgeContent =
    item.badge != null
      ? typeof item.badge === 'number' && item.badge > 99
        ? '99+'
        : String(item.badge)
      : null

  // S9: Collapsible children
  if (item.children && item.children.length > 0) {
    const hasActiveChild = item.children.some((child) =>
      isPathActive(child.href, child.exact),
    )
    const shouldOpen = hasActiveChild || isActive || (item.defaultOpen ?? false)

    return (
      <Collapsible defaultOpen={shouldOpen} className="group/collapsible">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive || hasActiveChild}
            tooltip={item.title}
            className={cn(
              navItemBase,
              isActive || hasActiveChild ? navItemActive : navItemInactive,
            )}
          >
            <Link
              href={item.href}
              aria-label={item.title}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-ds-base">{item.title}</span>
            </Link>
          </SidebarMenuButton>
          {badgeContent && <SidebarMenuBadge>{badgeContent}</SidebarMenuBadge>}
          <CollapsibleTrigger asChild>
            <button
              className="absolute right-ds-02 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-ds-md text-text-helper transition-transform hover:bg-layer-02 hover:text-text-primary group-data-[collapsible=icon]:hidden"
              aria-label={`Toggle ${item.title}`}
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => {
                const childActive = isPathActive(child.href, child.exact)
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={childActive}
                    >
                      <Link
                        href={child.href}
                        aria-current={childActive ? 'page' : undefined}
                      >
                        {child.icon && (
                          <span className="[&>svg]:h-ico-sm [&>svg]:w-ico-sm shrink-0" aria-hidden="true">
                            {child.icon}
                          </span>
                        )}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  // Default: flat nav item
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          navItemBase,
          isActive ? navItemActive : navItemInactive,
        )}
      >
        <Link
          href={item.href}
          aria-label={item.title}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="[&>svg]:h-ico-md [&>svg]:w-ico-md shrink-0" aria-hidden="true">{item.icon}</span>
          <span className="text-ds-base">{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {badgeContent && <SidebarMenuBadge>{badgeContent}</SidebarMenuBadge>}
    </SidebarMenuItem>
  )
}

// -----------------------------------------------------------------------
// AppSidebar
// -----------------------------------------------------------------------

const AppSidebar = React.forwardRef<HTMLDivElement, AppSidebarProps>(
  (
    {
      currentPath = '/',
      user,
      navGroups = [],
      logo,
      headerSlot,
      preFooterSlot,
      footerLinks = [],
      footer,
      renderItem,
      className,
      ...props
    },
    ref,
  ) => {
    const Link = useLink()
    const isActive = (path: string, exact = false) => {
      if (exact || path === '/') {
        return currentPath === path
      }
      return currentPath.startsWith(path)
    }

    return (
      <ShadcnSidebar
        {...props}
        ref={ref}
        aria-label="Main navigation"
        className={cn(
          'z-raised hidden h-full flex-col border-r border-border bg-layer-01 md:flex',
          className,
        )}
      >
        {/* Logo Header */}
        <SidebarHeader className="px-ds-06 py-ds-06">
          {logo ?? (
            <span className="text-ds-lg font-semibold text-text-primary">
              Logo
            </span>
          )}
        </SidebarHeader>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-ds-04 px-ds-06 pb-ds-05">
            <Avatar className="h-ds-sm-plus w-ds-sm-plus">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-layer-03 text-text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-ds-md text-text-primary">
                {user.name}
              </span>
              <span className="truncate text-ds-sm text-text-placeholder">
                {user.designation || user.role}
              </span>
            </div>
          </div>
        )}

        <SidebarSeparator />

        {/* Header Slot (S13) */}
        {headerSlot && (
          <>
            {headerSlot}
            <SidebarSeparator />
          </>
        )}

        {/* Navigation Groups */}
        <SidebarContent className="no-scrollbar px-ds-04">
          {navGroups.map((group, idx) => (
            <div key={group.label}>
              {idx > 0 && <SidebarSeparator />}
              <SidebarGroup>
                <SidebarGroupLabel className="px-ds-04 text-ds-sm text-text-placeholder">
                  {group.label}
                </SidebarGroupLabel>
                {group.action && (
                  <SidebarGroupAction asChild>{group.action}</SidebarGroupAction>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const defaultRender = () => (
                        <NavLink
                          item={item}
                          isActive={isActive(item.href, item.exact)}
                          isPathActive={isActive}
                        />
                      )

                      if (renderItem) {
                        const custom = renderItem(item, defaultRender)
                        if (custom !== null) {
                          return <React.Fragment key={item.href}>{custom}</React.Fragment>
                        }
                      }

                      return <React.Fragment key={item.href}>{defaultRender()}</React.Fragment>
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          ))}
        </SidebarContent>

        {/* Pre-Footer Slot (S13) */}
        {preFooterSlot && (
          <>
            <SidebarSeparator />
            {preFooterSlot}
          </>
        )}

        {/* Footer */}
        {footer ? (
          <SidebarFooter className="px-ds-06 py-ds-05">
            {footer.slot && (
              <div className="pb-ds-04">
                {footer.slot}
              </div>
            )}
            {footer.links && footer.links.length > 0 && (
              <div className="flex items-center justify-start gap-ds-03">
                {footer.links.map((link, i) => (
                  <div key={link.href} className="flex items-center gap-ds-03">
                    {i > 0 && <span className="text-text-placeholder">·</span>}
                    <Link
                      className="text-ds-sm text-text-placeholder transition-colors hover:text-interactive"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {footer.version && (
              <p className="text-center text-ds-sm text-text-placeholder">
                {footer.version}
              </p>
            )}
          </SidebarFooter>
        ) : footerLinks.length > 0 ? (
          <SidebarFooter className="px-ds-06 py-ds-05">
            <div className="flex items-center justify-start gap-ds-03">
              {footerLinks.map((link, i) => (
                <div key={link.href} className="flex items-center gap-ds-03">
                  {i > 0 && (
                    <div className="h-[16px] w-px bg-border" />
                  )}
                  <Link
                    className="text-ds-md text-text-placeholder transition-colors hover:text-interactive"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </SidebarFooter>
        ) : null}
      </ShadcnSidebar>
    )
  },
)
AppSidebar.displayName = 'AppSidebar'

export { AppSidebar }
