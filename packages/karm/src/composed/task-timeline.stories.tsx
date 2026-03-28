import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TaskTimeline } from './task-timeline'
import type { TimelineEntry } from '../tasks/v3/task-panel-types'

const now = Date.now()

const MOCK_ENTRIES: TimelineEntry[] = [
  {
    type: 'comment',
    comment: {
      id: 'c1',
      taskId: 't1',
      authorType: 'INTERNAL',
      authorId: 'u1',
      content: 'I have started working on the auth module. Will push the first draft by EOD.',
      createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
      internalAuthor: { id: 'u1', name: 'Arjun Mehta', image: null },
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'se1',
      actorId: 'u2',
      actorName: 'Priya Sharma',
      action: 'status-change',
      description: 'moved task to In Progress',
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'se2',
      actorId: 'u2',
      actorName: 'Priya Sharma',
      action: 'priority',
      description: 'changed priority to HIGH',
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'agent-response',
    response: {
      id: 'ar1',
      agentId: 'agent-1',
      agentName: 'Design Agent',
      content: 'I have reviewed the Figma mocks. The spacing between the header and the first card needs adjustment (24px -> 16px).',
      timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'review-event',
    event: {
      id: 're1',
      reviewerId: 'u3',
      reviewerName: 'Kavita Reddy',
      action: 'approved',
      comment: 'Looks good, ship it!',
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c2',
      taskId: 't1',
      authorType: 'INTERNAL',
      authorId: 'u3',
      content: 'Thanks for the quick review!',
      createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      internalAuthor: { id: 'u3', name: 'Kavita Reddy', image: null },
    },
  },
]

const meta: Meta<typeof TaskTimeline> = {
  title: 'Karm/Composed/TaskTimeline',
  component: TaskTimeline,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Unified timeline showing comments, system events, agent responses, and review events.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof TaskTimeline>

export const Default: Story = {
  args: {
    entries: MOCK_ENTRIES,
    clientMode: false,
    onReply: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
}

export const WithFilter: Story = {
  render: () => {
    const [filter, setFilter] = React.useState<'all' | 'comments' | 'reviews'>('all')
    return (
      <TaskTimeline
        entries={MOCK_ENTRIES}
        clientMode={false}
        filter={filter}
        onFilterChange={setFilter}
        onReply={fn()}
        onEdit={fn()}
        onDelete={fn()}
      />
    )
  },
}
