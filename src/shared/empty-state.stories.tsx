import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import {
  Inbox,
  Search,
  FolderOpen,
  Users,
  FileText,
  Bell,
  Calendar,
} from 'lucide-react'

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by creating your first item.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'No projects found',
    description: 'Create a new project to start tracking tasks and progress.',
    icon: FolderOpen,
    action: (
      <button
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#D33163',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Create Project
      </button>
    ),
  },
}

export const SearchNoResults: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description:
      'Try adjusting your search terms or filters to find what you are looking for.',
  },
}

export const EmptyInbox: Story = {
  args: {
    icon: Inbox,
    title: 'Inbox is empty',
    description: 'You are all caught up! No new messages or notifications.',
  },
}

export const NoTeamMembers: Story = {
  args: {
    icon: Users,
    title: 'No team members',
    description: 'Invite your colleagues to collaborate on this project.',
    action: (
      <button
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid var(--color-border-default)',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Invite Members
      </button>
    ),
  },
}

export const NoDocuments: Story = {
  args: {
    icon: FileText,
    title: 'No documents',
    description: 'Upload or create documents to share with your team.',
    action: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--color-border-default)',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Upload
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#D33163',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Create New
        </button>
      </div>
    ),
  },
}

export const NoNotifications: Story = {
  args: {
    icon: Bell,
    title: 'No notifications',
    description: 'When something important happens, you will be notified here.',
  },
}

export const NoEvents: Story = {
  args: {
    icon: Calendar,
    title: 'No upcoming events',
    description: 'Your calendar is clear for the week.',
  },
}

export const Compact: Story = {
  args: {
    icon: Inbox,
    title: 'No items',
    description: 'Nothing to display.',
    compact: true,
  },
}

export const CompactWithAction: Story = {
  args: {
    icon: FolderOpen,
    title: 'No tasks assigned',
    description: 'Drag tasks here or create new ones.',
    compact: true,
    action: (
      <button
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--color-border-default)',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Add Task
      </button>
    ),
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here',
  },
}
