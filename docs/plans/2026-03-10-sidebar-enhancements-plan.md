# AppSidebar Enhancements (S9–S14) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add collapsible nav children, badges, group actions, structured footer, content slots, and renderItem to AppSidebar — all using existing sidebar primitives.

**Architecture:** Extend the existing `AppSidebar` shell component (~224 lines) with 6 additive features. All use primitives already exported from `ui/sidebar` and `ui/collapsible`. No new files except a test file. TDD approach.

**Tech Stack:** React 18, TypeScript, Vitest + RTL, Tailwind, CVA, Radix Collapsible (vendored)

---

### Task 1: Setup — Test file scaffold and new imports

**Files:**
- Create: `packages/core/src/shell/sidebar.test.tsx`
- Modify: `packages/core/src/shell/sidebar.tsx:14-29` (add imports)

**Step 1: Create test file with helpers**

```tsx
// packages/core/src/shell/sidebar.test.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AppSidebar } from './sidebar'
import { SidebarProvider } from '../ui/sidebar'
import type { NavGroup, NavItem } from './sidebar'

// AppSidebar must be wrapped in SidebarProvider
function renderSidebar(props: React.ComponentProps<typeof AppSidebar>) {
  return render(
    <SidebarProvider defaultOpen>
      <AppSidebar {...props} />
    </SidebarProvider>,
  )
}

// Minimal icon stub
const TestIcon = () => <svg data-testid="icon" />

describe('AppSidebar', () => {
  it('renders nav groups', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it passes**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS (1 test)

**Step 3: Add new imports to sidebar.tsx**

In `packages/core/src/shell/sidebar.tsx`, add these to the existing ui/sidebar import:

```ts
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,      // NEW — S11
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,        // NEW — S10
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,          // NEW — S9
  SidebarMenuSubButton,    // NEW — S9
  SidebarMenuSubItem,      // NEW — S9
  SidebarSeparator,
} from '../ui/sidebar'
```

Add Collapsible import:

```ts
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
```

**Step 4: Run typecheck**

Run: `cd packages/core && pnpm tsc --noEmit`
Expected: PASS (imports are valid, no usage yet)

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.test.tsx packages/core/src/shell/sidebar.tsx
git commit -m "feat(shell): scaffold sidebar tests and add new primitive imports"
```

---

### Task 2: S13 — Named content slots (headerSlot, preFooterSlot)

Starting with S13 because it's the simplest structural change and validates the test setup.

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (types + render)
- Modify: `packages/core/src/shell/sidebar.test.tsx` (tests)

**Step 1: Write failing tests**

