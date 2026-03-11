import type { Meta, StoryObj } from '@storybook/react'
import { NotificationCenter } from './notification-center'
import type { Notification } from './notification-center'

// ── Helpers ──────────────────────────────────────────────────

const now = new Date()
function minutesAgo(min: number): string {
  return new Date(now.getTime() - min * 60000).toISOString()
}
function hoursAgo(hrs: number): string {
  return new Date(now.getTime() - hrs * 3600000).toISOString()
}
function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 86400000).toISOString()
}

// ── Mock Data ────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New task assigned: Fix login redirect bug',
    body: 'Aarav assigned you to "Fix login redirect bug" on the Client Portal project.',
    tier: 'IMPORTANT',
    isRead: false,
    createdAt: minutesAgo(5),
    entityType: 'TASK',
    entityId: 'task-101',
    projectId: 'proj-1',
    project: { title: 'Client Portal' },
  },
  {
    id: 'n2',
    title: 'Break request approved',
    body: 'Your sick leave for March 5 has been approved by the admin.',
    tier: 'INFO',
    isRead: false,
    createdAt: minutesAgo(30),
    entityType: 'BREAK_REQUEST',
    entityId: 'break-201',
  },
  {
    id: 'n3',
    title: 'Attendance correction requested',
    body: 'Priya Mehta has requested an attendance correction for Feb 28.',
    tier: 'IMPORTANT',
    isRead: true,
    createdAt: hoursAgo(2),
    entityType: 'ATTENDANCE',
    entityId: 'att-301',
    project: null,
  },
  {
    id: 'n4',
    title: 'Critical: Deployment failed',
    body: 'The staging deployment for Karm V2 failed with exit code 1. Check build logs.',
    tier: 'CRITICAL',
    isRead: false,
    createdAt: hoursAgo(4),
    entityType: 'PROJECT',
    entityId: 'proj-2',
    projectId: 'proj-2',
    project: { title: 'Karm V2' },
  },
  {
    id: 'n5',
    title: 'Review requested: Homepage wireframes',
    body: 'Ravi shared new wireframes for the homepage and requested your review.',
    tier: 'INFO',
    isRead: true,
    createdAt: daysAgo(1),
    entityType: 'REVIEW_REQUEST',
    entityId: 'review-401',
    projectId: 'proj-3',
    project: { title: 'Website Redesign' },
  },
  {
    id: 'n6',
    title: 'Task status updated',
    body: '"API Documentation" moved from To Do to In Progress by Aarav.',
    tier: 'INFO',
    isRead: true,
    createdAt: daysAgo(1),
    entityType: 'TASK',
    entityId: 'task-102',
    projectId: 'proj-1',
    project: { title: 'Client Portal' },
  },
  {
    id: 'n7',
    title: 'New client request received',
    body: 'Acme Corp submitted a change request for the mobile app project.',
    tier: 'IMPORTANT',
    isRead: true,
    createdAt: daysAgo(3),
    entityType: 'CLIENT_REQUEST',
    entityId: 'cr-501',
    projectId: 'proj-4',
    project: { title: 'Acme Mobile App' },
  },
]

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof NotificationCenter> = {
  title: 'Shell/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onMarkRead: { action: 'markRead' },
    onMarkAllRead: { action: 'markAllRead' },
    onNavigate: { action: 'navigate' },
    onFetchMore: { action: 'fetchMore' },
    onOpenChange: { action: 'openChange' },
    onDismiss: { action: 'dismiss' },
  },
}
export default meta
type Story = StoryObj<typeof NotificationCenter>

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    notifications: mockNotifications,
  },
}

export const AllUnread: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, isRead: false })),
  },
}

export const AllRead: Story = {
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, isRead: true })),
  },
}

export const Empty: Story = {
  args: {
    notifications: [],
  },
}

export const SingleNotification: Story = {
  args: {
    notifications: [mockNotifications[0]],
  },
}

