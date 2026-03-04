import type { Meta, StoryObj } from '@storybook/react'
import { StreamingText } from './streaming-text'

const meta: Meta<typeof StreamingText> = {
  title: 'Karm/Chat/StreamingText',
  component: StreamingText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof StreamingText>

export const ShortText: Story = {
  name: 'Short Text',
  args: {
    text: 'Let me check that for you...',
  },
}

export const PlainParagraph: Story = {
  name: 'Plain Paragraph',
  args: {
    text: 'You have 5 tasks assigned this sprint. Two are in progress and three are waiting in the To Do column. Would you like me to break them down?',
  },
}

export const WithMarkdown: Story = {
  name: 'With Markdown',
  args: {
    text: "Here's your sprint summary:\n\n- **Fix login redirect** — In Progress\n- **Design review** — To Do\n- **Write API docs** — To Do\n\nYou're on track to finish by Friday.",
  },
}

export const WithCodeBlock: Story = {
  name: 'With Code Block',
  args: {
    text: 'Use this endpoint to mark attendance:\n\n```typescript\nawait fetch("/api/attendance", {\n  method: "POST",\n  body: JSON.stringify({ status: "PRESENT" }),\n})\n```\n\nIt returns a confirmation object.',
  },
}

export const WithInlineCode: Story = {
  name: 'With Inline Code',
  args: {
    text: 'The `requireUser()` guard checks your session. If expired, it redirects to `/login`. Make sure your `SESSION_SECRET` environment variable is set.',
  },
}

export const WithOrderedList: Story = {
  name: 'With Ordered List',
  args: {
    text: 'Steps to resolve the attendance issue:\n\n1. Go to **Admin Panel** > **Attendance**\n2. Find the lokwasi in the list\n3. Click **Process Correction**\n4. Select the correct status and confirm',
  },
}

export const LongResponse: Story = {
  name: 'Long Response',
  args: {
    text: "Here's your daily brief for today:\n\n**Attendance**: 14 of 16 team members have marked attendance. Priya and Rahul are still pending.\n\n**Tasks**: 8 tasks were updated yesterday:\n- 3 moved to **Done**\n- 2 moved to **In Progress**\n- 3 new tasks were created\n\n**Break Requests**: 1 pending approval from Amit Kumar (sick leave, 2 days).\n\n**Upcoming**: Sprint review meeting at 3:00 PM today. All task owners should prepare a brief status update.\n\nWould you like me to send attendance reminders or approve the break request?",
  },
}
