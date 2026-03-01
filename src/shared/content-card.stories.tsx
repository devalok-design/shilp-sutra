import type { Meta, StoryObj } from '@storybook/react'
import { ContentCard } from './content-card'

const meta: Meta<typeof ContentCard> = {
  title: 'Shared/ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ContentCard>

export const Default: Story = {
  args: {
    children: (
      <div>
        <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
          This is a default content card with standard padding and border styling.
        </p>
      </div>
    ),
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outline',
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
        Outlined variant with transparent background and secondary border.
      </p>
    ),
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
        Ghost variant with no visible border until hover.
      </p>
    ),
  },
}

export const CompactPadding: Story = {
  args: {
    padding: 'compact',
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
        Compact padding for tight layouts.
      </p>
    ),
  },
}

export const SpaciousPadding: Story = {
  args: {
    padding: 'spacious',
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
        Spacious padding for comfortable reading.
      </p>
    ),
  },
}

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div style={{ padding: 20 }}>
        <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 14 }}>
          No padding variant — content manages its own spacing.
        </p>
      </div>
    ),
  },
}

export const WithHeaderTitle: Story = {
  args: {
    headerTitle: 'Recent Activity',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          Ankit pushed 3 commits to main
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          Priya updated task status to In Review
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          Rohan added a comment on Sprint Board
        </p>
      </div>
    ),
  },
}

export const WithHeaderTitleAndActions: Story = {
  args: {
    headerTitle: 'Team Members',
    headerActions: (
      <button
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--color-border-default)',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        View All
      </button>
    ),
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
        8 active members this week.
      </p>
    ),
  },
}

export const WithCustomHeader: Story = {
  args: {
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Production — Healthy
        </span>
      </div>
    ),
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
        All systems operational. Uptime: 99.98%
      </p>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    headerTitle: 'Monthly Report',
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--color-border-default)',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            background: '#D33163',
            color: '#fff',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Download
        </button>
      </div>
    ),
    children: (
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13 }}>
        Revenue: Rs. 4,82,000 | Expenses: Rs. 2,15,000 | Profit: Rs. 2,67,000
      </p>
    ),
  },
}

export const FullFeatured: Story = {
  args: {
    variant: 'default',
    padding: 'spacious',
    headerTitle: 'Sprint Overview',
    headerActions: (
      <span
        style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 9999,
          background: 'var(--color-success-surface)',
          color: 'var(--color-text-success)',
          fontWeight: 600,
        }}
      >
        Active
      </span>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-placeholder)' }}>
          Last updated 2 hours ago
        </span>
        <button
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--color-border-default)',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Details
        </button>
      </div>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Completed</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            18 / 24
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'var(--color-field)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '75%', height: '100%', background: '#D33163', borderRadius: 2 }} />
        </div>
      </div>
    ),
  },
}
