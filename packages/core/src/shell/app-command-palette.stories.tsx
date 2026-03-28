import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { AppCommandPalette } from './app-command-palette'
import type { SearchResult, SearchResultGroup, AppCommandPaletteUser } from './app-command-palette'
import type { CommandGroup } from '../composed/command-palette'
import { IconBolt, IconGitBranch, IconClock, IconSearch, IconListCheck, IconLayoutKanban, IconUsers, IconStar } from '@tabler/icons-react'

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
            color: 'var(--color-surface-fg-muted, #666)',
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
    onOpenChange: { action: 'openChange' },
  },
}
export default meta
type Story = StoryObj<typeof AppCommandPalette>

// ── Stories ──────────────────────────────────────────────────

export const AdminUser: Story = {
  name: 'Admin User (with Admin pages)',
  args: {
    user: adminUser,
  },
}

export const AssociateUser: Story = {
  name: 'Associate User (no Admin pages)',
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
  name: 'No User (Guest)',
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

// ── New stories for enhanced features ──

export const ConsumerOwnedRouting: Story = {
  name: 'Consumer-Owned Routing (P0 #1)',
  args: {
    user: adminUser,
    searchResults: mockSearchResults,
    onSearchResultSelect: (result: SearchResult) => {
      console.log('Consumer handles routing for:', result)
      // In a real app: router.push(computeMyRoute(result))
    },
  },
}

export const GroupedSearchResults: Story = {
  name: 'Grouped Search Results (P0 #2)',
  args: {
    user: adminUser,
    searchResultGroups: [
      {
        label: 'Tasks',
        results: [
          { id: 'task-101', title: 'Fix login redirect bug', entityType: 'TASK', projectId: 'proj-1', rank: 10 },
          { id: 'task-102', title: 'Update auth middleware', entityType: 'TASK', projectId: 'proj-1', rank: 8 },
        ],
      },
      {
        label: 'Projects',
        results: [
          { id: 'proj-2', title: 'Karm V2', entityType: 'PROJECT', rank: 9 },
        ],
      },
      {
        label: 'People',
        results: [
          { id: 'user-42', title: 'Ravi Kumar', snippet: 'Full-stack Developer', entityType: 'USER', rank: 7 },
          { id: 'user-43', title: 'Priya Mehta', snippet: 'Designer', entityType: 'USER', rank: 5 },
        ],
      },
    ],
    onSearchResultSelect: (result: SearchResult) => {
      console.log('Selected:', result.entityType, result.id)
    },
  },
}

export const CustomSearchIcons: Story = {
  name: 'Custom Result Icons (P1 #5)',
  args: {
    user: adminUser,
    searchResults: [
      {
        id: 'task-1',
        title: 'High-priority bug',
        entityType: 'TASK',
        icon: <IconStar style={{ color: 'var(--color-warning-9)' }} />,
        rank: 10,
      },
      {
        id: 'task-2',
        title: 'Feature request',
        entityType: 'TASK',
        icon: <IconListCheck />,
        rank: 5,
      },
    ],
  },
}

export const RankedResults: Story = {
  name: 'Ranked Results (sorted by relevance)',
  args: {
    user: adminUser,
    searchResults: [
      { id: 'low', title: 'Low relevance item', entityType: 'TASK', rank: 1 },
      { id: 'high', title: 'High relevance item', entityType: 'TASK', rank: 10 },
      { id: 'mid', title: 'Medium relevance item', entityType: 'TASK', rank: 5 },
    ],
  },
}

export const CustomSearchLabel: Story = {
  name: 'Custom Search Label (P2 #10)',
  args: {
    user: adminUser,
    searchResults: mockSearchResults,
    searchResultsLabel: (count: number) => `${count} results found`,
  },
}

export const ControlledOpenState: Story = {
  name: 'Controlled Open State (P1 #4)',
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <AppCommandPalette user={adminUser} open={open} onOpenChange={setOpen} />
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted, #666)' }}>
          State: <strong>{open ? 'open' : 'closed'}</strong>
        </p>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#f0f0f0',
            cursor: 'pointer',
          }}
        >
          Open Palette
        </button>
      </div>
    )
  },
}

export const CustomKeybinding: Story = {
  name: 'Custom Keybinding (Ctrl+Shift+P)',
  args: {
    user: adminUser,
    keybinding: 'ctrl+shift+p',
  },
}

export const DisabledKeybinding: Story = {
  name: 'Disabled Keybinding',
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <AppCommandPalette user={adminUser} keybinding={false} open={open} onOpenChange={setOpen} />
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted, #666)' }}>
          Ctrl+K is disabled. Use the button to open.
        </p>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#f0f0f0',
            cursor: 'pointer',
          }}
        >
          Open Palette
        </button>
      </div>
    )
  },
}

export const CustomMaxHeight: Story = {
  name: 'Tall Results (500px max)',
  args: {
    user: superAdminUser,
    searchResults: mockSearchResults,
    extraGroups: [extraActionsGroup],
    maxHeight: '500px',
  },
}

export const CustomEmptyState: Story = {
  name: 'Custom Empty State (P2 #9)',
  args: {
    user: adminUser,
    emptyState: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
        <IconSearch style={{ width: 32, height: 32, opacity: 0.4 }} />
        <p style={{ fontSize: 14, margin: 0, color: 'var(--color-surface-fg-muted, #666)' }}>Start typing to search</p>
        <p style={{ fontSize: 12, margin: 0, color: 'var(--color-surface-fg-subtle, #999)' }}>
          Search tasks, projects, people, and more
        </p>
      </div>
    ),
  },
}

export const CustomFooterHints: Story = {
  name: 'Custom Footer Hints (P2 #11)',
  args: {
    user: adminUser,
    footerHints: [
      { keys: '↑↓', label: 'Navigate' },
      { keys: '↵', label: 'Open' },
      { keys: 'Tab', label: 'Filter by type' },
      { keys: 'Esc', label: 'Dismiss' },
    ],
  },
}

export const ResultsWithShortcuts: Story = {
  name: 'Search Results with Shortcuts (P1 #7)',
  args: {
    user: adminUser,
    searchResults: [
      {
        id: 'task-1',
        title: 'My Tasks',
        entityType: 'TASK',
        shortcut: 'G T',
        rank: 10,
      },
      {
        id: 'proj-1',
        title: 'Projects',
        entityType: 'PROJECT',
        shortcut: 'G P',
        rank: 8,
      },
    ],
    onSearchResultSelect: (result: SearchResult) => {
      console.log('Navigate to:', result)
    },
  },
}
