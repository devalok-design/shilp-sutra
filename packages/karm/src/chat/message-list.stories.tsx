import type { Meta, StoryObj } from '@storybook/react'
import { MessageList, type ChatMessage } from './message-list'

const meta: Meta<typeof MessageList> = {
  title: 'Karm/Chat/MessageList',
  component: MessageList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 480,
          height: 500,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof MessageList>

// ── Mock data ──────────────────────────────────────────────

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'USER',
    content: 'What tasks are assigned to me this sprint?',
  },
  {
    id: '2',
    role: 'ASSISTANT',
    content:
      'You have **3 tasks** assigned this sprint:\n\n1. **Fix login redirect bug** — *In Progress*\n2. **Design review for client portal** — *To Do*\n3. **Write API documentation** — *To Do*\n\nWould you like me to update the status of any of these?',
  },
  {
    id: '3',
    role: 'USER',
    content: 'Can you mark the design review as in progress?',
  },
  {
    id: '4',
    role: 'ASSISTANT',
    content:
      "Done! I've moved **Design review for client portal** to *In Progress*. You now have 2 tasks in progress and 1 remaining in To Do.",
  },
]

const MESSAGES_WITH_CODE: ChatMessage[] = [
  {
    id: '1',
    role: 'USER',
    content: 'How do I use the attendance API?',
  },
  {
    id: '2',
    role: 'ASSISTANT',
    content:
      'Here\'s how to mark attendance via the API:\n\n```typescript\nconst response = await fetch("/api/attendance", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ status: "PRESENT" }),\n})\n```\n\nThe endpoint returns `{ success: true, attendanceId: string }` on success.',
  },
]

const MESSAGES_WITH_SYSTEM: ChatMessage[] = [
  {
    id: '1',
    role: 'USER',
    content: 'Delete the entire project database.',
  },
  {
    id: '2',
    role: 'SYSTEM',
    content:
      'This action is not permitted. Contact an administrator for destructive operations.',
  },
  {
    id: '3',
    role: 'ASSISTANT',
    content:
      "I'm unable to delete the project database. That operation requires SuperAdmin access and must be performed through the admin panel. Would you like me to help with something else?",
  },
]

const LONG_CONVERSATION: ChatMessage[] = [
  {
    id: '1',
    role: 'USER',
    content: 'Good morning! How is the team doing today?',
  },
  {
    id: '2',
    role: 'ASSISTANT',
    content:
      "Good morning! Here's a quick overview:\n\n- **12 of 15** team members have marked attendance\n- **3 tasks** were completed yesterday\n- **2 break requests** are pending approval",
  },
  { id: '3', role: 'USER', content: "Who hasn't marked attendance yet?" },
  {
    id: '4',
    role: 'ASSISTANT',
    content:
      'The following lokwasi have not yet marked attendance:\n\n1. Priya Sharma\n2. Rahul Verma\n3. Anika Patel\n\nShall I send them a reminder?',
  },
  { id: '5', role: 'USER', content: 'Yes, send a reminder to all three.' },
  {
    id: '6',
    role: 'ASSISTANT',
    content:
      'Reminders sent to **Priya Sharma**, **Rahul Verma**, and **Anika Patel**. They will receive a notification on their dashboard and via email.',
  },
  { id: '7', role: 'USER', content: 'What about the pending break requests?' },
  {
    id: '8',
    role: 'ASSISTANT',
    content:
      'There are **2 pending break requests**:\n\n1. **Amit Kumar** — Sick leave, 2 days (Mar 3-4)\n2. **Sneha Joshi** — Personal leave, 1 day (Mar 5)\n\nWould you like to approve or reject any of these?',
  },
]

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    messages: SAMPLE_MESSAGES,
  },
}

export const Empty: Story = {
  args: {
    messages: [],
  },
}

export const EmptyCustomText: Story = {
  name: 'Empty with Custom Text',
  args: {
    messages: [],
    emptyTitle: 'Sutradhar',
    emptyDescription:
      'I can help you manage tasks, track progress, and organize your projects.',
  },
}

export const Loading: Story = {
  args: {
    messages: [],
    isLoadingMessages: true,
  },
}

export const WithCodeBlocks: Story = {
  name: 'With Code Blocks',
  args: {
    messages: MESSAGES_WITH_CODE,
  },
}

export const WithSystemMessage: Story = {
  name: 'With System Message',
  args: {
    messages: MESSAGES_WITH_SYSTEM,
  },
}

export const StreamingWithText: Story = {
  name: 'Streaming (Text Arriving)',
  args: {
    messages: [SAMPLE_MESSAGES[0]],
    isStreaming: true,
    streamingText:
      'Let me check your tasks for this sprint. I can see you have **3 tasks** assigned...',
  },
}

export const StreamingPending: Story = {
  name: 'Streaming (Waiting for Response)',
  args: {
    messages: [SAMPLE_MESSAGES[0]],
    isStreaming: true,
    streamingText: '',
  },
}

export const LongConversation: Story = {
  name: 'Long Conversation',
  args: {
    messages: LONG_CONVERSATION,
  },
}