```tsx
describe('S13 — content slots', () => {
  const baseProps = {
    navGroups: [
      {
        label: 'Main',
        items: [{ title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true }],
      },
    ],
  }

  it('renders headerSlot between user info and navigation', () => {
    renderSidebar({
      ...baseProps,
      user: { name: 'Test User' },
      headerSlot: <div data-testid="header-slot">Widget</div>,
    })
    expect(screen.getByTestId('header-slot')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('renders preFooterSlot between navigation and footer', () => {
    renderSidebar({
      ...baseProps,
      preFooterSlot: <div data-testid="pre-footer-slot">Banner</div>,
      footerLinks: [{ label: 'Terms', href: '/terms' }],
    })
    expect(screen.getByTestId('pre-footer-slot')).toBeInTheDocument()
    expect(screen.getByText('Banner')).toBeInTheDocument()
  })

  it('does not render extra DOM when slots are not provided', () => {
    const { container } = renderSidebar(baseProps)
    expect(container.querySelector('[data-testid="header-slot"]')).toBeNull()
    expect(container.querySelector('[data-testid="pre-footer-slot"]')).toBeNull()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL — `headerSlot` and `preFooterSlot` props not recognized

**Step 3: Implement S13**

In `packages/core/src/shell/sidebar.tsx`:

1. Add props to `AppSidebarProps`:

```ts
export interface AppSidebarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentPath?: string
  user?: SidebarUser | null
  navGroups?: NavGroup[]
  logo?: React.ReactNode
  footerLinks?: Array<{ label: string; href: string }>
  className?: string
  /** Content rendered between user header and navigation */
  headerSlot?: React.ReactNode
  /** Content rendered between navigation and footer */
  preFooterSlot?: React.ReactNode
}
```

2. Destructure in component:

```ts
const AppSidebar = React.forwardRef<HTMLDivElement, AppSidebarProps>(
  (
    {
      currentPath = '/',
      user,
      navGroups = [],
      logo,
      footerLinks = [],
      className,
      headerSlot,
      preFooterSlot,
      ...props
    },
    ref,
  ) => {
```

3. Render `headerSlot` after the separator following user info (line ~170):

```tsx
<SidebarSeparator />

{/* Header Slot (S13) */}
{headerSlot && (
  <>
    {headerSlot}
    <SidebarSeparator />
  </>
)}
```

4. Render `preFooterSlot` after `</SidebarContent>` and before the footer:

```tsx
</SidebarContent>

{/* Pre-Footer Slot (S13) */}
{preFooterSlot && (
  <>
    <SidebarSeparator />
    {preFooterSlot}
  </>
)}

{/* Footer */}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add headerSlot and preFooterSlot content slots (S13)"
```

---

### Task 3: S10 — Nav item badge

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (NavItem type + NavLink render)
- Modify: `packages/core/src/shell/sidebar.test.tsx`

**Step 1: Write failing tests**

```tsx
describe('S10 — badge', () => {
  it('renders a numeric badge on a nav item', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'My Tasks', href: '/tasks', icon: <TestIcon />, badge: 5 },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders a string badge on a nav item', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Messages', href: '/messages', icon: <TestIcon />, badge: 'New' },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('caps numeric badges at 99+', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Inbox', href: '/inbox', icon: <TestIcon />, badge: 150 },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not render badge when not provided', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
      },
    ]
    const { container } = renderSidebar({ navGroups: groups })
    expect(container.querySelector('[data-sidebar="menu-badge"]')).toBeNull()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL

**Step 3: Implement S10**

1. Extend `NavItem` type:

```ts
export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  exact?: boolean
  /** Badge rendered on the right side of the nav item */
  badge?: string | number
}
```

2. In the `NavLink` component, add badge rendering after `SidebarMenuButton`:

```tsx
function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Link = useLink()
  const badgeContent =
    item.badge != null
      ? typeof item.badge === 'number' && item.badge > 99
        ? '99+'
        : String(item.badge)
      : null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'relative gap-ds-04 rounded-ds-lg px-ds-04 py-ds-03 transition-colors',
          isActive
            ? "bg-interactive-subtle text-interactive after:absolute after:right-0 after:top-0 after:h-full after:w-ds-01 after:rounded-l-ds-full after:bg-interactive after:content-['']"
            : 'text-text-helper hover:bg-layer-02 hover:text-text-primary',
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
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add nav item badge support (S10)"
```

---

### Task 4: S11 — Nav group action button

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (NavGroup type + render)
- Modify: `packages/core/src/shell/sidebar.test.tsx`

**Step 1: Write failing tests**

```tsx
describe('S11 — group action', () => {
  it('renders an action button next to the group label', () => {
    const groups: NavGroup[] = [
      {
        label: 'Projects',
        items: [{ title: 'All', href: '/projects', icon: <TestIcon /> }],
        action: <button aria-label="New project" data-testid="group-action">+</button>,
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByTestId('group-action')).toBeInTheDocument()
  })

  it('does not render group action when not provided', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
      },
    ]
    const { container } = renderSidebar({ navGroups: groups })
    expect(container.querySelector('[data-sidebar="group-action"]')).toBeNull()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL

**Step 3: Implement S11**

1. Extend `NavGroup` type:

```ts
export interface NavGroup {
  label: string
  items: NavItem[]
  /** Action rendered next to the group label (e.g., a "+" button) */
  action?: React.ReactNode
}
```

2. In the navGroups render loop, add `SidebarGroupAction` after `SidebarGroupLabel`:

```tsx
<SidebarGroup>
  <SidebarGroupLabel className="px-ds-04 text-ds-sm text-text-placeholder">
    {group.label}
  </SidebarGroupLabel>
  {group.action && (
    <SidebarGroupAction asChild>{group.action}</SidebarGroupAction>
  )}
  <SidebarGroupContent>
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add nav group action button (S11)"
```

---

### Task 5: S12 — Structured sidebar footer

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (types + footer render)
- Modify: `packages/core/src/shell/sidebar.test.tsx`

**Step 1: Write failing tests**

```tsx
describe('S12 — structured footer', () => {
  const baseGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
    },
  ]

  it('renders footer with links separated by dividers', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: {
        links: [
          { label: 'Terms', href: '/terms' },
          { label: 'Privacy', href: '/privacy' },
        ],
      },
    })
    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
  })

  it('renders footer version text', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: { version: 'v2.4.1' },
    })
    expect(screen.getByText('v2.4.1')).toBeInTheDocument()
  })

  it('renders footer slot content', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: {
        slot: <div data-testid="footer-slot">What's new?</div>,
        links: [{ label: 'Terms', href: '/terms' }],
      },
    })
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument()
  })

  it('prefers footer over footerLinks when both provided', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: { version: 'v1.0' },
      footerLinks: [{ label: 'Old', href: '/old' }],
    })
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    expect(screen.queryByText('Old')).toBeNull()
  })

  it('falls back to footerLinks when footer is not provided', () => {
    renderSidebar({
      navGroups: baseGroups,
      footerLinks: [{ label: 'Help', href: '/help' }],
    })
    expect(screen.getByText('Help')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL

**Step 3: Implement S12**

1. Add types:

```ts
export interface SidebarFooterConfig {
  /** Legal/utility links rendered as a row separated by dividers */
  links?: Array<{ label: string; href: string }>
  /** Version or build info text rendered below links */
  version?: string
  /** Custom content rendered above the links row */
  slot?: React.ReactNode
}
```

2. Add `footer` prop to `AppSidebarProps`:

```ts
/** @deprecated Use footer.links instead */
footerLinks?: Array<{ label: string; href: string }>
/** Structured footer config */
footer?: SidebarFooterConfig
```

3. Destructure `footer` in the component.

4. Replace the footer render section:

```tsx
{/* Footer */}
{footer ? (
  <SidebarFooter className="px-ds-06 py-ds-05">
    {footer.slot && (
      <div className="border-t border-border pb-ds-04 pt-ds-04">
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
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add structured sidebar footer (S12)"
```

---

### Task 6: S9 — Collapsible nav items with children

This is the largest feature. We add `children` and `defaultOpen` to `NavItem`, and a `NavSubItem` type.

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (types + NavLink conditional branch)
- Modify: `packages/core/src/shell/sidebar.test.tsx`

**Step 1: Write failing tests**

```tsx
describe('S9 — collapsible nav items', () => {
  const makeGroups = (items: NavItem[]): NavGroup[] => [
    { label: 'Work', items },
  ]

  it('renders child items when parent has children', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
          { title: 'Website', href: '/projects/def/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects' })
    // Children should exist in the DOM (collapsible may be open since parent is active)
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('auto-expands when a child href matches currentPath', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
          { title: 'Website', href: '/projects/def/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects/abc/board' })
    expect(screen.getByText('Karm V2')).toBeVisible()
  })

  it('renders a chevron toggle button', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects' })
    const chevron = screen.getByRole('button', { name: /toggle projects/i })
    expect(chevron).toBeInTheDocument()
  })

  it('toggles children visibility on chevron click', async () => {
    const user = userEvent.setup()
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        defaultOpen: false,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/' })
    const chevron = screen.getByRole('button', { name: /toggle projects/i })

    // Click to open
    await user.click(chevron)
    expect(screen.getByText('Karm V2')).toBeVisible()
  })

  it('parent link still navigates to href', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/' })
    const link = screen.getByRole('link', { name: /projects/i })
    expect(link).toHaveAttribute('href', '/projects')
  })

  it('renders nav items without children normally', () => {
    const groups = makeGroups([
      { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/' })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL

**Step 3: Implement S9**

1. Add types:

```ts
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
  exact?: boolean
  badge?: string | number
  /** Optional child items — renders as collapsible sub-list with chevron */
  children?: NavSubItem[]
  /** Whether the collapsible is open by default. Auto-opens when a child is active. */
  defaultOpen?: boolean
}
```

2. Add a chevron icon (inline SVG to avoid external dep):

```tsx
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
```

3. Update `NavLink` to accept `isChildActive` and `isActive` helper:

```tsx
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
    const shouldOpen = item.defaultOpen ?? (isActive || hasActiveChild)

    return (
      <Collapsible defaultOpen={shouldOpen} className="group/collapsible">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive || hasActiveChild}
            tooltip={item.title}
            className={cn(
              'relative gap-ds-04 rounded-ds-lg px-ds-04 py-ds-03 transition-colors',
              isActive || hasActiveChild
                ? "bg-interactive-subtle text-interactive after:absolute after:right-0 after:top-0 after:h-full after:w-ds-01 after:rounded-l-ds-full after:bg-interactive after:content-['']"
                : 'text-text-helper hover:bg-layer-02 hover:text-text-primary',
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

  // Default: flat nav item (unchanged)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'relative gap-ds-04 rounded-ds-lg px-ds-04 py-ds-03 transition-colors',
          isActive
            ? "bg-interactive-subtle text-interactive after:absolute after:right-0 after:top-0 after:h-full after:w-ds-01 after:rounded-l-ds-full after:bg-interactive after:content-['']"
            : 'text-text-helper hover:bg-layer-02 hover:text-text-primary',
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
```

4. Update the render call site to pass `isPathActive`:

```tsx
{group.items.map((item) => (
  <NavLink
    key={item.href}
    item={item}
    isActive={isActive(item.href, item.exact)}
    isPathActive={isActive}
  />
))}
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add collapsible nav items with children (S9)"
```

---

### Task 7: S14 — renderItem escape hatch

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx`
- Modify: `packages/core/src/shell/sidebar.test.tsx`

**Step 1: Write failing tests**

```tsx
describe('S14 — renderItem', () => {
  it('uses custom render when renderItem returns a ReactNode', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
          { title: 'Tasks', href: '/tasks', icon: <TestIcon /> },
        ],
      },
    ]
    renderSidebar({
      navGroups: groups,
      renderItem: (item, defaultRender) => {
        if (item.href === '/tasks') {
          return <div data-testid="custom-tasks">Custom: {item.title}</div>
        }
        return null
      },
    })
    expect(screen.getByTestId('custom-tasks')).toBeInTheDocument()
    expect(screen.getByText('Custom: Tasks')).toBeInTheDocument()
    // Dashboard should render with default
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('uses default render when renderItem returns null', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Home', href: '/', icon: <TestIcon />, exact: true },
        ],
      },
    ]
    renderSidebar({
      navGroups: groups,
      renderItem: () => null,
    })
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: FAIL

**Step 3: Implement S14**

1. Add prop to `AppSidebarProps`:

```ts
/** Override rendering for specific nav items. Return null to use default rendering. */
renderItem?: (item: NavItem, defaultRender: () => React.ReactNode) => React.ReactNode | null
```

2. Destructure `renderItem` in the component.

3. In the navGroups render loop, wrap the NavLink call:

```tsx
{group.items.map((item) => {
  const defaultRender = () => (
    <NavLink
      key={item.href}
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

  return defaultRender()
})}
```

**Step 4: Run tests**

Run: `cd packages/core && pnpm vitest run src/shell/sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx packages/core/src/shell/sidebar.test.tsx
git commit -m "feat(shell): add renderItem escape hatch (S14)"
```

---

### Task 8: Stories for all new features

**Files:**
- Modify: `packages/core/src/shell/sidebar.stories.tsx`

**Step 1: Add stories**

Add to `packages/core/src/shell/sidebar.stories.tsx`:

```tsx
// Import new types
import type { NavGroup, NavItem, SidebarUser, SidebarFooterConfig } from './sidebar'

// Add after existing mock data:
const navGroupWithChildren: NavGroup = {
  label: 'Work',
  items: [
    { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard />, exact: true },
    { title: 'My Tasks', href: '/my-tasks', icon: <IconListCheck />, badge: 5 },
    {
      title: 'Projects',
      href: '/projects',
      icon: <IconLayoutKanban />,
      children: [
        { title: 'Karm V2', href: '/projects/abc/board' },
        { title: 'Website Redesign', href: '/projects/def/board' },
        { title: 'Design System', href: '/projects/ghi/board' },
      ],
    },
  ],
}

const navGroupWithAction: NavGroup = {
  label: 'Projects',
  items: [
    { title: 'All Projects', href: '/projects', icon: <IconLayoutKanban /> },
  ],
  action: <button aria-label="New project"><IconUserPlus size={14} /></button>,
}

// Stories:

export const CollapsibleChildren: Story = {
  args: {
    currentPath: '/projects/abc/board',
    user: mockUser,
    navGroups: [navGroupWithChildren, secondaryNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const WithBadges: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard />, exact: true },
          { title: 'My Tasks', href: '/my-tasks', icon: <IconListCheck />, badge: 12 },
          { title: 'Messages', href: '/messages', icon: <IconBook />, badge: 'New' },
          { title: 'Inbox', href: '/inbox', icon: <IconCalendarCheck />, badge: 150 },
        ],
      },
    ],
    footerLinks: mockFooterLinks,
  },
}

export const WithGroupAction: Story = {
  args: {
    currentPath: '/projects',
    user: mockUser,
    navGroups: [navGroupWithAction],
    footerLinks: mockFooterLinks,
  },
}

export const StructuredFooter: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup],
    footer: {
      slot: (
        <a href="/changelog" className="text-ds-sm text-text-placeholder hover:text-interactive">
          What's new in v2.4?
        </a>
      ),
      links: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy-policy' },
      ],
      version: 'v2.4.1',
    },
  },
}

