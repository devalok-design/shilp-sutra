import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconListCheck,
  IconUsers,
  IconPlus,
  IconSearch,
  IconCalendarEvent,
  IconChartBar,
  IconRobot,
  IconSettings,
  IconBell,
} from '@tabler/icons-react'
import { CommandBar } from './command-bar'
import { AIConversation } from './conversation'
import { BlockRenderer } from './block-renderer'
import { AICommandProvider } from './ai-command-provider'
import type { CommandGroup } from '../composed/command-palette'
import type { ConversationMessage, Block, ProcessingStep } from './types'

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const pagesGroup: CommandGroup = {
  label: 'Pages',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Go to the main dashboard',
      icon: <IconLayoutDashboard />,
      shortcut: 'G D',
      onSelect: () => console.log('Navigate to Dashboard'),
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'View all projects',
      icon: <IconLayoutKanban />,
      shortcut: 'G P',
      onSelect: () => console.log('Navigate to Projects'),
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      description: 'View your assigned tasks',
      icon: <IconListCheck />,
      shortcut: 'G T',
      onSelect: () => console.log('Navigate to Tasks'),
    },
    {
      id: 'team',
      label: 'Team',
      description: 'View team members and bandwidth',
      icon: <IconUsers />,
      onSelect: () => console.log('Navigate to Team'),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      description: 'Attendance and schedule',
      icon: <IconCalendarEvent />,
      onSelect: () => console.log('Navigate to Calendar'),
    },
  ],
}

const actionsGroup: CommandGroup = {
  label: 'Actions',
  items: [
    {
      id: 'new-task',
      label: 'Create New Task',
      description: 'Add a task to any project board',
      icon: <IconPlus />,
      shortcut: 'C',
      onSelect: () => console.log('Create new task'),
    },
    {
      id: 'search',
      label: 'Search Everything',
      description: 'Search across tasks, projects, and people',
      icon: <IconSearch />,
      shortcut: '/',
      onSelect: () => console.log('Open search'),
    },
    {
      id: 'notifications',
      label: 'View Notifications',
      description: 'Check your latest notifications',
      icon: <IconBell />,
      onSelect: () => console.log('View notifications'),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Manage your account preferences',
      icon: <IconSettings />,
      shortcut: 'G S',
      onSelect: () => console.log('Open settings'),
    },
  ],
}

