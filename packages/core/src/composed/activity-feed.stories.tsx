import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import {
  IconGitCommit,
  IconMessageCircle,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { ActivityFeed, type ActivityItem } from './activity-feed'

const meta: Meta<typeof ActivityFeed> = {
  title: 'Composed/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra` · **Import:** `import { ActivityFeed } from "@devalok/shilp-sutra/composed"`',
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
type Story = StoryObj<typeof ActivityFeed>

// ── Mock data ──────────────────────────────────────────────

const now = Date.now()

const BASIC_ITEMS: ActivityItem[] = [
  {
    id: '1',
    actor: { name: 'Arjun Mehta' },
    action: 'created the task',
    timestamp: new Date(now - 2 * 60 * 1000),
    color: 'info',
  },
  {
    id: '2',
    actor: { name: 'Priya Sharma' },
    action: 'changed priority to HIGH',
    timestamp: new Date(now - 15 * 60 * 1000),
    color: 'warning',
  },
  {
    id: '3',
    actor: { name: 'Kavita Reddy' },
    action: 'completed the review',
    timestamp: new Date(now - 3 * 60 * 60 * 1000),
    color: 'success',
  },
  {
    id: '4',
    actor: { name: 'Rahul Verma' },
    action: 'reported a blocker',
    timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000),
    color: 'error',
  },
  {
    id: '5',
    actor: { name: 'Sneha Joshi' },
    action: 'left a comment',
    timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000),
  },
]

const AVATAR_ITEMS: ActivityItem[] = [
  {
    id: 'a1',
    actor: { name: 'Arjun Mehta', image: 'https://i.pravatar.cc/150?u=arjun' },
    action: 'pushed 3 commits',
    timestamp: new Date(now - 5 * 60 * 1000),
    color: 'info',
  },
  {
    id: 'a2',
    actor: { name: 'Priya Sharma', image: 'https://i.pravatar.cc/150?u=priya' },
    action: 'requested a review',
    timestamp: new Date(now - 30 * 60 * 1000),
    color: 'warning',
  },
  {
    id: 'a3',
    actor: { name: 'Kavita Reddy', image: 'https://i.pravatar.cc/150?u=kavita' },
    action: 'approved the pull request',
    timestamp: new Date(now - 2 * 60 * 60 * 1000),
    color: 'success',
  },
]

const DETAIL_ITEMS: ActivityItem[] = [
  {
    id: 'd1',
    actor: { name: 'Arjun Mehta' },
    action: 'updated the description',
    timestamp: new Date(now - 10 * 60 * 1000),
    color: 'info',
    detail: (
      <div className="rounded-ds-md bg-surface-raised p-ds-03 text-ds-sm">
        Changed acceptance criteria to include unit tests and integration tests for the auth flow.
      </div>
    ),
  },
  {
    id: 'd2',
    actor: { name: 'Priya Sharma' },
    action: 'added a comment',
    timestamp: new Date(now - 45 * 60 * 1000),
    detail: (
      <div className="rounded-ds-md bg-surface-raised p-ds-03 text-ds-sm">
        We should also add rate-limiting to the login endpoint before release.
      </div>
    ),
  },
  {
    id: 'd3',
    actor: { name: 'Kavita Reddy' },
    action: 'moved task to In Progress',
    timestamp: new Date(now - 6 * 60 * 60 * 1000),
    color: 'success',
  },
]

const MANY_ITEMS: ActivityItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  actor: { name: ['Arjun Mehta', 'Priya Sharma', 'Kavita Reddy', 'Rahul Verma'][i % 4] },
  action: ['created a task', 'left a comment', 'changed the status', 'assigned a reviewer'][i % 4],
  timestamp: new Date(now - i * 2 * 60 * 60 * 1000),
  color: (['default', 'success', 'warning', 'error', 'info'] as const)[i % 5],
}))

