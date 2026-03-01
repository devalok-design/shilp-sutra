import type { Meta, StoryObj } from '@storybook/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { Button } from './button'

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Feedback/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-80 space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-80 space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-md border border-[var(--color-border-default)] px-4 py-2 text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
