import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TopBar } from './top-bar'
import type { TopBarUser } from './top-bar'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { NotificationCenter } from './notification-center'
import {
  IconSearch,
  IconBell,
  IconSparkles,
  IconNews,
  IconKeyboard,
  IconLanguage,
  IconSettings,
  IconFilter,
  IconDownload,
  IconShare,
} from '@tabler/icons-react'

// ── Mock Data ────────────────────────────────────────────────

const mockUser: TopBarUser = {
  name: 'Aarav Sharma',
  email: 'aarav@devalok.com',
  image: null,
}

const mockUserWithImage: TopBarUser = {
  name: 'Priya Mehta',
  email: 'priya@devalok.com',
  image: 'https://i.pravatar.cc/150?u=priya-topbar',
}

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof TopBar> = {
  title: 'Shell/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen>
        <div style={{ width: '100%' }}>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof TopBar>

// ── Stories ──────────────────────────────────────────────────

/** Basic two-zone layout with sidebar trigger, title, and user menu. */
export const Default: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Dashboard</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search (Ctrl+K)" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu user={mockUser} onNavigate={fn()} onLogout={fn()} />
      </TopBar.Right>
    </TopBar>
  ),
}

/** Full layout with search, notifications, AI chat, and user menu. */
export const WithAllActions: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Projects</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search (Ctrl+K)" onClick={fn()} />
          <NotificationCenter
            notifications={[
              {
                id: '1',
                title: 'New task assigned',
                body: 'Fix login redirect bug',
                tier: 'IMPORTANT',
                isRead: false,
                createdAt: new Date(Date.now() - 300000).toISOString(),
                entityType: 'TASK',
                projectId: 'proj-1',
                project: { title: 'Website Redesign' },
              },
            ]}
            onMarkRead={() => {}}
            onMarkAllRead={() => {}}
            onNavigate={() => {}}
          />
          <TopBar.IconButton icon={<IconSparkles />} tooltip="AI Chat" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu
          user={mockUserWithImage}
          onNavigate={fn()}
          onLogout={fn()}
        />
      </TopBar.Right>
    </TopBar>
  ),
}

/** Many icon buttons — demonstrates unlimited action slots. */
export const ManyActions: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Reports</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn()} />
          <TopBar.IconButton icon={<IconFilter />} tooltip="Filter" onClick={fn()} />
          <TopBar.IconButton icon={<IconDownload />} tooltip="Export" onClick={fn()} />
          <TopBar.IconButton icon={<IconShare />} tooltip="Share" onClick={fn()} />
          <TopBar.IconButton icon={<IconSettings />} tooltip="Settings" onClick={fn()} className="hidden md:flex" />
        </TopBar.Section>
        <TopBar.UserMenu user={mockUser} onNavigate={fn()} onLogout={fn()} />
      </TopBar.Right>
    </TopBar>
  ),
}

/** Multiple sections with different gap values. */
export const SectionGaps: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Section Gaps Demo</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn()} />
          <TopBar.IconButton icon={<IconFilter />} tooltip="Filter" onClick={fn()} />
        </TopBar.Section>
        <TopBar.Section gap="loose">
          <TopBar.IconButton icon={<IconBell />} tooltip="Notifications" onClick={fn()} />
          <TopBar.IconButton icon={<IconSparkles />} tooltip="AI Chat" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu user={mockUser} onNavigate={fn()} onLogout={fn()} />
      </TopBar.Right>
    </TopBar>
  ),
}

/** Three-zone layout with centered search bar trigger. */
export const WithCenterZone: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Dashboard</TopBar.Title>
      </TopBar.Left>
      <TopBar.Center>
        <button
          type="button"
          className="flex h-ds-sm w-[320px] items-center gap-ds-03 rounded-ds-lg border border-surface-border bg-surface-3 px-ds-04 text-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-4"
          onClick={fn()}
        >
          <IconSearch className="h-ico-sm w-ico-sm" />
          <span>Search...</span>
          <kbd className="ml-auto text-ds-sm text-surface-fg-subtle">Ctrl+K</kbd>
        </button>
      </TopBar.Center>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconBell />} tooltip="Notifications" onClick={fn()} />
          <TopBar.IconButton icon={<IconSparkles />} tooltip="AI Chat" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu user={mockUser} onNavigate={fn()} onLogout={fn()} />
      </TopBar.Right>
    </TopBar>
  ),
}

/** No user — logged out state. */
export const NoUser: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <TopBar.Title>Login</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn()} />
        </TopBar.Section>
      </TopBar.Right>
    </TopBar>
  ),
}

/** Mobile logo in the left zone. */
export const WithMobileLogo: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <div className="flex items-center gap-ds-02 md:hidden">
          <div className="h-6 w-6 rounded-ds-md bg-gradient-to-br from-pink-7 to-red-7" />
          <span className="text-ds-md font-semibold text-surface-fg">Karm</span>
        </div>
        <TopBar.Title>Dashboard</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu user={mockUser} onNavigate={fn()} onLogout={fn()} />
      </TopBar.Right>
    </TopBar>
  ),
}

/** User menu with custom items, badges, and disabled state. */
export const WithUserMenuItems: Story = {
  render: () => (
    <TopBar>
      <TopBar.Left>
        <SidebarTrigger className="hidden text-surface-fg-muted md:flex" />
        <TopBar.Title>Dashboard</TopBar.Title>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Section gap="tight">
          <TopBar.IconButton icon={<IconSearch />} tooltip="Search" onClick={fn()} />
        </TopBar.Section>
        <TopBar.UserMenu
          user={mockUser}
          onNavigate={fn()}
          onLogout={fn()}
          userMenuItems={[
            { label: 'Changelog', icon: <IconNews />, href: '/changelog', badge: '3' },
            { label: 'Keyboard Shortcuts', icon: <IconKeyboard />, onClick: fn() },
            { separator: true, label: 'Notification Preferences', icon: <IconBell />, href: '/settings/notifications' },
            { label: 'Language', icon: <IconLanguage />, href: '/settings/language', disabled: true },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  ),
}
