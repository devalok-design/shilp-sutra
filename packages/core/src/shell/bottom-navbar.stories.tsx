import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { BottomNavbar } from './bottom-navbar'
import { LinkProvider } from './link-context'
import {
  IconLayoutDashboard,
  IconCalendarCheck,
  IconUmbrella,
  IconLayoutKanban,
  IconListCheck,
  IconBook,
  IconAdjustmentsHorizontal,
  IconUserCircle,
  IconShieldCheck,
  IconSettings,
  IconHome,
  IconHomeFilled,
  IconBell,
  IconBellFilled,
  IconMessage,
  IconMessageFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'
import type { BottomNavItem, BottomNavbarUser } from './bottom-navbar'

const filledItems: BottomNavItem[] = [
  { title: 'Home', href: '/', icon: <IconHome />, activeIcon: <IconHomeFilled />, exact: true },
  { title: 'Messages', href: '/messages', icon: <IconMessage />, activeIcon: <IconMessageFilled />, badge: 3 },
  { title: 'Alerts', href: '/alerts', icon: <IconBell />, activeIcon: <IconBellFilled /> },
  { title: 'Profile', href: '/profile', icon: <IconUser />, activeIcon: <IconUserFilled /> },
]

// ── Mock Data ────────────────────────────────────────────────

const mockUser: BottomNavbarUser = {
  name: 'Aarav Sharma',
  role: 'Admin',
}

const associateUser: BottomNavbarUser = {
  name: 'Priya Mehta',
  role: 'Associate',
}

const primaryItems: BottomNavItem[] = [
  { title: 'Home', href: '/', icon: <IconLayoutDashboard />, exact: true },
  { title: 'Attendance', href: '/attendance', icon: <IconCalendarCheck /> },
  { title: 'Projects', href: '/projects', icon: <IconLayoutKanban /> },
  { title: 'Tasks', href: '/my-tasks', icon: <IconListCheck /> },
]

const moreItems: BottomNavItem[] = [
  { title: 'Breaks', href: '/breaks', icon: <IconUmbrella /> },
  { title: 'Devsabha', href: '/devsabha', icon: <IconBook /> },
  { title: 'Adjustments', href: '/adjustments', icon: <IconAdjustmentsHorizontal /> },
  { title: 'Profile', href: '/profile', icon: <IconUserCircle /> },
  // Role-gated: only visible when user.role === 'Admin'
  { title: 'Admin', href: '/admin', icon: <IconShieldCheck />, roles: ['Admin'] },
  { title: 'System', href: '/admin/system-config', icon: <IconSettings />, roles: ['Admin'] },
]

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof BottomNavbar> = {
  title: 'Shell/BottomNavbar',
  component: BottomNavbar,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: '100vh',
          position: 'relative',
          margin: '0 auto',
          background: 'var(--color-background, #f5f5f5)',
          /** Container query context — navbar uses md:hidden so we constrain width */
          containerType: 'inline-size',
        }}
      >
        {/* Force navbar visible: override md:hidden since Storybook canvas is desktop-width */}
        <style>{`
          .bottom-nav-story [aria-label="Mobile navigation"] {
            display: flex !important;
            position: absolute !important;
          }
        `}</style>
        <div className="bottom-nav-story" style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ padding: 16 }}>
            <p
              style={{
                color: 'var(--color-surface-fg-muted, #666)',
                fontSize: 14,
              }}
            >
              Scroll content area. The bottom navbar is fixed at the bottom.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof BottomNavbar>

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems,
    moreItems,
  },
}

export const AttendanceActive: Story = {
  args: {
    currentPath: '/attendance',
    user: mockUser,
    primaryItems,
    moreItems,
  },
}

export const ProjectsActive: Story = {
  args: {
    currentPath: '/projects/abc-123/board',
    user: mockUser,
    primaryItems,
    moreItems,
  },
}

export const MoreItemActive: Story = {
  name: 'Overflow Item Active (Breaks)',
  args: {
    currentPath: '/breaks',
    user: mockUser,
    primaryItems,
    moreItems,
  },
}

export const NoPrimaryItems: Story = {
  name: 'No Primary Items',
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems: [],
    moreItems,
  },
}

