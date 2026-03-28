import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconPlus } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { Button } from '@/ui/button'
import { TaskSection } from './task-section'

const meta: Meta<typeof TaskSection> = {
  title: 'Karm/Composed/TaskSection',
  component: TaskSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Collapsible section with title, count badge, and optional actions slot.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof TaskSection>

const SampleContent = () => (
  <div className="flex flex-col gap-ds-02 py-ds-02">
    <div className="rounded-ds-md border border-surface-border p-ds-03 text-ds-sm">
      Task item one
    </div>
    <div className="rounded-ds-md border border-surface-border p-ds-03 text-ds-sm">
      Task item two
    </div>
    <div className="rounded-ds-md border border-surface-border p-ds-03 text-ds-sm">
      Task item three
    </div>
  </div>
)

export const Default: Story = {
  args: {
    title: 'To Do',
    count: 3,
    children: <SampleContent />,
  },
}

export const WithActions: Story = {
  args: {
    title: 'In Progress',
    count: 2,
    actions: (
      <Button variant="ghost" size="icon-sm" aria-label="Add task">
        <Icon icon={IconPlus} size="xs" />
      </Button>
    ),
    children: <SampleContent />,
  },
}

export const ChevronLeft: Story = {
  args: {
    title: 'Blocked',
    count: 1,
    chevronPosition: 'left',
    children: <SampleContent />,
  },
}

export const Open: Story = {
  args: {
    title: 'Completed',
    count: 3,
    defaultOpen: true,
    children: <SampleContent />,
  },
}
