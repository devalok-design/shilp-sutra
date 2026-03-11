import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ConversationTab, type Comment } from './conversation-tab'

// ============================================================
// Mock Data
// ============================================================

const now = new Date()
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

const internalComments: Comment[] = [
  {
    id: 'c-1',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: 'I have started working on the API integration. The endpoint documentation from the vendor is incomplete so I am reverse-engineering from their Swagger spec.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    internalAuthor: {
      id: 'user-1',
      name: 'Arjun Mehta',
      email: 'arjun@devalok.com',
      image: null,
    },
  },
  {
    id: 'c-2',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-2',
    content: 'Good catch. I ran into the same issue last quarter. Check the internal wiki under "Vendor API Quirks" - there are some notes that might help.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    internalAuthor: {
      id: 'user-2',
      name: 'Priya Sharma',
      email: 'priya@devalok.com',
      image: null,
    },
  },
  {
    id: 'c-3',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: 'Thanks Priya! That wiki page was exactly what I needed. The auth flow uses a non-standard token refresh mechanism. I have it working now.',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    internalAuthor: {
      id: 'user-1',
      name: 'Arjun Mehta',
      email: 'arjun@devalok.com',
      image: null,
    },
  },
]

const mixedComments: Comment[] = [
  {
    id: 'mc-1',
    taskId: 'task-2',
    authorType: 'INTERNAL',
    authorId: 'user-2',
    content: 'The wireframes have been uploaded for review. Please take a look at the navigation flow and let us know if the multi-step form approach works for your team.',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    internalAuthor: {
      id: 'user-2',
      name: 'Priya Sharma',
      email: 'priya@devalok.com',
      image: null,
    },
  },
  {
    id: 'mc-2',
    taskId: 'task-2',
    authorType: 'CLIENT',
    authorId: 'client-1',
    content: 'The navigation looks great! One concern: can we add a "Save as Draft" option on step 2? Our users often get interrupted and lose their progress.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    clientAuthor: {
      id: 'client-1',
      name: 'Rohan Gupta',
      email: 'rohan@acmecorp.in',
    },
  },
  {
    id: 'mc-3',
    taskId: 'task-2',
    authorType: 'INTERNAL',
    authorId: 'user-3',
    content: 'Great feedback Rohan. We can definitely add auto-save with draft persistence. I will create a subtask for that. Should be ready by end of this sprint.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    internalAuthor: {
      id: 'user-3',
      name: 'Kavita Reddy',
      email: 'kavita@devalok.com',
      image: null,
    },
  },
  {
    id: 'mc-4',
    taskId: 'task-2',
    authorType: 'CLIENT',
    authorId: 'client-1',
    content: 'Perfect, thank you! Also, could the form validation messages be shown inline rather than at the top? Our QA team flagged that as a usability issue.',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
    clientAuthor: {
      id: 'client-1',
      name: 'Rohan Gupta',
      email: 'rohan@acmecorp.in',
    },
  },
  {
    id: 'mc-5',
    taskId: 'task-2',
    authorType: 'INTERNAL',
    authorId: 'user-2',
    content: 'Absolutely, inline validation is already part of our design system. I will update the wireframes today.',
    createdAt: minutesAgo(45),
    updatedAt: minutesAgo(45),
    internalAuthor: {
      id: 'user-2',
      name: 'Priya Sharma',
      email: 'priya@devalok.com',
      image: null,
    },
  },
]

const htmlComment: Comment[] = [
  {
    id: 'html-1',
    taskId: 'task-3',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: '<p>Here is the <strong>updated spec</strong> with the following changes:</p><ul><li>New auth flow</li><li>Rate limiting on <code>/api/upload</code></li></ul>',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    internalAuthor: {
      id: 'user-1',
      name: 'Arjun Mehta',
      email: 'arjun@devalok.com',
      image: null,
    },
  },
]

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof ConversationTab> = {
  title: 'Karm/Tasks/ConversationTab',
  component: ConversationTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ConversationTab } from "@devalok/shilp-sutra-karm/tasks"`',
      },
    },
  },
  args: {
    onPostComment: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ConversationTab>

// ============================================================
// Stories
// ============================================================

/** Internal-only conversation thread between staff members */
export const InternalConversation: Story = {
  args: {
    comments: internalComments,
    taskVisibility: 'INTERNAL',
  },
}

/** Mixed staff and client conversation on a task visible to everyone */
export const MixedStaffAndClient: Story = {
  args: {
    comments: mixedComments,
    taskVisibility: 'EVERYONE',
  },
}

/** Empty state with no comments yet */
export const Empty: Story = {
  args: {
    comments: [],
    taskVisibility: 'INTERNAL',
  },
}

/** Client portal mode: client sees "Team" badge on staff comments */
export const ClientMode: Story = {
  args: {
    comments: mixedComments,
    taskVisibility: 'EVERYONE',
    clientMode: true,
  },
}

/** Staff view with visibility warning for client-visible tasks */
export const VisibilityWarning: Story = {
  args: {
    comments: internalComments.slice(0, 1),
    taskVisibility: 'EVERYONE',
    clientMode: false,
  },
}

/** Comment with HTML content rendered via RichTextViewer */
export const HtmlContent: Story = {
  args: {
    comments: htmlComment,
    taskVisibility: 'INTERNAL',
  },
}

/** Single comment in thread */
export const SingleComment: Story = {
  args: {
    comments: [internalComments[0]],
    taskVisibility: 'INTERNAL',
  },
}

/** Plain textarea fallback (richText disabled) */
export const PlainTextFallback: Story = {
  args: {
    comments: internalComments,
    taskVisibility: 'INTERNAL',
    richText: false,
  },
}
