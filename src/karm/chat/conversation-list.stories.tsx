import type { Meta, StoryObj } from '@storybook/react'
import { ConversationList, type Conversation } from './conversation-list'

const meta: Meta<typeof ConversationList> = {
  title: 'Karm/Chat/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, height: 500, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSelect: { action: 'select' },
    onNewChat: { action: 'newChat' },
    onArchive: { action: 'archive' },
    onDelete: { action: 'delete' },
  },
}
export default meta
type Story = StoryObj<typeof ConversationList>

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

const CONVERSATIONS: Conversation[] = [
  { id: 'conv-1', title: 'Sprint planning help for Q2', updatedAt: minutesAgo(2) },
  { id: 'conv-2', title: 'Break request policy questions', updatedAt: minutesAgo(45) },
  { id: 'conv-3', title: 'Client portal redesign brainstorm', updatedAt: hoursAgo(3) },
  { id: 'conv-4', title: 'How to set up Google Calendar sync', updatedAt: hoursAgo(18) },
  { id: 'conv-5', title: 'API documentation review', updatedAt: daysAgo(2) },
  { id: 'conv-6', title: null, updatedAt: daysAgo(5) },
  { id: 'conv-7', title: 'Attendance correction request', updatedAt: daysAgo(10) },
]

// ── Stories ─────────────────────────────────────────────────

export const Default: Story = {
  args: {
    conversations: CONVERSATIONS,
  },
}

export const WithActiveConversation: Story = {
  name: 'With Active Conversation',
  args: {
    conversations: CONVERSATIONS,
    activeConversationId: 'conv-2',
  },
}

export const Empty: Story = {
  args: {
    conversations: [],
  },
}

export const Loading: Story = {
  args: {
    conversations: [],
    isLoading: true,
  },
}

export const SingleConversation: Story = {
  name: 'Single Conversation',
  args: {
    conversations: [CONVERSATIONS[0]],
    activeConversationId: 'conv-1',
  },
}

export const WithoutArchiveOrDelete: Story = {
  name: 'Without Archive/Delete Actions',
  args: {
    conversations: CONVERSATIONS,
    onArchive: undefined,
    onDelete: undefined,
  },
}

export const ManyConversations: Story = {
  name: 'Many Conversations (Scrollable)',
  args: {
    conversations: [
      ...CONVERSATIONS,
      { id: 'conv-8', title: 'Deployment checklist for v2.3', updatedAt: daysAgo(12) },
      { id: 'conv-9', title: 'Team bandwidth allocation', updatedAt: daysAgo(14) },
      { id: 'conv-10', title: 'Database migration questions', updatedAt: daysAgo(16) },
      { id: 'conv-11', title: 'Onboarding new team member', updatedAt: daysAgo(20) },
      { id: 'conv-12', title: 'Performance review prep', updatedAt: daysAgo(25) },
    ],
  },
}
