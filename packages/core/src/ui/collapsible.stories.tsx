import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from 'storybook/test'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { Button } from './button'

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Feedback/Collapsible',
  component: Collapsible,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => (
    <Collapsible className="w-80 space-y-ds-02">
      <div className="flex items-center justify-between space-x-ds-04">
        <h4 className="text-ds-sm font-semibold">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="space-y-ds-02">
        <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Initially, hidden content should not be visible
    await expect(canvas.queryByText('@radix-ui/colors')).toBeNull()
    // Click toggle to expand
    await userEvent.click(canvas.getByRole('button', { name: /toggle/i }))
    // Verify expanded content is visible
    await expect(canvas.getByText('@radix-ui/colors')).toBeVisible()
  },
}

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-80 space-y-ds-02">
      <div className="flex items-center justify-between space-x-ds-04">
        <h4 className="text-ds-sm font-semibold">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent className="space-y-ds-02">
        <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
          @radix-ui/colors
        </div>
        <div className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
