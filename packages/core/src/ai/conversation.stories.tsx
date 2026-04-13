import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { IconRobot, IconBrain } from '@tabler/icons-react'
import { AIConversation } from './conversation'
import type { ConversationMessage, ProcessingStep } from './types'
import { AICommandProvider } from './ai-command-provider'

const meta: Meta<typeof AIConversation> = {
  title: 'AI/Conversation',
  component: AIConversation,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra` · **Import:** `import { AIConversation } from "@devalok/shilp-sutra/ai"`\n\nA full conversation view rendering user and assistant messages with support for structured blocks, processing indicators, confirm/undo actions, and auto-scroll.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof AIConversation>

// ── Helpers ───────────────────────────────────────────────────

const now = new Date()

function ago(minutes: number): Date {
  return new Date(now.getTime() - minutes * 60 * 1000)
}

// ── 1. SingleTurn ─────────────────────────────────────────────

const singleTurnMessages: ConversationMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Add Arundhati to all client projects except Acme Corp',
    createdAt: ago(2),
  },
  {
    id: '2',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            "I'll add **Arundhati Thakur** to 10 client projects as ASSIST.",
        },
      },
      {
        type: 'table',
        data: {
          columns: [
            { key: 'project', label: 'Project' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', variant: 'badge' },
          ],
          rows: [
            {
              project: 'Kaizen Waste',
              role: 'ASSIST',
              status: { label: 'Adding', color: 'success' },
            },
            {
              project: 'Mawshi Foods',
              role: 'ASSIST',
              status: { label: 'Adding', color: 'success' },
            },
            {
              project: 'PIERA',
              role: 'ASSIST',
              status: { label: 'Already member', color: 'default' },
            },
          ],
          caption: '10 projects total',
        },
      },
      {
        type: 'confirm',
        data: {
          actionId: 'bulk_add',
          label: 'Add to 10 projects',
          description:
            'This will add Arundhati Thakur as ASSIST to 10 client projects.',
          destructive: false,
        },
      },
    ],
    createdAt: ago(1),
  },
]

export const SingleTurn: Story = {
  args: {
    messages: singleTurnMessages,
    onAction: fn(),
  },
}

// ── 2. MultiTurn ──────────────────────────────────────────────

const multiTurnMessages: ConversationMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'Add Arundhati to all projects',
    createdAt: ago(5),
  },
  {
    id: 'm2',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            "I'll add **Arundhati Thakur** to 10 client projects as ASSIST.",
        },
      },
      {
        type: 'table',
        data: {
          columns: [
            { key: 'project', label: 'Project' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', variant: 'badge' },
          ],
          rows: [
            {
              project: 'Kaizen Waste',
              role: 'ASSIST',
              status: { label: 'Adding', color: 'success' },
            },
            {
              project: 'Mawshi Foods',
              role: 'ASSIST',
              status: { label: 'Adding', color: 'success' },
            },
            {
              project: 'Gaynes Testing',
              role: 'ASSIST',
              status: { label: 'Adding', color: 'success' },
            },
          ],
          caption: '10 projects total',
        },
      },
      {
        type: 'confirm',
        data: {
          actionId: 'bulk_add',
          label: 'Add to 10 projects',
          description:
            'This will add Arundhati Thakur as ASSIST to 10 client projects.',
          destructive: false,
        },
      },
    ],
    createdAt: ago(4),
  },
  {
    id: 'm3',
    role: 'user',
    content: 'Now remove her from Gaynes Testing',
    createdAt: ago(3),
  },
  {
    id: 'm4',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            "I'll remove **Arundhati Thakur** from the Gaynes Testing project.",
        },
      },
      {
        type: 'confirm',
        data: {
          actionId: 'remove_member',
          label: 'Remove from Gaynes Testing',
          description:
            'This will remove Arundhati Thakur from the Gaynes Testing project. She will lose access to all project resources.',
          destructive: true,
        },
      },
    ],
    createdAt: ago(2),
  },
]

export const MultiTurn: Story = {
  args: {
    messages: multiTurnMessages,
    onAction: fn(),
  },
}

// ── 3. Processing ─────────────────────────────────────────────

export const Processing: Story = {
  tags: ['!autodocs'],
  args: {
    messages: [
      {
        id: 'p1',
        role: 'user',
        content: 'Show me all overdue tasks across projects',
        createdAt: ago(1),
      },
    ],
    isProcessing: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Breathing dots animation while the assistant is thinking.',
      },
    },
  },
}

// ── 4. ProcessingWithSteps ────────────────────────────────────

const processingSteps: ProcessingStep[] = [
  { id: 's1', label: 'Querying 24 projects', status: 'done' },
  { id: 's2', label: 'Checking existing memberships', status: 'active' },
  { id: 's3', label: 'Building preview', status: 'pending' },
]

export const ProcessingWithSteps: Story = {
  tags: ['!autodocs'],
  args: {
    messages: [
      {
        id: 'ps1',
        role: 'user',
        content: 'Add Arundhati to all client projects except Acme Corp',
        createdAt: ago(1),
      },
    ],
    isProcessing: true,
    processingSteps,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Step-by-step progress visualization with done, active, and pending states.',
      },
    },
  },
}

// ── 5. WithConfirmAction ──────────────────────────────────────

export const WithConfirmAction: Story = {
  args: {
    messages: [
      {
        id: 'ca1',
        role: 'user',
        content: 'Archive all completed tasks older than 30 days',
        createdAt: ago(2),
      },
      {
        id: 'ca2',
        role: 'assistant',
        blocks: [
          {
            type: 'text',
            data: {
              content:
                'Found **47 completed tasks** older than 30 days across 6 projects.',
            },
          },
          {
            type: 'confirm',
            data: {
              actionId: 'archive_tasks',
              label: 'Archive 47 tasks',
              description:
                'This will archive 47 completed tasks. Archived tasks can be restored from the archive view.',
              destructive: false,
              rationale:
                'These tasks have been in "Done" status for over 30 days and have no active dependencies.',
            },
          },
        ],
        createdAt: ago(1),
      },
    ],
    onAction: fn(),
  },
  argTypes: {
    onAction: { action: 'action' },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Conversation ending with a confirm block. Click "Archive 47 tasks" or "Cancel" to see the action logged.',
      },
    },
  },
}

// ── 6. WithUndoSuccess ────────────────────────────────────────

export const WithUndoSuccess: Story = {
  tags: ['!autodocs'],
  args: {
    messages: [
      {
        id: 'us1',
        role: 'user',
        content: 'Remove Rahul from the PIERA project',
        createdAt: ago(3),
      },
      {
        id: 'us2',
        role: 'assistant',
        blocks: [
          {
            type: 'success',
            id: 'remove_rahul',
            data: {
              title: 'Member removed',
              message:
                'Rahul Verma has been removed from the PIERA project.',
              undoable: true,
              undoTimeout: 10000,
            },
          },
        ],
        createdAt: ago(2),
      },
    ],
    onAction: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'A success block with an undo countdown timer. The undo button disappears after the timeout.',
      },
    },
  },
}

// ── 7. WithErrors ─────────────────────────────────────────────

export const WithErrors: Story = {
  args: {
    messages: [
      {
        id: 'e1',
        role: 'user',
        content: 'Add Arundati to the PIERA project',
        createdAt: ago(2),
      },
      {
        id: 'e2',
        role: 'assistant',
        blocks: [
          {
            type: 'error',
            data: {
              title: 'Member not found',
              message:
                "Couldn't find a lokwasi named 'Arundati'. Did you mean **Arundhati Thakur**?",
              suggestion: 'Try: "Add Arundhati Thakur to the PIERA project"',
            },
          },
        ],
        createdAt: ago(1),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Error block with a suggestion for correcting the user input.',
      },
    },
  },
}

// ── 8. LongConversation ───────────────────────────────────────

const longMessages: ConversationMessage[] = [
  {
    id: 'l1',
    role: 'user',
    content: 'What projects is Priya working on?',
    createdAt: ago(12),
  },
  {
    id: 'l2',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            'Priya Sharma is currently assigned to **3 projects**:',
        },
      },
      {
        type: 'table',
        data: {
          columns: [
            { key: 'project', label: 'Project' },
            { key: 'role', label: 'Role' },
            { key: 'tasks', label: 'Open Tasks', variant: 'number' },
          ],
          rows: [
            { project: 'Kaizen Waste', role: 'LEAD', tasks: 5 },
            { project: 'Mawshi Foods', role: 'ASSIST', tasks: 3 },
            { project: 'PIERA', role: 'ASSIST', tasks: 8 },
          ],
        },
      },
    ],
    createdAt: ago(11),
  },
  {
    id: 'l3',
    role: 'user',
    content: 'How many overdue tasks does she have?',
    createdAt: ago(10),
  },
  {
    id: 'l4',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            'Priya has **2 overdue tasks**, both in the PIERA project.',
        },
      },
      {
        type: 'table',
        data: {
          columns: [
            { key: 'task', label: 'Task' },
            { key: 'due', label: 'Due Date' },
            { key: 'status', label: 'Status', variant: 'badge' },
          ],
          rows: [
            {
              task: 'Finalize design mockups',
              due: '2026-03-10',
              status: { label: 'Overdue', color: 'error' },
            },
            {
              task: 'Review client feedback',
              due: '2026-03-12',
              status: { label: 'Overdue', color: 'error' },
            },
          ],
        },
      },
    ],
    createdAt: ago(9),
  },
  {
    id: 'l5',
    role: 'user',
    content: 'Reassign the design mockups task to Kavita',
    createdAt: ago(8),
  },
  {
    id: 'l6',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            "I'll reassign **Finalize design mockups** from Priya Sharma to Kavita Reddy.",
        },
      },
      {
        type: 'confirm',
        data: {
          actionId: 'reassign_task',
          label: 'Reassign task',
          description:
            'This will reassign the task and notify both Priya and Kavita.',
          destructive: false,
        },
      },
    ],
    createdAt: ago(7),
  },
  {
    id: 'l7',
    role: 'user',
    content: 'Yes, go ahead',
    createdAt: ago(6),
  },
  {
    id: 'l8',
    role: 'assistant',
    blocks: [
      {
        type: 'success',
        id: 'reassign_task',
        data: {
          title: 'Task reassigned',
          message:
            '"Finalize design mockups" has been reassigned to Kavita Reddy.',
          undoable: false,
        },
      },
    ],
    createdAt: ago(5),
  },
  {
    id: 'l9',
    role: 'user',
    content: 'Now extend the due date for the feedback review to March 20',
    createdAt: ago(4),
  },
  {
    id: 'l10',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content:
            'Updated the due date for **Review client feedback** to **March 20, 2026**.',
        },
      },
      {
        type: 'success',
        id: 'update_due',
        data: {
          title: 'Due date updated',
          message:
            'Review client feedback is now due March 20, 2026.',
          undoable: true,
          undoTimeout: 8000,
        },
      },
    ],
    createdAt: ago(3),
  },
]

export const LongConversation: Story = {
  args: {
    messages: longMessages,
    maxHeight: 400,
    onAction: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'A long conversation with `maxHeight={400}` to demonstrate scrollable overflow and auto-scroll behavior.',
      },
    },
  },
}

// ── 9. WithAgentIcon ──────────────────────────────────────────

export const WithAgentIcon: Story = {
  args: {
    messages: [
      {
        id: 'ai1',
        role: 'user',
        content: 'What is the project status for Kaizen Waste?',
        createdAt: ago(2),
      },
      {
        id: 'ai2',
        role: 'assistant',
        blocks: [
          {
            type: 'text',
            data: {
              content:
                'Kaizen Waste is **on track** with 12 of 18 tasks completed.',
            },
          },
          {
            type: 'stat_row',
            data: {
              stats: [
                { label: 'Completed', value: 12 },
                { label: 'In Progress', value: 4 },
                { label: 'Blocked', value: 2 },
              ],
            },
          },
        ],
        createdAt: ago(1),
      },
    ],
    agent: { name: 'Devadoot', icon: <IconBrain size={16} /> },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Custom agent name and icon passed via the `agent` prop.',
      },
    },
  },
}

// ── 10. WithContextProvider ───────────────────────────────────

const contextMessages: ConversationMessage[] = [
  {
    id: 'cp1',
    role: 'user',
    content: 'Show me the dashboard summary',
    createdAt: ago(2),
  },
  {
    id: 'cp2',
    role: 'assistant',
    blocks: [
      {
        type: 'text',
        data: {
          content: 'Here is your dashboard summary for today:',
        },
      },
      {
        type: 'stat_row',
        data: {
          stats: [
            {
              label: 'Active Projects',
              value: 14,
              change: { value: '+2', direction: 'up' },
            },
            {
              label: 'Open Tasks',
              value: 87,
              change: { value: '-5', direction: 'down' },
            },
            {
              label: 'Overdue',
              value: 3,
              change: { value: '+1', direction: 'up' },
            },
          ],
        },
      },
    ],
    createdAt: ago(1),
  },
]

const contextOnAction = fn()

export const WithContextProvider: Story = {
  render: () => (
    <AICommandProvider
      agent={{ name: 'Devadoot', icon: <IconRobot size={16} /> }}
      onAction={contextOnAction}
    >
      <AIConversation messages={contextMessages} />
    </AICommandProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Agent name and icon provided via `AICommandProvider` context instead of direct props. The conversation inherits agent configuration from the provider.',
      },
    },
  },
}
