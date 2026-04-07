import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { fn } from 'storybook/test'
import { RichChatInput, type SlashCommandGroup } from './rich-chat-input'
import type { MentionItem } from './rich-text-editor'
import {
  IconLayoutDashboard,
  IconListCheck,
  IconUsers,
  IconCalendar,
} from '@tabler/icons-react'

// ── Shared data ─────────────────────────────────────────────────────

const mentions: MentionItem[] = [
  { id: '1', label: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?u=aarav' },
  { id: '2', label: 'Priya Patel', avatar: 'https://i.pravatar.cc/150?u=priya' },
  { id: '3', label: 'Rohan Gupta', avatar: 'https://i.pravatar.cc/150?u=rohan' },
]

const slashCommands: SlashCommandGroup[] = [
  {
    label: 'Navigation',
    commands: [
      { id: 'dashboard', label: 'Dashboard', description: 'Go to dashboard', icon: IconLayoutDashboard, action: () => {} },
      { id: 'tasks', label: 'Tasks', description: 'View all tasks', icon: IconListCheck, action: () => {} },
      { id: 'team', label: 'Team', description: 'View team members', icon: IconUsers, action: () => {} },
    ],
  },
  {
    label: 'Insert',
    commands: [
      { id: 'meeting', label: 'Meeting', description: 'Schedule a meeting', icon: IconCalendar, action: () => {} },
    ],
  },
]

// ── Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof RichChatInput> = {
  title: 'Composed/RichChatInput',
  component: RichChatInput,
  tags: ['autodocs', 'stable'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof RichChatInput>

// ── 1. Default ──────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    onSubmit: fn(),
    placeholder: 'Type a message...',
    mentions,
    slashCommands,
    onFileUpload: async (file: File) => {
      await new Promise((r) => setTimeout(r, 1000))
      return { url: '#', name: file.name, size: file.size }
    },
    onImageUpload: async () => {
      await new Promise((r) => setTimeout(r, 1000))
      return 'https://placehold.co/200x200/6366F1/ffffff?text=Uploaded'
    },
  },
}

// ── 2. Expanded ─────────────────────────────────────────────────────

export const Expanded: Story = {
  args: {
    onSubmit: fn(),
    variant: 'expanded',
    placeholder: 'Describe what you need...',
  },
}

// ── 3. Minimal ──────────────────────────────────────────────────────

export const Minimal: Story = {
  args: {
    onSubmit: fn(),
    variant: 'minimal',
    placeholder: 'Quick reply...',
  },
}

// ── 4. WithMentions ─────────────────────────────────────────────────

export const WithMentions: Story = {
  args: {
    onSubmit: fn(),
    mentions,
    placeholder: 'Type @ to mention someone...',
  },
}

// ── 5. WithSlashCommands ────────────────────────────────────────────

export const WithSlashCommands: Story = {
  args: {
    onSubmit: fn(),
    slashCommands,
    placeholder: 'Type / for commands...',
  },
}

// ── 6. WithFileUpload ───────────────────────────────────────────────

export const WithFileUpload: Story = {
  args: {
    onSubmit: fn(),
    onFileUpload: fn(async (file: File) => {
      await new Promise((r) => setTimeout(r, 1000))
      return { url: '#', name: file.name, size: file.size }
    }),
    onImageUpload: fn(async (_file: File) => {
      await new Promise((r) => setTimeout(r, 800))
      return 'https://placehold.co/400x200/1a1a2e/e0e0e0?text=Uploaded'
    }),
    placeholder: 'Drop files or images here...',
  },
}

// ── 7. Streaming ────────────────────────────────────────────────────

export const Streaming: Story = {
  args: {
    onSubmit: fn(),
    isStreaming: true,
    onCancel: fn(),
    placeholder: 'AI is responding...',
  },
}

// ── 8. WithCharacterLimit ───────────────────────────────────────────

export const WithCharacterLimit: Story = {
  args: {
    onSubmit: fn(),
    maxLength: 280,
    placeholder: 'Keep it short...',
  },
}

// ── 9. EnterForNewline ──────────────────────────────────────────────

export const EnterForNewline: Story = {
  args: {
    onSubmit: fn(),
    enterBehavior: 'newline',
    placeholder: 'Enter adds a new line. Cmd/Ctrl+Enter sends.',
  },
}

// ── 10. AllVariants ─────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>
          Compact (default)
        </p>
        <RichChatInput onSubmit={() => {}} placeholder="Compact variant..." />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>
          Expanded
        </p>
        <RichChatInput onSubmit={() => {}} variant="expanded" placeholder="Expanded variant..." />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>
          Minimal
        </p>
        <RichChatInput onSubmit={() => {}} variant="minimal" placeholder="Minimal variant..." />
      </div>
    </div>
  ),
}

// ── 11. WithDisclaimer ──────────────────────────────────────────────

export const WithDisclaimer: Story = {
  args: {
    onSubmit: fn(),
    disclaimer: 'AI-generated content may be inaccurate.',
    placeholder: 'Ask anything...',
  },
}

// ── 12. Mobile ──────────────────────────────────────────────────────

export const Mobile: Story = {
  args: {
    onSubmit: fn(),
    placeholder: 'Type a message...',
  },
  globals: { viewport: 'mobile' },
}
