import type { Meta, StoryObj } from '@storybook/react'
import { AppSidebar } from './sidebar'
import { SidebarProvider } from '../ui/sidebar'
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
  IconClipboardList,
  IconUserPlus,
  IconSettings,
} from '@tabler/icons-react'
import type { NavGroup, SidebarUser } from './sidebar'

// ── Mock Data ────────────────────────────────────────────────

const mockUser: SidebarUser = {
  name: 'Aarav Sharma',
  email: 'aarav@devalok.com',
  image: null,
  designation: 'Senior Developer',
  role: 'Admin',
}

const mockUserWithImage: SidebarUser = {
  name: 'Priya Mehta',
  email: 'priya@devalok.com',
  image: 'https://i.pravatar.cc/150?u=priya',
  designation: 'Design Lead',
  role: 'Associate',
}

const mainNavGroup: NavGroup = {
  label: 'Main',
  items: [
    { title: 'Dashboard', href: '/', icon: IconLayoutDashboard, exact: true },
    { title: 'Attendance', href: '/attendance', icon: IconCalendarCheck },
    { title: 'Breaks', href: '/breaks', icon: IconUmbrella },
    { title: 'Projects', href: '/projects', icon: IconLayoutKanban },
    { title: 'My Tasks', href: '/my-tasks', icon: IconListCheck },
    { title: 'Devsabha', href: '/devsabha', icon: IconBook },
  ],
}

const secondaryNavGroup: NavGroup = {
  label: 'Account',
  items: [
    { title: 'Adjustments', href: '/adjustments', icon: IconAdjustmentsHorizontal },
    { title: 'Profile', href: '/profile', icon: IconUserCircle },
  ],
}

const adminNavGroup: NavGroup = {
  label: 'Admin',
  items: [
    { title: 'Admin Dashboard', href: '/admin', icon: IconShieldCheck },
    { title: 'Lokwasi', href: '/admin/lokwasi', icon: IconClipboardList },
    { title: 'Onboarding', href: '/admin/onboarding', icon: IconUserPlus },
    { title: 'System Config', href: '/admin/system-config', icon: IconSettings },
  ],
}

const mockFooterLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Support', href: '/support' },
]

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof AppSidebar> = {
  title: 'Shell/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen>
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
          <Story />
          <div
            style={{
              flex: 1,
              padding: 24,
              background: 'var(--color-background, #f5f5f5)',
            }}
          >
            <p style={{ color: 'var(--color-text-secondary, #666)' }}>
              Main content area
            </p>
          </div>
        </div>
      </SidebarProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof AppSidebar>

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const WithActiveRoute: Story = {
  args: {
    currentPath: '/projects',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const WithAdminNav: Story = {
  args: {
    currentPath: '/admin',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup, adminNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const WithUserImage: Story = {
  args: {
    currentPath: '/',
    user: mockUserWithImage,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const NoUser: Story = {
  args: {
    currentPath: '/',
    user: null,
    navGroups: [mainNavGroup],
    footerLinks: mockFooterLinks,
  },
}

export const WithCustomLogo: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footerLinks: mockFooterLinks,
    logo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #D33163, #ff6b6b)',
          }}
        />
        <span style={{ fontSize: 16, fontWeight: 600 }}>Karm</span>
      </div>
    ),
  },
}

export const NoFooterLinks: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footerLinks: [],
  },
}

export const SingleNavGroup: Story = {
  args: {
    currentPath: '/attendance',
    user: mockUser,
    navGroups: [mainNavGroup],
    footerLinks: [{ label: 'Help', href: '/help' }],
  },
}

export const DeepNestedActiveRoute: Story = {
  args: {
    currentPath: '/projects/abc-123/board',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup, adminNavGroup],
    footerLinks: mockFooterLinks,
  },
}
