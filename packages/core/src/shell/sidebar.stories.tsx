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
  IconSparkles,
} from '@tabler/icons-react'
import type { NavGroup, NavItem, SidebarFooterConfig, SidebarUser } from './sidebar'

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
    { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard />, exact: true },
    { title: 'Attendance', href: '/attendance', icon: <IconCalendarCheck /> },
    { title: 'Breaks', href: '/breaks', icon: <IconUmbrella /> },
    { title: 'Projects', href: '/projects', icon: <IconLayoutKanban /> },
    { title: 'My Tasks', href: '/my-tasks', icon: <IconListCheck /> },
    { title: 'Devsabha', href: '/devsabha', icon: <IconBook /> },
  ],
}

const secondaryNavGroup: NavGroup = {
  label: 'Account',
  items: [
    { title: 'Adjustments', href: '/adjustments', icon: <IconAdjustmentsHorizontal /> },
    { title: 'Profile', href: '/profile', icon: <IconUserCircle /> },
  ],
}

const adminNavGroup: NavGroup = {
  label: 'Admin',
  items: [
    { title: 'Admin Dashboard', href: '/admin', icon: <IconShieldCheck /> },
    { title: 'Lokwasi', href: '/admin/lokwasi', icon: <IconClipboardList /> },
    { title: 'Onboarding', href: '/admin/onboarding', icon: <IconUserPlus /> },
    { title: 'System Config', href: '/admin/system-config', icon: <IconSettings /> },
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
            <p style={{ color: 'var(--color-surface-fg-muted, #666)' }}>
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

// ── New Mock Data (S9-S14) ──────────────────────────────────

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

// ── New Stories (S9-S14) ────────────────────────────────────

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
        <a href="/changelog" className="text-ds-sm text-surface-fg-subtle hover:text-accent-11">
          What&apos;s new in v2.4?
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
      <div className="flex items-center gap-ds-03 rounded-ds-lg bg-surface-2 px-ds-04 py-ds-05">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-ds-sm text-surface-fg">Online — 9:42 AM</span>
      </div>
    ),
    footerLinks: mockFooterLinks,
  },
}

export const FooterWithPromo: Story = {
  args: {
    currentPath: '/',
    user: mockUser,
    navGroups: [mainNavGroup, secondaryNavGroup],
    footer: {
      promo: {
        icon: <IconSparkles />,
        text: 'Upgrade to Pro for unlimited projects',
        action: { label: 'Upgrade', href: '/billing/upgrade' },
        onDismiss: () => {},
      },
      links: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' },
      ],
      version: 'v2.4.1',
    },
  },
}

export const AllFeatures: Story = {
  args: {
    currentPath: '/projects/abc/board',
    user: mockUser,
    navGroups: [navGroupWithChildren, secondaryNavGroup],
    headerSlot: (
      <div className="flex items-center gap-ds-03 rounded-ds-lg bg-surface-2 px-ds-04 py-ds-05">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-ds-sm text-surface-fg">Online — 9:42 AM</span>
      </div>
    ),
    footer: {
      promo: {
        icon: <IconSparkles />,
        text: 'Upgrade to Pro for unlimited projects',
        action: { label: 'Upgrade', href: '/billing/upgrade' },
        onDismiss: () => {},
      },
      links: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' },
      ],
      version: 'v2.4.1',
    },
  },
}