export const NoMoreItems: Story = {
  name: 'No Overflow Items',
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems,
    moreItems: [],
  },
}

export const AssociateRole: Story = {
  name: 'Role-gated (Associate — admin items auto-hidden)',
  args: {
    currentPath: '/',
    user: associateUser,
    primaryItems,
    // No manual filtering — the Admin/System items declare roles: ['Admin'],
    // so they hide automatically for a non-admin user.
    moreItems,
  },
}

export const NoUser: Story = {
  name: 'No user (role-gated items hidden)',
  args: {
    currentPath: '/',
    user: null,
    primaryItems,
    moreItems,
  },
}

export const CanViewPredicate: Story = {
  name: 'Custom visibility (canView)',
  args: {
    currentPath: '/',
    user: associateUser,
    primaryItems,
    // Arbitrary per-item logic — here: hide Adjustments unless the name starts with 'A'.
    moreItems: moreItems.map((i) =>
      i.href === '/adjustments'
        ? { ...i, canView: (u) => !!u && u.name.startsWith('A') }
        : i,
    ),
  },
}

export const PillIndicator: Story = {
  name: 'Material-3 pill indicator',
  args: {
    currentPath: '/attendance',
    user: mockUser,
    primaryItems,
    moreItems,
    indicator: 'pill',
  },
}

export const LabelsOnSelected: Story = {
  name: 'Labels on selected only',
  args: {
    currentPath: '/projects',
    user: mockUser,
    primaryItems,
    moreItems,
    labelVisibility: 'selected',
  },
}

export const MinimalThreeItems: Story = {
  name: 'Minimal (3 items)',
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems: primaryItems.slice(0, 3),
    moreItems: [],
  },
}

export const WithBadges: Story = {
  name: 'With Badges',
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems: [
      { title: 'Home', href: '/', icon: <IconLayoutDashboard />, exact: true, badge: 0 },
      { title: 'Attendance', href: '/attendance', icon: <IconCalendarCheck />, badge: 3 },
      { title: 'Projects', href: '/projects', icon: <IconLayoutKanban />, badge: 12 },
      { title: 'Tasks', href: '/my-tasks', icon: <IconListCheck />, badge: 147 },
    ],
    moreItems,
  },
}

export const FilledWhenSelected: Story = {
  name: 'Filled icon when selected',
  args: {
    currentPath: '/',
    user: mockUser,
    primaryItems: filledItems,
    moreItems: [],
    indicator: 'pill',
  },
}

export const FilledLabelsOnSelected: Story = {
  name: 'Filled + labels on selected',
  args: {
    currentPath: '/messages',
    user: mockUser,
    primaryItems: filledItems,
    moreItems: [],
    labelVisibility: 'selected',
  },
}

export const IndicatorNone: Story = {
  name: 'Indicator: none (iOS filled + tint)',
  args: {
    currentPath: '/messages',
    user: mockUser,
    primaryItems: filledItems,
    moreItems: [],
    indicator: 'none',
  },
}

export const IndicatorTint: Story = {
  name: 'Indicator: tint (whole cell)',
  args: {
    currentPath: '/alerts',
    user: mockUser,
    primaryItems: filledItems,
    moreItems: [],
    indicator: 'tint',
  },
}

/**
 * Interactive — clicking a tab updates `currentPath`, so the active indicator
 * animates (slides) to the tapped item. This is the motion you can't see in the
 * static stories (where `currentPath` is a fixed prop).
 */
export const Interactive: Story = {
  render: function InteractiveNav() {
    const [path, setPath] = React.useState('/')
    const NavLink = React.useMemo(
      () =>
        React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
          function NavLink({ href, onClick, ...props }, ref) {
            return (
              <a
                ref={ref}
                href={href}
                onClick={(e) => {
                  e.preventDefault()
                  setPath(href)
                  onClick?.(e)
                }}
                {...props}
              />
            )
          },
        ),
      [],
    )
    return (
      <LinkProvider component={NavLink}>
        <BottomNavbar currentPath={path} user={mockUser} primaryItems={filledItems} moreItems={moreItems} indicator="pill" />
      </LinkProvider>
    )
  },
}
