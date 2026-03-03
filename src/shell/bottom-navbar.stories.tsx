import type { Meta, StoryObj } from '@storybook/react'
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
  { title: 'Home', href: '/', icon: IconLayoutDashboard, exact: true },
  { title: 'Attendance', href: '/attendance', icon: IconCalendarCheck },
  { title: 'Projects', href: '/projects', icon: IconLayoutKanban },
  { title: 'Tasks', href: '/my-tasks', icon: IconListCheck },
]

const moreItems: BottomNavItem[] = [
  { title: 'Breaks', href: '/breaks', icon: IconUmbrella },
  { title: 'Devsabha', href: '/devsabha', icon: IconBook },
  { title: 'Adjustments', href: '/adjustments', icon: IconAdjustmentsHorizontal },
  { title: 'Profile', href: '/profile', icon: IconUserCircle },
  { title: 'Admin', href: '/admin', icon: IconShieldCheck },
  { title: 'IconSettings', href: '/admin/system-config', icon: IconSettings },
]

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof BottomNavbar> = {
  title: 'Layout/BottomNavbar',
  component: BottomNavbar,
  tags: ['autodocs'],
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
        }}
      >
        <div style={{ padding: 16 }}>
          <p
            style={{
              color: 'var(--color-text-secondary, #666)',
              fontSize: 14,
            }}
          >
            Scroll content area. The bottom navbar is fixed at the bottom of the
            viewport.
          </p>
        </div>
        <Story />
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
  args: {
    currentPath: '/',
    user: associateUser,
    primaryItems,
    moreItems: moreItems.filter((i) => i.href !== '/admin' && i.href !== '/admin/system-config'),
  },
}

export const NoUser: Story = {
  name: 'No User (Hidden)',
  args: {
    currentPath: '/',
    user: null,
    primaryItems,
    moreItems,
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
