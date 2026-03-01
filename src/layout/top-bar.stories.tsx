import type { Meta, StoryObj } from '@storybook/react'
import TopBar from './top-bar'
import { SidebarProvider } from '../ui/sidebar'
import NotificationCenter from './notification-center'
import type { TopBarUser } from './top-bar'

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
  title: 'Layout/TopBar',
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
  argTypes: {
    onNavigate: { action: 'navigate' },
    onLogout: { action: 'logout' },
    onSearchClick: { action: 'searchClick' },
    onAiChatClick: { action: 'aiChatClick' },
  },
}
export default meta
type Story = StoryObj<typeof TopBar>

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: mockUser,
  },
}

export const WithAllActions: Story = {
  args: {
    pageTitle: 'Projects',
    user: mockUserWithImage,
    onSearchClick: undefined, // will use action
    onAiChatClick: undefined, // will use action
    onLogout: undefined, // will use action
  },
}

export const WithNotificationSlot: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: mockUser,
    notificationSlot: (
      <NotificationCenter
        notifications={[
          {
            id: '1',
            title: 'New task assigned to you',
            body: 'Fix login redirect bug on the client portal',
            tier: 'IMPORTANT',
            isRead: false,
            createdAt: new Date(Date.now() - 300000).toISOString(),
            entityType: 'TASK',
            projectId: 'proj-1',
            project: { title: 'Website Redesign' },
          },
          {
            id: '2',
            title: 'Break request approved',
            body: 'Your sick leave for March 5 has been approved.',
            tier: 'INFO',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            entityType: 'BREAK_REQUEST',
          },
        ]}
        onMarkRead={() => {}}
        onMarkAllRead={() => {}}
        onNavigate={() => {}}
      />
    ),
  },
}

export const NoUser: Story = {
  args: {
    pageTitle: 'Login',
    user: null,
  },
}

export const LongPageTitle: Story = {
  args: {
    pageTitle: 'Enterprise Resource Planning System Migration',
    user: mockUser,
  },
}

export const WithMobileLogo: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: mockUser,
    mobileLogo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #D33163, #ff6b6b)',
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Karm</span>
      </div>
    ),
  },
}

export const WithUserImage: Story = {
  args: {
    pageTitle: 'My Tasks',
    user: mockUserWithImage,
  },
}

export const MinimalNoLogout: Story = {
  args: {
    pageTitle: 'Read-only View',
    user: mockUser,
    onLogout: undefined,
    onAiChatClick: undefined,
  },
  argTypes: {
    onLogout: { action: undefined },
    onAiChatClick: { action: undefined },
  },
}
