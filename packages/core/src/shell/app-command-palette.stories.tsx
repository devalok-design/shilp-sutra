import type { Meta, StoryObj } from '@storybook/react'
import { AppCommandPalette } from './app-command-palette'
import type { SearchResult, AppCommandPaletteUser } from './app-command-palette'
import type { CommandGroup } from '../composed/command-palette'
import { IconBolt, IconGitBranch, IconClock } from '@tabler/icons-react'

// ── Mock Data ────────────────────────────────────────────────

const adminUser: AppCommandPaletteUser = {
  name: 'Aarav Sharma',
  role: 'Admin',
}

const associateUser: AppCommandPaletteUser = {
  name: 'Priya Mehta',
  role: 'Associate',
}

const superAdminUser: AppCommandPaletteUser = {
  name: 'Mudit Jain',
  role: 'SuperAdmin',
}

const mockSearchResults: SearchResult[] = [
  {
    id: 'task-101',
    title: 'Fix login redirect bug',
    snippet: 'Users are being redirected to /404 after OAuth callback.',
    entityType: 'TASK',
    projectId: 'proj-1',
  },
  {
    id: 'proj-2',
    title: 'Karm V2',
    snippet: 'Internal team management platform.',
    entityType: 'PROJECT',
  },
  {
    id: 'user-42',
    title: 'Ravi Kumar',
    snippet: 'Full-stack Developer, Associate',
    entityType: 'USER',
  },
  {
    id: 'comment-789',
    title: 'Need to update the API schema...',
    snippet: 'Comment on task "Refactor notification service"',
    entityType: 'COMMENT',
    projectId: 'proj-1',
    metadata: { taskId: 'task-105' },
  },
  {
    id: 'meeting-55',
    title: 'Sprint 14 Retrospective',
    snippet: 'Scheduled for Friday, 3:00 PM',
    entityType: 'MEETING',
    projectId: 'proj-2',
  },
]

const extraActionsGroup: CommandGroup = {
  label: 'Quick Actions',
  items: [
    {
      id: 'action-standup',
      label: 'Start Daily Standup',
      icon: <IconBolt />,
      shortcut: 'Ctrl+Shift+S',
      onSelect: () => console.log('Start standup'),
    },
    {
      id: 'action-branch',
      label: 'Create Feature Branch',
      icon: <IconGitBranch />,
      onSelect: () => console.log('Create branch'),
    },
    {
      id: 'action-timesheet',
      label: 'Log Timesheet Entry',
      icon: <IconClock />,
      onSelect: () => console.log('Log timesheet'),
    },
  ],
}

// ── Meta ─────────────────────────────────────────────────────

const meta: Meta<typeof AppCommandPalette> = {
  title: 'Shell/AppCommandPalette',
  component: AppCommandPalette,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Global command palette triggered by Ctrl+K / Cmd+K. Shows navigation pages, admin items (for admin users), and live search results. Press Ctrl+K in any story to open it.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-background, #f5f5f5)',
          gap: 12,
        }}
      >
        <p
          style={{
            color: 'var(--color-text-secondary, #666)',
            fontSize: 14,
          }}
        >
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#f0f0f0', fontSize: 12 }}>Ctrl+K</kbd> to open the command palette
        </p>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onNavigate: { action: 'navigate' },
    onSearch: { action: 'search' },
    onSearchResultSelect: { action: 'searchResultSelect' },
  },
}
export default meta
type Story = StoryObj<typeof AppCommandPalette>

// ── Stories ──────────────────────────────────────────────────

export const AdminUser: Story = {
  name: 'Admin IconUser (with Admin pages)',
  args: {
    user: adminUser,
  },
}

export const AssociateUser: Story = {
  name: 'Associate IconUser (no Admin pages)',
  args: {
    user: associateUser,
  },
}

export const SuperAdmin: Story = {
  name: 'Super Admin',
  args: {
    user: superAdminUser,
  },
}

export const WithSearchResults: Story = {
  args: {
    user: adminUser,
    searchResults: mockSearchResults,
  },
}

export const SearchInProgress: Story = {
  name: 'Search Loading State',
  args: {
    user: adminUser,
    searchResults: mockSearchResults.slice(0, 2),
    isSearching: true,
  },
}

export const NoSearchResults: Story = {
  name: 'Empty Search Results',
  args: {
    user: adminUser,
    searchResults: [],
  },
}

export const WithExtraGroups: Story = {
  name: 'With Custom Action Group',
  args: {
    user: adminUser,
    extraGroups: [extraActionsGroup],
  },
}

export const NoUser: Story = {
  name: 'No IconUser (Guest)',
  args: {
    user: null,
  },
}

export const FullExample: Story = {
  name: 'Full Example (All Features)',
  args: {
    user: superAdminUser,
    searchResults: mockSearchResults,
    extraGroups: [extraActionsGroup],
  },
}
