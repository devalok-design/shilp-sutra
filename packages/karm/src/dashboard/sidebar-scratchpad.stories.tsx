import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SidebarScratchpad } from './sidebar-scratchpad'
import type { ScratchpadItem } from './scratchpad-widget'

const meta: Meta<typeof SidebarScratchpad> = {
  title: 'Karm/Dashboard/SidebarScratchpad',
  component: SidebarScratchpad,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { SidebarScratchpad } from "@devalok/shilp-sutra-karm/dashboard"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 260, border: '1px solid var(--color-border)', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onToggle: { action: 'toggle' },
  },
}
export default meta
type Story = StoryObj<typeof SidebarScratchpad>

// ── Mock data ──────────────────────────────────────────────

const ITEMS: ScratchpadItem[] = [
  { id: 's1', text: 'Review PR #142', done: false },
  { id: 's2', text: 'Reply to Priya', done: true },
  { id: 's3', text: 'Push hotfix', done: false },
  { id: 's4', text: 'Update docs', done: false },
]

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    items: ITEMS,
    onToggle: fn('toggle'),
    badgeCount: 3,
  },
}

export const Collapsed: Story = {
  args: {
    items: ITEMS,
    onToggle: fn('toggle'),
    defaultOpen: false,
    badgeCount: 3,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    onToggle: fn('toggle'),
  },
}
