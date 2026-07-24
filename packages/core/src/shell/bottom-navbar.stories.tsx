import type { Meta, StoryObj } from '@storybook/react-vite'
import { BottomNavbar } from './bottom-navbar'
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
} from '@tabler/icons-react'
import type { BottomNavItem, BottomNavbarUser } from './bottom-navbar'

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