const COLORED_ITEMS: ActivityItem[] = [
  { id: 'c1', actor: { name: 'System' }, action: 'default dot color', timestamp: new Date(now - 1 * 60 * 1000), color: 'default' },
  { id: 'c2', actor: { name: 'System' }, action: 'success dot color', timestamp: new Date(now - 2 * 60 * 1000), color: 'success' },
  { id: 'c3', actor: { name: 'System' }, action: 'warning dot color', timestamp: new Date(now - 3 * 60 * 1000), color: 'warning' },
  { id: 'c4', actor: { name: 'System' }, action: 'error dot color', timestamp: new Date(now - 4 * 60 * 1000), color: 'error' },
  { id: 'c5', actor: { name: 'System' }, action: 'info dot color', timestamp: new Date(now - 5 * 60 * 1000), color: 'info' },
]

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    items: BASIC_ITEMS,
  },
}

export const WithAvatars: Story = {
  name: 'With Avatars',
  args: {
    items: AVATAR_ITEMS,
  },
}

export const CompactMode: Story = {
  name: 'Compact Mode',
  args: {
    items: BASIC_ITEMS,
    compact: true,
  },
}

export const ExpandableDetail: Story = {
  name: 'Expandable Detail',
  args: {
    items: DETAIL_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on underlined action text to expand/collapse detail content.',
      },
    },
  },
}

export const WithLoadMore: Story = {
  name: 'With Load More',
  args: {
    items: BASIC_ITEMS,
    hasMore: true,
    onLoadMore: fn(),
  },
}

export const ColoredDots: Story = {
  name: 'Colored Dots',
  args: {
    items: COLORED_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story: 'All five dot color variants: default, success, warning, error, info.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    emptyState: (
      <div className="py-ds-06 text-center text-ds-sm text-surface-fg-subtle">
        No activity yet.
      </div>
    ),
  },
}

export const TruncatedWithShowAll: Story = {
  name: 'Truncated (maxInitialItems)',
  args: {
    items: MANY_ITEMS,
    maxInitialItems: 4,
  },
}

// ── Time-grouped stories ────────────────────────────────────

const GROUPED_ITEMS: ActivityItem[] = [
  { id: 'g1', actor: { name: 'Arjun Mehta' }, action: 'created the task', timestamp: new Date(now - 10 * 60 * 1000), color: 'info' },
  { id: 'g2', actor: { name: 'Priya Sharma' }, action: 'changed priority to HIGH', timestamp: new Date(now - 2 * 60 * 60 * 1000), color: 'warning' },
  { id: 'g3', actor: { name: 'Kavita Reddy' }, action: 'approved the PR', timestamp: new Date(now - 26 * 60 * 60 * 1000), color: 'success' },
  { id: 'g4', actor: { name: 'Rahul Verma' }, action: 'left a comment', timestamp: new Date(now - 30 * 60 * 60 * 1000) },
  { id: 'g5', actor: { name: 'Sneha Joshi' }, action: 'completed the review', timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), color: 'success' },
  { id: 'g6', actor: { name: 'Arjun Mehta' }, action: 'updated the description', timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000) },
  { id: 'g7', actor: { name: 'Priya Sharma' }, action: 'reported a blocker', timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000), color: 'error' },
  { id: 'g8', actor: { name: 'Kavita Reddy' }, action: 'created the project', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000), color: 'info' },
]

export const GroupedByTime: Story = {
  name: 'Grouped by Time',
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
  },
  parameters: {
    docs: {
      description: {
        story: 'Items grouped into Today, Yesterday, This Week, and Older buckets with section headers.',
      },
    },
  },
}

export const GroupedByTimeCompact: Story = {
  name: 'Grouped by Time (Compact)',
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
    compact: true,
  },
}

export const GroupedWithCustomLabels: Story = {
  name: 'Grouped with Custom Labels',
  args: {
    items: GROUPED_ITEMS,
    groupBy: 'time',
    groupLabels: {
      today: 'Aaj',
      yesterday: 'Kal',
      thisWeek: 'Is Hafte',
      older: 'Purana',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom Hindi labels via `groupLabels` prop.',
      },
    },
  },
}
