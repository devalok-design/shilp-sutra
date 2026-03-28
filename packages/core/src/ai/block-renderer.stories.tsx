import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BlockRenderer } from './block-renderer'
import type { Block } from './types'
import { AICommandProvider } from './ai-command-provider'

const meta: Meta<typeof BlockRenderer> = {
  title: 'AI/BlockRenderer',
  component: BlockRenderer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onAction: { action: 'action' },
  },
}
export default meta
type Story = StoryObj<typeof BlockRenderer>

// ── 1. AllBlocks ──

const allBlocks: Block[] = [
  {
    type: 'text',
    id: 'text-1',
    data: {
      content:
        'Here is a summary with **bold text**, a [link](https://example.com), and `inline code`.',
    },
  },
  {
    type: 'info',
    id: 'info-1',
    data: { message: 'Your workspace has been synced successfully.' },
  },
  {
    type: 'table',
    id: 'table-1',
    data: {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status', variant: 'badge' },
      ],
      rows: [
        { name: 'Alice', role: 'Designer', status: { label: 'Active', color: 'success' } },
        { name: 'Bob', role: 'Engineer', status: { label: 'Pending', color: 'warning' } },
        { name: 'Carol', role: 'PM', status: { label: 'On Leave', color: 'default' } },
      ],
      sortable: true,
    },
  },
  {
    type: 'confirm',
    id: 'confirm-1',
    data: {
      actionId: 'archive-project',
      label: 'Archive Project',
      description: 'This will move the project to the archive. You can restore it later.',
      destructive: false,
    },
  },
  {
    type: 'stat_row',
    id: 'stats-1',
    data: {
      stats: [
        { label: 'Tasks', value: 42, change: { value: '+12%', direction: 'up' } },
        { label: 'Completed', value: 38, change: { value: '+8%', direction: 'up' } },
        { label: 'Overdue', value: 2, change: { value: '-3', direction: 'down' } },
      ],
    },
  },
  {
    type: 'divider',
    id: 'divider-1',
    data: {},
  },
  {
    type: 'success',
    id: 'success-1',
    data: {
      title: 'Task completed',
      message: 'The task "Update docs" has been marked as done.',
      undoable: true,
      undoTimeout: 5000,
    },
  },
  {
    type: 'loading',
    id: 'loading-1',
    data: { lines: 3 },
  },
]

export const AllBlocks: Story = {
  args: {
    blocks: allBlocks,
  },
}

// ── 2. TextBlock ──

export const TextBlock: Story = {
  args: {
    blocks: [
      {
        type: 'text',
        id: 'text-rich',
        data: {
          content: [
            '## Heading Level 2',
            '',
            'Paragraph with **bold**, *italic*, and a [hyperlink](https://example.com).',
            '',
            'Inline `code snippet` and a fenced code block:',
            '',
            '```ts',
            'const greeting = "hello world";',
            'console.log(greeting);',
            '```',
            '',
            '### Lists',
            '',
            '- First item',
            '- Second item with **bold**',
            '  - Nested item',
            '',
            '1. Ordered one',
            '2. Ordered two',
          ].join('\n'),
        },
      },
    ],
  },
}

// ── 3. TableBlock ──

