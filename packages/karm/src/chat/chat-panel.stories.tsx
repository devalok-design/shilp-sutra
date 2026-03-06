import type { Meta, StoryObj } from '@storybook/react'
import { ChatPanel, type ChatPanelProps } from './chat-panel'
import type { ChatMessage } from './message-list'
import type { Conversation } from './conversation-list'

const meta: Meta<typeof ChatPanel> = {
  title: 'Karm/Chat/ChatPanel',
  component: ChatPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ChatPanel } from "@devalok/shilp-sutra-karm/chat"`',
      },
    },
  },
  argTypes: {
    onSendMessage: { action: 'sendMessage' },
    onCancelStream: { action: 'cancelStream' },
    onSelectAgent: { action: 'selectAgent' },
    onStartNewChat: { action: 'startNewChat' },
    onSelectConversation: { action: 'selectConversation' },
    onArchiveConversation: { action: 'archiveConversation' },
    onDeleteConversation: { action: 'deleteConversation' },
    onOpenChange: { action: 'openChange' },
  },
}
export default meta
type Story = StoryObj<typeof ChatPanel>

// ── Mock data ──────────────────────────────────────────────

const now = new Date()
function minutesAgo(min: number): string {
  return new Date(now.getTime() - min * 60000).toISOString()
}
function hoursAgo(hrs: number): string {
  return new Date(now.getTime() - hrs * 3600000).toISOString()
}
function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 86400000).toISOString()
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'USER',
    content: 'What tasks are assigned to me this sprint?',
  },
  {
    id: 'msg-2',
    role: 'ASSISTANT',
    content:
      "You have **4 tasks** assigned this sprint:\n\n1. **Fix login redirect bug** — *In Progress* (Due: Mar 3)\n2. **Design review for client portal** — *To Do* (Due: Mar 5)\n3. **Write API documentation** — *To Do* (Due: Mar 6)\n4. **Refactor notification service** — *To Do* (Due: Mar 7)\n\nYou're making good progress! Would you like to update any of these?",
  },
  {
    id: 'msg-3',
    role: 'USER',
    content: 'Move the design review to in progress.',
  },
  {
    id: 'msg-4',
    role: 'ASSISTANT',
    content:
      'Done! **Design review for client portal** has been moved to *In Progress*. You now have 2 tasks in progress and 2 in To Do.',
  },
]

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Sprint planning help for Q2',
    updatedAt: minutesAgo(5),
  },
  {
    id: 'conv-2',
    title: 'Break request policy questions',
    updatedAt: hoursAgo(2),
  },
  {
    id: 'conv-3',
    title: 'Client portal redesign brainstorm',
    updatedAt: hoursAgo(8),
  },
  {
    id: 'conv-4',
    title: 'How to set up Google Calendar sync',
    updatedAt: daysAgo(1),
  },
  { id: 'conv-5', title: 'API documentation review', updatedAt: daysAgo(3) },
]

const BASE_ARGS: Partial<ChatPanelProps> = {
  isOpen: true,
  messages: MOCK_MESSAGES,
  conversations: MOCK_CONVERSATIONS,
  selectedAgentId: 'devadoot',
  activeConversationId: 'conv-1',
}

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    ...BASE_ARGS,
  },
}

export const EmptyChat: Story = {
  name: 'Empty Chat (New Conversation)',
  args: {
    ...BASE_ARGS,
    messages: [],
    activeConversationId: null,
  },
}

export const StreamingResponse: Story = {
  name: 'Streaming Response',
  args: {
    ...BASE_ARGS,
    messages: [MOCK_MESSAGES[0]],
    isStreaming: true,
    streamingText:
      'Let me look up your assigned tasks for this sprint. I can see you have **4 tasks**...',
  },
}

export const StreamingWaiting: Story = {
  name: 'Streaming (Waiting for First Token)',
  args: {
    ...BASE_ARGS,
    messages: [MOCK_MESSAGES[0]],
    isStreaming: true,
    streamingText: '',
  },
}

export const WithSutradharAgent: Story = {
  name: 'Sutradhar Agent Selected',
  args: {
    ...BASE_ARGS,
    selectedAgentId: 'sutradhar',
  },
}

export const WithPrahariAgent: Story = {
  name: 'Prahari Agent Selected',
  args: {
    ...BASE_ARGS,
    selectedAgentId: 'prahari',
    messages: [
      {
        id: 'p1',
        role: 'USER' as const,
        content: 'Who missed attendance today?',
      },
      {
        id: 'p2',
        role: 'ASSISTANT' as const,
        content:
          "**3 lokwasi** have not marked attendance today:\n\n1. Priya Sharma\n2. Rahul Verma\n3. Anika Patel\n\nI've already sent the first reminder. The second reminder will go out at 1:00 PM if they haven't marked by then.",
      },
    ],
  },
}

export const LoadingMessages: Story = {
  name: 'Loading Messages',
  args: {
    ...BASE_ARGS,
    isLoadingMessages: true,
    messages: [],
  },
}

export const LoadingConversations: Story = {
  name: 'Loading Conversations',
  args: {
    ...BASE_ARGS,
    isLoadingConversations: true,
    conversations: [],
  },
}

export const Closed: Story = {
  args: {
    ...BASE_ARGS,
    isOpen: false,
  },
}