export const WithHeaderSlot: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    headerSlot: (
      <div className="flex items-center gap-ds-03 rounded-ds-lg bg-layer-02 px-ds-04 py-ds-05">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-ds-sm text-text-primary">Online — 9:42 AM</span>
      </div>
    ),
    footerLinks: mockFooterLinks,
  },
}

export const AllFeatures: Story = {
  args: {
    currentPath: '/projects/abc/board',
    user: mockUser,
    navGroups: [navGroupWithChildren, secondaryNavGroup],
    headerSlot: (
      <div className="flex items-center gap-ds-03 rounded-ds-lg bg-layer-02 px-ds-04 py-ds-05">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-ds-sm text-text-primary">Online — 9:42 AM</span>
      </div>
    ),
    preFooterSlot: (
      <div className="px-ds-04 py-ds-03">
        <div className="rounded-ds-lg bg-layer-02 px-ds-04 py-ds-03 text-ds-sm text-text-placeholder">
          Upgrade to Pro for unlimited projects
        </div>
      </div>
    ),
    footer: {
      links: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' },
      ],
      version: 'v2.4.1',
    },
  },
}
```

**Step 2: Build to verify no errors**

Run: `cd packages/core && pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/core/src/shell/sidebar.stories.tsx
git commit -m "feat(shell): add stories for all sidebar enhancements (S9-S14)"
```

---

### Task 9: Export new types and update docs

**Files:**
- Modify: `packages/core/src/shell/sidebar.tsx` (ensure exports)
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`
- Modify: `CHANGELOG.md`