export const TableBlock: Story = {
  args: {
    blocks: [
      {
        type: 'table',
        id: 'table-full',
        data: {
          columns: [
            { key: 'id', label: '#', variant: 'number' },
            { key: 'name', label: 'Member' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status', variant: 'badge' },
          ],
          rows: [
            { id: 1, name: 'Alice Chen', email: 'alice@example.com', status: { label: 'Active', color: 'success' } },
            { id: 2, name: 'Bob Kumar', email: 'bob@example.com', status: { label: 'Error', color: 'error' } },
            { id: 3, name: 'Carol Lee', email: 'carol@example.com', status: { label: 'Warning', color: 'warning' } },
            { id: 4, name: 'Dan Patel', email: 'dan@example.com', status: { label: 'Default', color: 'default' } },
            { id: 5, name: 'Eve Wang', email: 'eve@example.com', status: { label: 'Active', color: 'success' } },
          ],
          caption: 'Team members and their current status',
          sortable: true,
        },
      },
    ],
  },
}

// ── 4. ConfirmDefault ──

export const ConfirmDefault: Story = {
  args: {
    blocks: [
      {
        type: 'confirm',
        id: 'confirm-default',
        data: {
          actionId: 'move-to-backlog',
          label: 'Move to Backlog',
          description: 'This task will be moved to the backlog and removed from the current sprint.',
          destructive: false,
        },
      },
    ],
  },
}

// ── 5. ConfirmDestructive ──

export const ConfirmDestructive: Story = {
  args: {
    blocks: [
      {
        type: 'confirm',
        id: 'confirm-destructive',
        data: {
          actionId: 'delete-workspace',
          label: 'Delete Workspace',
          description:
            'This will permanently delete the workspace and all associated data. This action cannot be undone.',
          destructive: true,
          rationale:
            'The workspace has been inactive for 90 days and contains no active projects. Deleting it will free up resources and reduce clutter.',
        },
      },
    ],
  },
}

// ── 6. SuccessWithUndo ──

export const SuccessWithUndo: Story = {
  args: {
    blocks: [
      {
        type: 'success',
        id: 'success-undo',
        data: {
          title: 'Task archived',
          message: 'The task "Design review" has been moved to the archive.',
          undoable: true,
          undoTimeout: 5000,
        },
      },
    ],
  },
}

// ── 7. SuccessSimple ──

export const SuccessSimple: Story = {
  args: {
    blocks: [
      {
        type: 'success',
        id: 'success-simple',
        data: {
          title: 'Settings saved',
          message: 'Your notification preferences have been updated successfully.',
        },
      },
    ],
  },
}

// ── 8. ErrorWithSuggestion ──

export const ErrorWithSuggestion: Story = {
  args: {
    blocks: [
      {
        type: 'error',
        id: 'error-suggestion',
        data: {
          title: 'Failed to assign task',
          message: 'The member **Priya Sharma** does not have access to this project.',
          suggestion:
            'Try adding Priya to the project first, or assign the task to another team member.',
        },
      },
    ],
  },
}

// ── 9. LoadingSkeleton ──

export const LoadingSkeleton: Story = {
  args: {
    blocks: [
      {
        type: 'loading',
        id: 'loading-skeleton',
        data: { lines: 4 },
      },
    ],
  },
}

// ── 10. LoadingSteps ──

export const LoadingSteps: Story = {
  args: {
    blocks: [
      {
        type: 'loading',
        id: 'loading-steps',
        data: {
          steps: [
            { id: 'step-1', label: 'Fetching project data', status: 'done' },
            { id: 'step-2', label: 'Analyzing task dependencies', status: 'active' },
            { id: 'step-3', label: 'Generating summary', status: 'pending' },
          ],
        },
      },
    ],
  },
}

// ── 11. StatRow ──

export const StatRow: Story = {
  args: {
    blocks: [
      {
        type: 'stat_row',
        id: 'stats-mixed',
        data: {
          stats: [
            { label: 'Open Tasks', value: 24, change: { value: '+5', direction: 'up' } },
            { label: 'Completed', value: 156, change: { value: '+22%', direction: 'up' } },
            { label: 'Overdue', value: 3, change: { value: '-2', direction: 'down' } },
            { label: 'Avg Cycle Time', value: '4.2d', change: { value: '0%', direction: 'neutral' } },
          ],
        },
      },
    ],
  },
}

// ── 12. CustomBlock ──

function WeatherCard({ data }: { data: { city: string; temp: number; condition: string } }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-surface-fg-muted)' }}>
        {data.city}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
        {data.temp}&deg;C
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-surface-fg-subtle)' }}>
        {data.condition}
      </div>
    </div>
  )
}

export const CustomBlock: Story = {
  args: {
    blocks: [
      {
        type: 'text',
        id: 'custom-intro',
        data: { content: 'Here is the current weather for your location:' },
      },
      {
        type: 'weather',
        id: 'weather-1',
        data: { city: 'Mumbai', temp: 32, condition: 'Partly cloudy' },
      },
    ],
    customBlocks: {
      weather: WeatherCard as any,
    },
  },
}

// ── 13. UnknownBlock ──

export const UnknownBlock: Story = {
  args: {
    blocks: [
      {
        type: 'text',
        id: 'unknown-intro',
        data: { content: 'The next block has an unregistered type and shows the fallback:' },
      },
      {
        type: 'sparkline_chart',
        id: 'unknown-1',
        data: {
          series: [10, 25, 18, 30, 22, 40, 35],
          label: 'Weekly signups',
        },
      },
    ],
  },
}

// ── 14. LowConfidence ──

export const LowConfidence: Story = {
  args: {
    blocks: [
      {
        type: 'text',
        id: 'low-confidence',
        confidence: 'low',
        data: {
          content:
            'Based on limited data, the projected completion date is **March 24**. This estimate may change as more tasks are completed.',
        },
      },
    ],
  },
}

// ── 15. WithProvider ──

function ProviderWeatherCard({ data }: { data: { city: string; temp: number; condition: string } }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-surface-fg-muted)' }}>
        {data.city}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
        {data.temp}&deg;C
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-surface-fg-subtle)' }}>
        {data.condition}
      </div>
    </div>
  )
}

const providerBlocks: Block[] = [
  {
    type: 'text',
    id: 'provider-intro',
    data: { content: 'Custom blocks resolved via **AICommandProvider** context:' },
  },
  {
    type: 'weather',
    id: 'provider-weather',
    data: { city: 'Bengaluru', temp: 28, condition: 'Thunderstorms expected' },
  },
  {
    type: 'confirm',
    id: 'provider-confirm',
    data: {
      actionId: 'set-reminder',
      label: 'Set Rain Reminder',
      description: 'Send a reminder to carry an umbrella before you leave.',
      destructive: false,
    },
  },
]

export const WithProvider: Story = {
  render: (args) => (
    <AICommandProvider
      customBlocks={{ weather: ProviderWeatherCard as any }}
      onAction={args.onAction}
    >
      <BlockRenderer blocks={providerBlocks} />
    </AICommandProvider>
  ),
}
