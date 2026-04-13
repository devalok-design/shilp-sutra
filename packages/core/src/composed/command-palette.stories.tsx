import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import * as React from 'react'
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
      icon: <IconLayoutDashboard />,
      shortcut: 'G D',
      onSelect: () => console.log('Navigate to Dashboard'),
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'View all projects',
      icon: <IconLayoutKanban />,
      shortcut: 'G P',
      onSelect: () => console.log('Navigate to Projects'),
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      description: 'View your assigned tasks',
      icon: <IconListCheck />,
      shortcut: 'G T',
      onSelect: () => console.log('Navigate to Tasks'),
    },
    {
      id: 'team',
      label: 'Team',
      description: 'View team members and bandwidth',
      icon: <IconUsers />,
      onSelect: () => console.log('Navigate to Team'),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      description: 'Attendance and schedule',
      icon: <IconCalendarEvent />,
      onSelect: () => console.log('Navigate to Calendar'),
    },
    {
      id: 'bandwidth',
      label: 'Bandwidth',
      description: 'Team availability tracker',
      icon: <IconChartBar />,
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
      icon: <IconPlus />,
      shortcut: 'C',
      onSelect: () => console.log('Create new task'),
    },
    {
      id: 'search',
      label: 'Search Everything',
      description: 'Search across tasks, projects, and people',
      icon: <IconSearch />,
      shortcut: '/',
      onSelect: () => console.log('Open search'),
    },
    {
      id: 'notifications',
      label: 'View Notifications',
      description: 'Check your latest notifications',
      icon: <IconBell />,
      onSelect: () => console.log('View notifications'),
    },
    {
      id: 'devsabha',
      label: 'Start Devsabha',
      description: 'Begin a standup meeting session',
      icon: <IconMessage />,
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
      icon: <IconSettings />,
      shortcut: 'G S',
      onSelect: () => console.log('Open settings'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      description: 'Sign out of your account',
      icon: <IconLogout />,
      onSelect: () => console.log('Log out'),
    },
  ],
}

const allGroups = [navigationGroup, actionsGroup, settingsGroup]

const meta: Meta<typeof CommandPalette> = {
  title: 'Shell/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof CommandPalette>

export const Default: Story = {
  parameters: { chromatic: { delay: 500 } },
  args: {
    groups: allGroups,
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <CommandPalette {...args} />
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
          Command Palette
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> (or <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Cmd+K</kbd> on Mac) to open the palette.
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-surface-fg-subtle)' }}>
          Use arrow keys to navigate, Enter to select, Escape to close.
        </p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body)
    // Open the command palette with Ctrl+K
    await userEvent.keyboard('{Control>}k{/Control}')
    // Verify the dialog opened
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeVisible()
    })
    const dialog = body.getByRole('dialog')
    // Type a search query to filter results
    await userEvent.type(within(dialog).getByPlaceholderText('Search or jump to...'), 'Dashboard')
    // Verify filtered result
    await waitFor(() => expect(within(dialog).getByText('Dashboard')).toBeVisible())
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open. This palette has only navigation items.
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open. This palette has only action items.
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open. This palette uses a custom placeholder.
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open, then type a query that matches nothing to see the custom empty message.
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open. This palette has no commands, showing the empty state.
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
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to open. Check the browser console for search query logs as you type.
        </p>
      </div>
    </div>
  ),
}

// -- New stories for enhanced features --

export const ControlledOpen: Story = {
  name: 'Controlled Open State',
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
        <CommandPalette groups={allGroups} open={open} onOpenChange={setOpen} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
            Controlled Open State
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
            Open state is controlled externally. Current: <strong>{open ? 'open' : 'closed'}</strong>
          </p>
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-surface-border-strong)',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-surface-fg)',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            Open Palette
          </button>
        </div>
      </div>
    )
  },
}

export const CustomKeybinding: Story = {
  name: 'Custom Keybinding (Ctrl+P)',
  args: {
    groups: allGroups,
    keybinding: 'ctrl+p',
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        This palette opens with <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+P</kbd> instead of Ctrl+K.
      </p>
    </div>
  ),
}

export const DisabledKeybinding: Story = {
  name: 'Disabled Keybinding',
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
        <CommandPalette groups={allGroups} keybinding={false} open={open} onOpenChange={setOpen} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
            Keyboard shortcut is disabled. Use the button to open.
          </p>
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-surface-border-strong)',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-surface-fg)',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            Open Palette
          </button>
        </div>
      </div>
    )
  },
}

