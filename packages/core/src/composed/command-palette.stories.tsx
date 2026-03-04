import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconListCheck,
  IconUsers,
  IconCalendarEvent,
  IconSettings,
  IconSearch,
  IconPlus,
  IconLogout,
  IconBell,
  IconChartBar,
  IconMessage,
} from '@tabler/icons-react'
import { CommandPalette } from './command-palette'
import type { CommandGroup } from './command-palette'

const navigationGroup: CommandGroup = {
  label: 'Navigation',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Go to the main dashboard',
      icon: IconLayoutDashboard,
      shortcut: 'G D',
      onSelect: () => console.log('Navigate to Dashboard'),
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'View all projects',
      icon: IconLayoutKanban,
      shortcut: 'G P',
      onSelect: () => console.log('Navigate to Projects'),
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      description: 'View your assigned tasks',
      icon: IconListCheck,
      shortcut: 'G T',
      onSelect: () => console.log('Navigate to Tasks'),
    },
    {
      id: 'team',
      label: 'Team',
      description: 'View team members and bandwidth',
      icon: IconUsers,
      onSelect: () => console.log('Navigate to Team'),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      description: 'Attendance and schedule',
      icon: IconCalendarEvent,
      onSelect: () => console.log('Navigate to Calendar'),
    },
    {
      id: 'bandwidth',
      label: 'Bandwidth',
      description: 'Team availability tracker',
      icon: IconChartBar,
      onSelect: () => console.log('Navigate to Bandwidth'),
    },
  ],
}

const actionsGroup: CommandGroup = {
  label: 'Actions',
  items: [
    {
      id: 'new-task',
      label: 'Create New Task',
      description: 'Add a task to any project board',
      icon: IconPlus,
      shortcut: 'C',
      onSelect: () => console.log('Create new task'),
    },
    {
      id: 'search',
      label: 'Search Everything',
      description: 'Search across tasks, projects, and people',
      icon: IconSearch,
      shortcut: '/',
      onSelect: () => console.log('Open search'),
    },
    {
      id: 'notifications',
      label: 'View Notifications',
      description: 'Check your latest notifications',
      icon: IconBell,
      onSelect: () => console.log('View notifications'),
    },
    {
      id: 'devsabha',
      label: 'Start Devsabha',
      description: 'Begin a standup meeting session',
      icon: IconMessage,
      onSelect: () => console.log('Start Devsabha'),
    },
  ],
}

const settingsGroup: CommandGroup = {
  label: 'Account',
  items: [
    {
      id: 'settings',
      label: 'Settings',
      description: 'Manage your account preferences',
      icon: IconSettings,
      shortcut: 'G S',
      onSelect: () => console.log('Open settings'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      description: 'Sign out of your account',
      icon: IconLogout,
      onSelect: () => console.log('Log out'),
    },
  ],
}

const allGroups = [navigationGroup, actionsGroup, settingsGroup]

const meta: Meta<typeof CommandPalette> = {
  title: 'Composed/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof CommandPalette>

export const Default: Story = {
  args: {
    groups: allGroups,
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Command Palette
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> (or <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Cmd+K</kbd> on Mac) to open the palette.
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-placeholder)' }}>
          Use arrow keys to navigate, Enter to select, Escape to close.
        </p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Open the command palette with Ctrl+K
    await userEvent.keyboard('{Control>}k{/Control}')
    // Verify the dialog opened and the search input is visible
    const dialog = await within(document.body).findByRole('dialog')
    await expect(dialog).toBeVisible()
    // Type a search query to filter results
    await userEvent.type(within(dialog).getByPlaceholderText('Search or jump to...'), 'Dashboard')
    // Verify that the filtered result is visible
    await expect(within(dialog).getByText('Dashboard')).toBeVisible()
  },
}

export const NavigationOnly: Story = {
  args: {
    groups: [navigationGroup],
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open. This palette has only navigation items.
        </p>
      </div>
    </div>
  ),
}

export const ActionsOnly: Story = {
  args: {
    groups: [actionsGroup],
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open. This palette has only action items.
        </p>
      </div>
    </div>
  ),
}

export const CustomPlaceholder: Story = {
  args: {
    groups: allGroups,
    placeholder: 'What do you need?',
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open. This palette uses a custom placeholder.
        </p>
      </div>
    </div>
  ),
}

export const CustomEmptyMessage: Story = {
  args: {
    groups: allGroups,
    emptyMessage: 'Nothing matches your search. Try different keywords.',
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open, then type a query that matches nothing to see the custom empty message.
        </p>
      </div>
    </div>
  ),
}

export const EmptyGroups: Story = {
  args: {
    groups: [],
    emptyMessage: 'No commands available.',
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open. This palette has no commands, showing the empty state.
        </p>
      </div>
    </div>
  ),
}

export const WithSearchCallback: Story = {
  args: {
    groups: allGroups,
    onSearch: (query: string) => console.log('Search query:', query),
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border-default)', fontSize: 12, background: 'var(--color-layer-02)' }}>Ctrl+K</kbd> to open. Check the browser console for search query logs as you type.
        </p>
      </div>
    </div>
  ),
}