**Step 1: Verify type exports**

Ensure `packages/core/src/shell/sidebar.tsx` exports all new types:

```ts
export { AppSidebar }
export type { AppSidebarProps, NavItem, NavSubItem, NavGroup, SidebarUser, SidebarFooterConfig }
```

**Step 2: Update llms.txt**

Add to the AppSidebar section in `packages/core/llms.txt`:

```
### AppSidebar (v0.10.0 additions)
- NavItem.children?: NavSubItem[] — collapsible sub-list with chevron toggle
- NavItem.badge?: string | number — badge on nav item (99+ cap for numbers)
- NavGroup.action?: ReactNode — action button next to group label
- footer?: { links?, version?, slot? } — structured footer (replaces footerLinks)
- headerSlot?: ReactNode — content between user info and navigation
- preFooterSlot?: ReactNode — content between navigation and footer
- renderItem?: (item, defaultRender) => ReactNode | null — custom item rendering
```

**Step 3: Update llms-full.txt**

Add detailed per-feature documentation to the AppSidebar section in `packages/core/llms-full.txt`. Include code examples matching the feature request doc.

**Step 4: Update CHANGELOG.md**

Add 0.10.0 entry:

```markdown
## [0.10.0] - 2026-03-10

### Added
- **AppSidebar**: Collapsible nav items with `children` array (S9)
- **AppSidebar**: Nav item `badge` prop for counts/labels (S10)
- **AppSidebar**: Nav group `action` prop for buttons next to labels (S11)
- **AppSidebar**: Structured `footer` prop with links, version, and slot (S12)
- **AppSidebar**: `headerSlot` and `preFooterSlot` content slots (S13)
- **AppSidebar**: `renderItem` escape hatch for custom item rendering (S14)

### Deprecated
- **AppSidebar**: `footerLinks` prop — use `footer.links` instead
```

**Step 5: Commit**

```bash
git add packages/core/src/shell/sidebar.tsx CHANGELOG.md packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: update exports, llms.txt, and changelog for 0.10.0"
```

---

### Task 10: Final verification

**Step 1: Run full test suite**

Run: `cd packages/core && pnpm test`
Expected: All tests pass (existing + new)

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 3: Build**

Run: `pnpm build`
Expected: PASS

**Step 4: Verify Storybook compiles**

Run: `cd packages/core && pnpm storybook --smoke-test` (or just build storybook)
Expected: No errors

**Step 5: Final commit if any fixes needed**

If any fixes were needed, commit them.
