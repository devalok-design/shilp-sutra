import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { fn } from 'storybook/test'
import {
  RichChatInput,
  type SlashCommandGroup,
  type MentionItem,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikeButton,
  HighlightButton,
  CodeButton,
  BulletListButton,
  OrderedListButton,
  BlockquoteButton,
  LinkButton,
  EmojiButton,
} from './rich-chat-input'
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
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 720 }}>
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

// ── 13. WithVoiceRecording ─────────────────────────────────────────

export const WithVoiceRecording: Story = {
  args: {
    onSubmit: fn(),
    onVoiceRecord: fn(),
    maxDuration: 120,
    placeholder: 'Type or record a voice message...',
  },
}

// ── 14. WithReply ──────────────────────────────────────────────────

export const WithReply: Story = {
  render: function Render() {
    const [reply, setReply] = React.useState<
      { id: string; author: string; preview: string; onDismiss: () => void } | undefined
    >({
      id: '1',
      author: 'Aarav Sharma',
      preview: 'Can you check the latest designs for the dashboard?',
      onDismiss: () => setReply(undefined),
    })
    return (
      <RichChatInput
        onSubmit={fn()}
        replyTo={reply}
        mentions={mentions}
        placeholder="Reply..."
      />
    )
  },
}

// ── 15. FullExperience ─────────────────────────────────────────────

export const FullExperience: Story = {
  args: {
    onSubmit: fn(),
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
    onVoiceRecord: fn(),
    maxDuration: 300,
    maxLength: 4000,
    placeholder: 'Message #general...',
  },
}

// ── 16. ProgressiveDisclosure ──────────────────────────────────────

export const ProgressiveDisclosure: Story = {
  args: {
    onSubmit: fn(),
    mentions,
    onVoiceRecord: fn(),
    placeholder: 'Click here, then start typing to see the toolbar appear...',
  },
}

// ── 17. Inline (Google Chat style) ────────────────────────────────

export const Inline: Story = {
  args: {
    onSubmit: fn(),
    variant: 'inline',
    mentions,
    slashCommands,
    onFileUpload: async (file: File) => {
      await new Promise((r) => setTimeout(r, 1000))
      return { url: '#', name: file.name, size: file.size }
    },
    onVoiceRecord: fn(),
    placeholder: 'Type a message...',
  },
}

// ── 18. Inline with Schedule Send ─────────────────────────────────

export const InlineWithScheduleSend: Story = {
  args: {
    onSubmit: fn(),
    variant: 'inline',
    mentions,
    onVoiceRecord: fn(),
    placeholder: 'Type a message...',
    sendOptions: [
      { label: 'Tomorrow at 8:00 AM', onSelect: () => {} },
      { label: 'Tomorrow at 1:00 PM', onSelect: () => {} },
      { label: 'Next Monday at 8:00 AM', onSelect: () => {} },
    ],
  },
}

// ── 19. Custom Toolbar (Google Chat expanded style) ───────────────

export const CustomToolbar: Story = {
  args: {
    onSubmit: fn(),
    variant: 'inline',
    mentions,
    placeholder: 'Type a message...',
    toolbar: (
      <>
        <ToolbarGroup>
          <BoldButton />
          <ItalicButton />
          <UnderlineButton />
          <HighlightButton />
          <StrikeButton />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <BulletListButton />
          <OrderedListButton />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <BlockquoteButton />
          <LinkButton />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <CodeButton />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <EmojiButton />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarButton onClick={() => alert('AI Refine!')} title="Refine with AI">
          <span className="flex items-center gap-ds-01 text-ds-xs font-medium">✨ Refine</span>
        </ToolbarButton>
      </>
    ),
  },
}
