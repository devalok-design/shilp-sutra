import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { IconClipboardList } from '@tabler/icons-react'
import { ScratchpadWidget, type ScratchpadItem } from './scratchpad-widget'

const meta: Meta<typeof ScratchpadWidget> = {
  title: 'Karm/Dashboard/ScratchpadWidget',
  component: ScratchpadWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ScratchpadWidget } from "@devalok/shilp-sutra-karm/dashboard"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onToggle: { action: 'toggle' },
    onAdd: { action: 'add' },
    onDelete: { action: 'delete' },
  },
}
export default meta
type Story = StoryObj<typeof ScratchpadWidget>

// ── Mock data ──────────────────────────────────────────────

const SAMPLE_ITEMS: ScratchpadItem[] = [
  { id: 's1', text: 'Review PR #142 — auth middleware', done: false },
  { id: 's2', text: 'Reply to Priya about design tokens', done: true },
  { id: 's3', text: 'Push hotfix for payment timeout', done: false },
]

const ALL_DONE_ITEMS: ScratchpadItem[] = [
  { id: 'ad1', text: 'Merge feature branch', done: true },
  { id: 'ad2', text: 'Update CHANGELOG', done: true },
  { id: 'ad3', text: 'Deploy to staging', done: true },
]

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    items: SAMPLE_ITEMS,
    onToggle: action('toggle'),
    onAdd: action('add'),
    onDelete: action('delete'),
  },
}

export const Empty: Story = {
  args: {
    items: [],
    onToggle: action('toggle'),
    onAdd: action('add'),
    onDelete: action('delete'),
    emptyIcon: IconClipboardList,
  },
}

export const AllDone: Story = {
  name: 'All Done',
  args: {
    items: ALL_DONE_ITEMS,
    onToggle: action('toggle'),
    onAdd: action('add'),
    onDelete: action('delete'),
  },
}

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
    onToggle: action('toggle'),
    onAdd: action('add'),
    onDelete: action('delete'),
  },
}

export const WithCustomTitle: Story = {
  name: 'With Custom Title',
  args: {
    items: SAMPLE_ITEMS,
    title: 'Today\'s Focus',
    resetLabel: 'Resets every morning at 6:00 AM',
    onToggle: action('toggle'),
    onAdd: action('add'),
    onDelete: action('delete'),
  },
}
