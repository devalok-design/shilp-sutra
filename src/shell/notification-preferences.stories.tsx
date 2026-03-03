import type { Meta, StoryObj } from '@storybook/react'
import NotificationPreferences from './notification-preferences'
import type {
  NotificationPreference,
  NotificationProject,
} from './notification-preferences'

// ── Mock Data ────────────────────────────────────────────────

const mockProjects: NotificationProject[] = [
  { id: 'proj-1', title: 'Client Portal' },
  { id: 'proj-2', title: 'Karm V2' },
  { id: 'proj-3', title: 'Website Redesign' },
  { id: 'proj-4', title: 'Acme Mobile App' },
  { id: 'proj-5', title: 'Internal Tools' },
]

const mockPreferences: NotificationPreference[] = [
  {
    id: 'pref-1',
    userId: 'user-1',
    projectId: null,
    channel: 'IN_APP',
    minTier: 'INFO',
    muted: false,
  },
  {
    id: 'pref-2',
    userId: 'user-1',
    projectId: null,
    channel: 'GOOGLE_CHAT',
    minTier: 'IMPORTANT',
    muted: false,
  },
  {
    id: 'pref-3',
    userId: 'user-1',
    projectId: 'proj-1',
    channel: 'IN_APP',
    minTier: 'INFO',
    muted: false,
  },
  {
    id: 'pref-4',
    userId: 'user-1',
    projectId: 'proj-2',
    channel: 'GOOGLE_CHAT',
    minTier: 'CRITICAL',
    muted: true,
  },
]

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof NotificationPreferences> = {
  title: 'Layout/NotificationPreferences',
  component: NotificationPreferences,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 640, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSave: { action: 'save' },
    onToggleMute: { action: 'toggleMute' },
    onUpdateTier: { action: 'updateTier' },
    onDelete: { action: 'delete' },
  },
}
export default meta
type Story = StoryObj<typeof NotificationPreferences>

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    preferences: mockPreferences,
    projects: mockProjects,
  },
}

export const Empty: Story = {
  args: {
    preferences: [],
    projects: mockProjects,
  },
}

export const Loading: Story = {
  args: {
    preferences: [],
    projects: [],
    isLoading: true,
  },
}

export const GlobalOnly: Story = {
  name: 'Global Rules Only',
  args: {
    preferences: mockPreferences.filter((p) => p.projectId === null),
    projects: mockProjects,
  },
}

export const AllMuted: Story = {
  args: {
    preferences: mockPreferences.map((p) => ({ ...p, muted: true })),
    projects: mockProjects,
  },
}

export const SinglePreference: Story = {
  args: {
    preferences: [
      {
        id: 'pref-single',
        userId: 'user-1',
        projectId: null,
        channel: 'IN_APP',
        minTier: 'INFO',
        muted: false,
      },
    ],
    projects: mockProjects,
  },
}

export const ManyPreferences: Story = {
  name: 'Many Rules (Scrollable)',
  args: {
    preferences: [
      ...mockPreferences,
      {
        id: 'pref-5',
        userId: 'user-1',
        projectId: 'proj-3',
        channel: 'IN_APP',
        minTier: 'IMPORTANT',
        muted: false,
      },
      {
        id: 'pref-6',
        userId: 'user-1',
        projectId: 'proj-3',
        channel: 'GOOGLE_CHAT',
        minTier: 'CRITICAL',
        muted: false,
      },
      {
        id: 'pref-7',
        userId: 'user-1',
        projectId: 'proj-4',
        channel: 'IN_APP',
        minTier: 'INFO',
        muted: true,
      },
      {
        id: 'pref-8',
        userId: 'user-1',
        projectId: 'proj-5',
        channel: 'GOOGLE_CHAT',
        minTier: 'IMPORTANT',
        muted: false,
      },
    ],
    projects: mockProjects,
  },
}

export const CriticalOnlySetup: Story = {
  name: 'Critical-Only Configuration',
  args: {
    preferences: [
      {
        id: 'pref-crit-1',
        userId: 'user-1',
        projectId: null,
        channel: 'IN_APP',
        minTier: 'CRITICAL',
        muted: false,
      },
      {
        id: 'pref-crit-2',
        userId: 'user-1',
        projectId: null,
        channel: 'GOOGLE_CHAT',
        minTier: 'CRITICAL',
        muted: false,
      },
    ],
    projects: mockProjects,
  },
}