export const RichLabels: Story = {
  name: 'Rich Labels (ReactNode)',
  args: {
    groups: [
      {
        label: 'Search Results',
        items: [
          {
            id: 'result-1',
            label: (
              <span>
                Fix <strong style={{ color: 'var(--color-accent-11)' }}>login</strong> redirect bug
              </span>
            ),
            filterValue: 'Fix login redirect bug',
            description: (
              <span>
                Task in <span style={{ fontWeight: 500 }}>Karm V2</span> · High priority
              </span>
            ),
            icon: <IconListCheck />,
            onSelect: () => console.log('Selected'),
          },
          {
            id: 'result-2',
            label: (
              <span>
                Update <strong style={{ color: 'var(--color-accent-11)' }}>login</strong> page styles
              </span>
            ),
            filterValue: 'Update login page styles',
            description: 'Design task',
            icon: <IconLayoutKanban />,
            onSelect: () => console.log('Selected'),
          },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to see rich labels with match highlighting and badges.
      </p>
    </div>
  ),
}

export const CustomEmptyState: Story = {
  name: 'Custom Empty State',
  args: {
    groups: [],
    emptyState: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
        <IconSearch style={{ width: 32, height: 32, color: 'var(--color-surface-fg-subtle)', opacity: 0.5 }} />
        <p style={{ fontSize: 14, color: 'var(--color-surface-fg-muted)', margin: 0 }}>No results found</p>
        <p style={{ fontSize: 12, color: 'var(--color-surface-fg-subtle)', margin: 0 }}>
          Try searching for tasks, projects, or people
        </p>
      </div>
    ),
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        Press <kbd style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-surface-border-strong)', fontSize: 12, background: 'var(--color-surface-raised)' }}>Ctrl+K</kbd> to see the custom empty state with an icon and suggestion text.
      </p>
    </div>
  ),
}

export const CustomMaxHeight: Story = {
  name: 'Custom Max Height (500px)',
  args: {
    groups: allGroups,
    maxHeight: '500px',
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        Results container has a max height of 500px instead of the default 320px.
      </p>
    </div>
  ),
}

export const CustomFooterHints: Story = {
  name: 'Custom Footer Hints',
  args: {
    groups: allGroups,
    footerHints: [
      { keys: '↑↓', label: 'Navigate' },
      { keys: '↵', label: 'Select' },
      { keys: 'Tab', label: 'Filter by type' },
      { keys: 'Esc', label: 'Close' },
    ],
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        Footer has a custom "Tab to filter" hint alongside the defaults.
      </p>
    </div>
  ),
}

export const NoFooter: Story = {
  name: 'No Footer',
  args: {
    groups: allGroups,
    footerHints: false,
  },
  render: (args) => (
    <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
      <CommandPalette {...args} />
      <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
        Footer is hidden entirely.
      </p>
    </div>
  ),
}

export const WithRenderLabel: Story = {
  name: 'Match Highlighting (renderLabel)',
  render: () => {
    function HighlightMatch({ text, query }: { text: string; query: string }) {
      if (!query.trim()) return <>{text}</>
      const idx = text.toLowerCase().indexOf(query.toLowerCase())
      if (idx === -1) return <>{text}</>
      return (
        <>
          {text.slice(0, idx)}
          <strong style={{ color: 'var(--color-accent-11)' }}>
            {text.slice(idx, idx + query.length)}
          </strong>
          {text.slice(idx + query.length)}
        </>
      )
    }

    const groups: CommandGroup[] = [
      {
        label: 'Tasks',
        items: [
          {
            id: 't1',
            label: 'Fix login redirect bug',
            renderLabel: (q) => <HighlightMatch text="Fix login redirect bug" query={q} />,
            icon: <IconListCheck />,
            onSelect: () => {},
          },
          {
            id: 't2',
            label: 'Update dashboard layout',
            renderLabel: (q) => <HighlightMatch text="Update dashboard layout" query={q} />,
            icon: <IconLayoutDashboard />,
            onSelect: () => {},
          },
          {
            id: 't3',
            label: 'Add login analytics tracking',
            renderLabel: (q) => <HighlightMatch text="Add login analytics tracking" query={q} />,
            icon: <IconChartBar />,
            onSelect: () => {},
          },
        ],
      },
    ]

    return (
      <div style={{ height: '100vh', position: 'relative', padding: 32 }}>
        <CommandPalette groups={groups} />
        <p style={{ fontSize: 13, color: 'var(--color-surface-fg-muted)' }}>
          Press Ctrl+K and type "login" to see match highlighting in action.
        </p>
      </div>
    )
  },
}
