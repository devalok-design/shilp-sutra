import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from './page-header'

const meta: Meta<typeof PageHeader> = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 800 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: 'Projects',
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Projects',
    subtitle: 'Manage and track all active projects across the organization.',
  },
}

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Website Redesign',
    subtitle: 'Due March 15, 2026',
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Projects', href: '#' },
      { label: 'Website Redesign' },
    ],
  },
}

export const WithActions: Story = {
  args: {
    title: 'Team Members',
    subtitle: '12 active members across 3 departments.',
    actions: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-layer-01)',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Export
        </button>
        <button
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#D33163',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Add Member
        </button>
      </div>
    ),
  },
}

export const WithBreadcrumbsAndActions: Story = {
  args: {
    title: 'Sprint Board',
    subtitle: 'Sprint 14 — Feb 24 to Mar 7, 2026',
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Projects', href: '#' },
      { label: 'Mobile App', href: '#' },
      { label: 'Sprint Board' },
    ],
    actions: (
      <button
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#D33163',
          color: '#fff',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        New Task
      </button>
    ),
  },
}

export const SingleBreadcrumb: Story = {
  args: {
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard' }],
  },
}

export const LongTitle: Story = {
  args: {
    title:
      'Enterprise Resource Planning System Migration and Integration Project',
    subtitle:
      'Phase 2 of the digital transformation initiative covering all regional offices.',
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Enterprise', href: '#' },
      { label: 'ERP Migration' },
    ],
  },
}

export const CustomTitleClass: Story = {
  args: {
    title: 'Analytics',
    subtitle: 'Real-time performance metrics and insights.',
    titleClassName: 'text-2xl font-bold',
  },
}