export const CriticalOnly: Story = {
  args: {
    notifications: [
      {
        id: 'c1',
        title: 'Critical: Server outage detected',
        body: 'Production server is not responding. Immediate attention required.',
        tier: 'CRITICAL' as const,
        isRead: false,
        createdAt: minutesAgo(2),
        entityType: 'PROJECT',
        projectId: 'proj-2',
        project: { title: 'Karm V2' },
      },
      {
        id: 'c2',
        title: 'Critical: Database migration failed',
        body: 'Migration 0042_add_billing_fields failed with integrity constraint error.',
        tier: 'CRITICAL' as const,
        isRead: false,
        createdAt: minutesAgo(15),
        entityType: 'PROJECT',
        projectId: 'proj-2',
        project: { title: 'Karm V2' },
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    notifications: mockNotifications.slice(0, 3),
    isLoading: true,
    hasMore: true,
  },
}

export const WithCustomUnreadCount: Story = {
  name: 'Custom Unread Count (99+)',
  args: {
    notifications: mockNotifications.slice(0, 3),
    unreadCount: 142,
  },
}

export const MixedTiers: Story = {
  name: 'Mixed Tiers (Today Only)',
  args: {
    notifications: [
      {
        id: 'mix-1',
        title: 'Info: Sprint retrospective scheduled',
        body: 'Sprint 14 retro is set for Friday at 3 PM.',
        tier: 'INFO' as const,
        isRead: false,
        createdAt: minutesAgo(10),
        entityType: 'PROJECT',
        projectId: 'proj-1',
        project: { title: 'Client Portal' },
      },
      {
        id: 'mix-2',
        title: 'Important: Code review pending',
        body: 'PR #347 has been waiting for review for 2 days.',
        tier: 'IMPORTANT' as const,
        isRead: false,
        createdAt: minutesAgo(45),
        entityType: 'REVIEW_REQUEST',
        projectId: 'proj-3',
        project: { title: 'Website Redesign' },
      },
      {
        id: 'mix-3',
        title: 'Critical: SSL certificate expiring',
        body: 'The SSL certificate for staging.karm.app expires in 3 days.',
        tier: 'CRITICAL' as const,
        isRead: false,
        createdAt: hoursAgo(1),
        entityType: 'PROJECT',
        projectId: 'proj-2',
        project: { title: 'Karm V2' },
      },
    ],
  },
}

export const WithFooter: Story = {
  args: {
    notifications: mockNotifications,
    footerSlot: (
      <a href="/notifications" className="flex items-center justify-center text-ds-sm text-interactive hover:underline">
        View all notifications
      </a>
    ),
  },
}

export const CustomEmptyState: Story = {
  args: {
    notifications: [],
    emptyState: (
      <div className="flex flex-col items-center justify-center px-ds-05 py-ds-09">
        <p className="text-ds-md text-text-placeholder">No unread notifications</p>
        <a href="/notifications" className="mt-ds-02 text-ds-sm text-interactive hover:underline">
          View history
        </a>
      </div>
    ),
  },
}

export const WithHeaderActions: Story = {
  args: {
    notifications: mockNotifications,
    headerActions: (
      <button
        type="button"
        className="flex items-center justify-center rounded-ds-sm p-ds-01 text-text-placeholder hover:bg-layer-02 hover:text-text-secondary"
        aria-label="Notification settings"
      >
        ⚙
      </button>
    ),
  },
}

export const WithDismiss: Story = {
  name: 'Per-Notification Dismiss',
  args: {
    notifications: mockNotifications.map((n) => ({ ...n, isRead: false })),
  },
}

export const CustomWidth: Story = {
  name: 'Custom Popover Width',
  args: {
    notifications: mockNotifications,
    popoverClassName: 'w-[500px]',
  },
}

export const WithActions: Story = {
  name: 'Actionable Notifications',
  args: {
    notifications: [
      {
        id: 'act-1',
        title: 'Break request: Priya Mehta',
        body: 'Requested sick leave for March 12–13.',
        tier: 'IMPORTANT' as const,
        isRead: false,
        createdAt: minutesAgo(8),
        entityType: 'BREAK_REQUEST',
        entityId: 'break-501',
        project: null,
        actions: [
          { label: 'Approve', variant: 'primary' as const, onClick: () => {} },
          { label: 'Deny', variant: 'danger' as const, onClick: () => {} },
        ],
      },
      {
        id: 'act-2',
        title: 'Attendance correction: Ravi Kumar',
        body: 'Missed punch-out on March 10. Requesting correction to 6:30 PM.',
        tier: 'IMPORTANT' as const,
        isRead: false,
        createdAt: minutesAgo(25),
        entityType: 'ATTENDANCE',
        entityId: 'att-601',
        project: null,
        actions: [
          { label: 'Approve', variant: 'primary' as const, onClick: () => {} },
          { label: 'Deny', variant: 'danger' as const, onClick: () => {} },
        ],
      },
      {
        id: 'act-3',
        title: 'Review requested: Homepage wireframes',
        body: 'Ravi shared new wireframes for the homepage.',
        tier: 'INFO' as const,
        isRead: false,
        createdAt: hoursAgo(1),
        entityType: 'REVIEW_REQUEST',
        projectId: 'proj-3',
        project: { title: 'Website Redesign' },
        actions: [
          { label: 'Review', variant: 'default' as const, onClick: () => {} },
        ],
      },
      ...mockNotifications.slice(4),
    ],
  },
}
