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

export interface SidebarPromo {
  /** Promo message text */
  text: string
  /** Optional icon rendered before the text */
  icon?: React.ReactNode
  /** Action button rendered in the promo banner */
  action?: { label: string; href?: string; onClick?: () => void }
  /** When provided, renders a dismiss (X) button that calls this handler */
  onDismiss?: () => void
}

export interface SidebarFooterConfig {
  /** Legal/utility links rendered as a row separated by dividers */
  links?: Array<{ label: string; href: string }>
  /** Version or build info text (or link) rendered inline after links */
  version?: string | { label: string; href: string }
  /** Custom content rendered above the links row */
  slot?: React.ReactNode
  /** Promo/upsell banner rendered above the links row */
  promo?: SidebarPromo
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
  /** className applied to the wrapper div around preFooterSlot */
  preFooterClassName?: string
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

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

// -----------------------------------------------------------------------
// Shared styles
// -----------------------------------------------------------------------

const navItemBase = 'relative gap-ds-04 rounded-ds-lg px-ds-04 py-ds-03 transition-colors'
const navItemActive =
  "bg-accent-2 text-interactive after:absolute after:right-0 after:top-0 after:h-full after:w-ds-01 after:rounded-l-ds-full after:bg-accent-9 after:content-['']"
const navItemInactive = 'text-surface-fg-subtle hover:bg-surface-2 hover:text-surface-fg'

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
          {/* Button row — chevron is anchored here, not on the full <li> */}
          <div className="relative">
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
                className="absolute right-ds-02 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-2 hover:text-surface-fg group-data-[collapsible=icon]:hidden"
                aria-label={`Toggle ${item.title}`}
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-fast-02 ease-productive-standard group-data-[state=open]/collapsible:rotate-90" />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
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
      preFooterClassName,
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
          'z-raised hidden h-full flex-col border-r border-surface-border-strong bg-surface-1 md:flex',
          className,
        )}
      >
        {/* Logo Header */}
        <SidebarHeader className="px-ds-06 py-ds-06">
          {logo ?? (
            <span className="text-ds-lg font-semibold text-surface-fg">
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
              <AvatarFallback className="bg-surface-3 text-surface-fg">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-ds-md text-surface-fg">
                {user.name}
              </span>
              <span className="truncate text-ds-sm text-surface-fg-subtle">
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
                <SidebarGroupLabel className="px-ds-04 text-ds-sm text-surface-fg-subtle">
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
            <div className={preFooterClassName}>
              {preFooterSlot}
            </div>
          </>
        )}

        {/* Footer */}
        {footer ? (
          <SidebarFooter className="gap-ds-03 px-ds-06 py-ds-05">
            {footer.slot && <div>{footer.slot}</div>}

            {/* Promo banner */}
            {footer.promo && (
              <div className="relative rounded-ds-lg border border-surface-border bg-surface-2 p-ds-04">
                {footer.promo.onDismiss && (
                  <button
                    onClick={footer.promo.onDismiss}
                    aria-label="Dismiss"
                    className="absolute right-ds-02 top-ds-02 flex h-5 w-5 items-center justify-center rounded-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-3 hover:text-surface-fg"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="flex flex-col gap-ds-03">
                  {footer.promo.icon && (
                    <span className="text-interactive [&>svg]:h-ico-md [&>svg]:w-ico-md" aria-hidden="true">
                      {footer.promo.icon}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col gap-ds-03">
                    <p className="text-ds-sm text-surface-fg">{footer.promo.text}</p>
                    {footer.promo.action && (
                      footer.promo.action.href ? (
                        <Link
                          href={footer.promo.action.href}
                          onClick={footer.promo.action.onClick}
                          className="inline-flex self-start rounded-ds-md bg-accent-9 px-ds-04 py-ds-02 text-ds-sm font-medium text-accent-fg transition-colors hover:bg-accent-10"
                        >
                          {footer.promo.action.label}
                        </Link>
                      ) : (
                        <button
                          onClick={footer.promo.action.onClick}
                          className="inline-flex self-start rounded-ds-md bg-accent-9 px-ds-04 py-ds-02 text-ds-sm font-medium text-accent-fg transition-colors hover:bg-accent-10"
                        >
                          {footer.promo.action.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Links + version on same line */}
            {(footer.links?.length || footer.version) && (
              <div className="flex items-center gap-ds-03 text-ds-sm text-surface-fg-subtle">
                {footer.links?.map((link, i) => (
                  <React.Fragment key={link.href}>
                    {i > 0 && <span>·</span>}
                    <Link
                      className="transition-colors hover:text-interactive"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </React.Fragment>
                ))}
                {footer.links?.length && footer.version && <span>·</span>}
                {footer.version && (
                  typeof footer.version === 'string'
                    ? <span>{footer.version}</span>
                    : <Link className="transition-colors hover:text-interactive" href={footer.version.href}>{footer.version.label}</Link>
                )}
              </div>
            )}
          </SidebarFooter>
        ) : footerLinks.length > 0 ? (
          <SidebarFooter className="px-ds-06 py-ds-05">
            <div className="flex items-center gap-ds-03 text-ds-sm text-surface-fg-subtle">
              {footerLinks.map((link, i) => (
                <React.Fragment key={link.href}>
                  {i > 0 && <span>·</span>}
                  <Link
                    className="transition-colors hover:text-interactive"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
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