const respondedBlocks: Block[] = [
  {
    type: 'text',
    id: 'text-1',
    data: {
      content:
        'Here is the current team allocation across active projects:',
    },
  },
  {
    type: 'table',
    id: 'table-1',
    data: {
      columns: [
        { key: 'name', label: 'Member', variant: 'text' },
        { key: 'project', label: 'Project', variant: 'text' },
        { key: 'hours', label: 'Hours/Week', variant: 'number' },
        { key: 'status', label: 'Status', variant: 'badge' },
      ],
      rows: [
        {
          name: 'Arundhati',
          project: 'PIERA',
          hours: 32,
          status: { label: 'On Track', color: 'success' },
        },
        {
          name: 'Goutham',
          project: 'Karm V2',
          hours: 40,
          status: { label: 'At Capacity', color: 'warning' },
        },
        {
          name: 'Yogin',
          project: 'PIERA',
          hours: 24,
          status: { label: 'Available', color: 'info' },
        },
      ],
      caption: 'Team bandwidth snapshot',
      sortable: true,
    },
  },
]

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CommandBar> = {
  title: 'AI/CommandBar',
  component: CommandBar,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof CommandBar>

// ---------------------------------------------------------------------------
// 1. HeroIdle
// ---------------------------------------------------------------------------

export const HeroIdle: Story = {
  name: 'Hero / Idle',
  args: {
    variant: 'hero',
    greeting: 'Good morning, Mudit.',
    hints: [
      'Add Arundhati to all projects',
      "Who's on PIERA?",
      'Show pending corrections',
    ],
    placeholder: 'What would you like to do?',
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-2xl">
        <CommandBar {...args} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 2. HeroProcessing
// ---------------------------------------------------------------------------

export const HeroProcessing: Story = {
  tags: ['!autodocs'],
  name: 'Hero / Processing',
  args: {
    variant: 'hero',
    state: 'processing',
    greeting: 'Good morning, Mudit.',
    agentName: 'Devadoot',
    placeholder: 'What would you like to do?',
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-2xl">
        <CommandBar {...args} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 3. HeroResponded
// ---------------------------------------------------------------------------

export const HeroResponded: Story = {
  name: 'Hero / Responded',
  args: {
    variant: 'hero',
    state: 'responded',
    greeting: 'Good morning, Mudit.',
    placeholder: 'What would you like to do?',
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-2xl">
        <AICommandProvider agent={{ name: 'Devadoot' }}>
          <CommandBar {...args}>
            <BlockRenderer blocks={respondedBlocks} />
          </CommandBar>
        </AICommandProvider>
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 4. HeroInteractive
// ---------------------------------------------------------------------------

export const HeroInteractive: Story = {
  tags: ['!autodocs'],
  name: 'Hero / Interactive',
  render: () => {
    const [state, setState] = React.useState<
      'idle' | 'typing' | 'processing' | 'responded'
    >('idle')
    const [blocks, setBlocks] = React.useState<Block[]>([])

    const handleSubmit = React.useCallback((query: string) => {
      console.log('Submitted:', query)
      setState('processing')
      setTimeout(() => {
        setBlocks([
          {
            type: 'text',
            id: 'resp-1',
            data: {
              content: `You asked: **"${query}"**\n\nHere is a simulated response from Devadoot. In production this would be a real AI-generated answer with structured blocks.`,
            },
          },
          {
            type: 'stat_row',
            id: 'stats-1',
            data: {
              stats: [
                { label: 'Tasks Found', value: 12 },
                {
                  label: 'Completion',
                  value: '78%',
                  change: { value: '+5%', direction: 'up' },
                },
                { label: 'Overdue', value: 2 },
              ],
            },
          },
        ])
        setState('responded')
      }, 2000)
    }, [])

    return (
      <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
        <div className="w-full max-w-2xl">
          <AICommandProvider agent={{ name: 'Devadoot' }}>
            <CommandBar
              variant="hero"
              state={state}
              greeting="Good morning, Mudit."
              hints={[
                'Add Arundhati to all projects',
                "Who's on PIERA?",
                'Show pending corrections',
              ]}
              placeholder="What would you like to do?"
              agentName="Devadoot"
              onSubmit={handleSubmit}
            >
              {state === 'responded' && blocks.length > 0 && (
                <BlockRenderer blocks={blocks} />
              )}
            </CommandBar>
          </AICommandProvider>
        </div>
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 5. HeroWithCommandGroups
// ---------------------------------------------------------------------------

export const HeroWithCommandGroups: Story = {
  name: 'Hero / With Command Groups',
  render: () => {
    const handleSubmit = (query: string) => {
      console.log('AI query submitted:', query)
    }

    return (
      <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
        <div className="w-full max-w-2xl">
          <CommandBar
            variant="hero"
            greeting="Good morning, Mudit."
            placeholder="Search commands or ask a question..."
            groups={[pagesGroup, actionsGroup]}
            onSubmit={handleSubmit}
            hints={['Show team bandwidth', 'Create a new project']}
          />
        </div>
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 6. HeroPlaceholderRotation
// ---------------------------------------------------------------------------

export const HeroPlaceholderRotation: Story = {
  name: 'Hero / Placeholder Rotation',
  args: {
    variant: 'hero',
    greeting: 'Good morning, Mudit.',
    placeholder: [
      'Add a member...',
      'Check attendance...',
      'Review break requests...',
      'Search projects...',
    ],
    placeholderInterval: 3000,
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-2xl">
        <CommandBar {...args} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 7. InlineDefault
// ---------------------------------------------------------------------------

export const InlineDefault: Story = {
  name: 'Inline / Default',
  args: {
    variant: 'inline',
    placeholder: 'Ask Devadoot...',
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-md rounded-ds-lg bg-surface-raised p-ds-05">
        <CommandBar {...args} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 8. InlineInCard
// ---------------------------------------------------------------------------

export const InlineInCard: Story = {
  name: 'Inline / In Card',
  render: () => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-md overflow-hidden rounded-ds-xl bg-surface-raised shadow-raised">
        <div className="border-b border-surface-border-strong px-ds-05 py-ds-04">
          <div className="flex items-center gap-ds-02b">
            <IconRobot className="h-ico-sm w-ico-sm text-accent-9" />
            <h3 className="text-ds-md font-semibold text-surface-fg">
              AI Assistant
            </h3>
          </div>
          <p className="mt-ds-01 text-ds-sm text-surface-fg-subtle">
            Ask anything about your workspace
          </p>
        </div>
        <div className="p-ds-05">
          <CommandBar
            variant="inline"
            placeholder="Type your question..."
            onSubmit={(q) => console.log('Query:', q)}
          />
        </div>
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 9. FloatingDefault
// ---------------------------------------------------------------------------

export const FloatingDefault: Story = {
  tags: ['!autodocs'],
  name: 'Floating / Default',
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex min-h-screen flex-col items-center gap-ds-05 bg-surface-1 p-ds-09">
        <CommandBar
          variant="floating"
          open={open}
          onOpenChange={setOpen}
          placeholder="Ask anything or search..."
          onSubmit={(q) => console.log('Submit:', q)}
          keybinding="mod+j"
        />
        <div className="flex flex-col items-center gap-ds-04">
          <p className="text-ds-lg font-semibold text-surface-fg">
            Floating CommandBar
          </p>
          <p className="text-ds-sm text-surface-fg-muted">
            Press{' '}
            <kbd className="rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-02b py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">
              Ctrl+J
            </kbd>{' '}
            or click the button below.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-ds-lg border border-surface-border-strong bg-surface-raised px-ds-05 py-ds-03 text-ds-sm font-medium text-surface-fg transition-colors hover:bg-surface-raised-hover"
          >
            Open CommandBar
          </button>
        </div>
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 10. FloatingWithCommands
// ---------------------------------------------------------------------------

export const FloatingWithCommands: Story = {
  tags: ['!autodocs'],
  name: 'Floating / With Commands',
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex min-h-screen flex-col items-center gap-ds-05 bg-surface-1 p-ds-09">
        <CommandBar
          variant="floating"
          open={open}
          onOpenChange={setOpen}
          placeholder="Search commands or ask a question..."
          groups={[pagesGroup, actionsGroup]}
          onSubmit={(q) => console.log('AI query:', q)}
          keybinding="mod+j"
        />
        <div className="flex flex-col items-center gap-ds-04">
          <p className="text-ds-lg font-semibold text-surface-fg">
            Unified Command + AI
          </p>
          <p className="text-ds-sm text-surface-fg-muted">
            Type to filter commands, or write a natural-language question and
            press Enter to submit to the AI.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-ds-lg border border-surface-border-strong bg-surface-raised px-ds-05 py-ds-03 text-ds-sm font-medium text-surface-fg transition-colors hover:bg-surface-raised-hover"
          >
            Open CommandBar
          </button>
        </div>
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 11. Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    variant: 'hero',
    disabled: true,
    greeting: 'Good morning, Mudit.',
    placeholder: 'CommandBar is disabled',
  },
  render: (args) => (
    <div className="flex min-h-screen items-start justify-center bg-surface-1 p-ds-09">
      <div className="w-full max-w-2xl">
        <CommandBar {...args} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 12. FullDashboard
// ---------------------------------------------------------------------------

const simulatedSteps: ProcessingStep[] = [
  { id: 'step-1', label: 'Understanding your question', status: 'done' },
  { id: 'step-2', label: 'Querying team data', status: 'done' },
  { id: 'step-3', label: 'Generating response', status: 'active' },
]

const dashboardResponse: Block[] = [
  {
    type: 'text',
    id: 'dash-text-1',
    data: {
      content:
        'Here is the current team allocation across all active projects. Goutham is at full capacity on **Karm V2**, while Yogin has bandwidth available on **PIERA**.',
    },
  },
  {
    type: 'stat_row',
    id: 'dash-stats',
    data: {
      stats: [
        { label: 'Active Members', value: 5 },
        {
          label: 'Avg. Utilization',
          value: '82%',
          change: { value: '+3%', direction: 'up' },
        },
        { label: 'At Capacity', value: 1 },
        {
          label: 'Available',
          value: 2,
          change: { value: '-1', direction: 'down' },
        },
      ],
    },
  },
  {
    type: 'table',
    id: 'dash-table',
    data: {
      columns: [
        { key: 'name', label: 'Member', variant: 'text' },
        { key: 'project', label: 'Project', variant: 'text' },
        { key: 'hours', label: 'Hours/Week', variant: 'number' },
        { key: 'status', label: 'Status', variant: 'badge' },
      ],
      rows: [
        {
          name: 'Arundhati',
          project: 'PIERA',
          hours: 32,
          status: { label: 'On Track', color: 'success' },
        },
        {
          name: 'Goutham',
          project: 'Karm V2',
          hours: 40,
          status: { label: 'At Capacity', color: 'warning' },
        },
        {
          name: 'Yogin',
          project: 'PIERA',
          hours: 24,
          status: { label: 'Available', color: 'info' },
        },
        {
          name: 'Amal',
          project: 'Karm V2',
          hours: 36,
          status: { label: 'On Track', color: 'success' },
        },
        {
          name: 'Mudit',
          project: 'Shilp Sutra',
          hours: 28,
          status: { label: 'Available', color: 'info' },
        },
      ],
      caption: 'Team bandwidth snapshot — week of March 17',
      sortable: true,
    },
  },
  {
    type: 'text',
    id: 'dash-text-2',
    data: {
      content:
        'Would you like me to reassign Yogin to help Goutham on Karm V2, or pull up the full bandwidth report?',
    },
  },
]

export const FullDashboard: Story = {
  tags: ['!autodocs'],
  name: 'Full Dashboard (Interactive)',
  render: () => {
    const [barState, setBarState] = React.useState<
      'idle' | 'typing' | 'processing' | 'responded'
    >('idle')
    const [messages, setMessages] = React.useState<ConversationMessage[]>([])
    const [isConversationProcessing, setIsConversationProcessing] =
      React.useState(false)
    const [steps, setSteps] = React.useState<ProcessingStep[]>([])

    const handleSubmit = React.useCallback(
      (query: string) => {
        // Add user message
        const userMsg: ConversationMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: query,
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, userMsg])

        // Start processing
        setBarState('processing')
        setIsConversationProcessing(true)

        // Simulate step progression
        setSteps([
          {
            id: 'step-1',
            label: 'Understanding your question',
            status: 'active',
          },
          { id: 'step-2', label: 'Querying team data', status: 'pending' },
          { id: 'step-3', label: 'Generating response', status: 'pending' },
        ])

        setTimeout(() => {
          setSteps([
            {
              id: 'step-1',
              label: 'Understanding your question',
              status: 'done',
            },
            { id: 'step-2', label: 'Querying team data', status: 'active' },
            { id: 'step-3', label: 'Generating response', status: 'pending' },
          ])
        }, 800)

        setTimeout(() => {
          setSteps([
            {
              id: 'step-1',
              label: 'Understanding your question',
              status: 'done',
            },
            { id: 'step-2', label: 'Querying team data', status: 'done' },
            { id: 'step-3', label: 'Generating response', status: 'active' },
          ])
        }, 1500)

        // Deliver response
        setTimeout(() => {
          const isFirstQuery = messages.length === 0
          const assistantMsg: ConversationMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            blocks: isFirstQuery
              ? dashboardResponse
              : [
                  {
                    type: 'text',
                    id: `followup-${Date.now()}`,
                    data: {
                      content: `Got it. You asked: **"${query}"**\n\nI've updated the view accordingly. Here is a summary of the changes applied.`,
                    },
                  },
                  {
                    type: 'success',
                    id: `success-${Date.now()}`,
                    data: {
                      title: 'Action Complete',
                      message:
                        'The requested operation was processed successfully.',
                    },
                  },
                ],
            createdAt: new Date(),
          }
          setMessages((prev) => [...prev, assistantMsg])
          setIsConversationProcessing(false)
          setSteps([])
          setBarState('responded')
        }, 2500)
      },
      [messages.length],
    )

    return (
      <div className="min-h-screen bg-surface-1 p-ds-07">
        <div className="mx-auto flex max-w-2xl flex-col gap-ds-07">
          {/* CommandBar */}
          <AICommandProvider
            agent={{
              name: 'Devadoot',
              icon: (
                <IconRobot className="h-4 w-4 text-accent-9" stroke={1.5} />
              ),
            }}
          >
            <CommandBar
              variant="hero"
              state={barState}
              greeting="Good morning, Mudit."
              hints={
                messages.length === 0
                  ? [
                      "Who's on PIERA?",
                      'Show team bandwidth',
                      'Create a standup',
                    ]
                  : undefined
              }
              placeholder="What would you like to do?"
              agentName="Devadoot"
              onSubmit={handleSubmit}
            />

            {/* Conversation */}
            {messages.length > 0 && (
              <div className="rounded-ds-xl bg-surface-raised p-ds-07 shadow-raised">
                <AIConversation
                  messages={messages}
                  isProcessing={isConversationProcessing}
                  processingSteps={steps.length > 0 ? steps : undefined}
                  maxHeight="500px"
                  autoScroll
                />
              </div>
            )}
          </AICommandProvider>
        </div>
      </div>
    )
  },
}
