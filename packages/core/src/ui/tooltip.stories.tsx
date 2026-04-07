import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs', 'stable'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: /hover me/i }))
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible())
  },
}

export const Top: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Top</Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Tooltip on top</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Right: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Right</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Tooltip on right</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Bottom</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Tooltip on bottom</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Left: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Left</Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Tooltip on left</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const CustomContent: Story = {
  name: 'Custom Content',
  render: () => (
    <div className="flex gap-ds-07 p-ds-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">User Info</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] p-0">
          <div className="flex items-center gap-ds-03 px-ds-04 py-ds-03">
            <div className="h-ds-sm w-ds-sm rounded-ds-full bg-accent-9 flex items-center justify-center text-ds-xs font-semibold text-accent-fg">
              MG
            </div>
            <div>
              <p className="text-ds-sm font-semibold">Mudit Gupta</p>
              <p className="text-ds-xs opacity-70">Lead Designer</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Keyboard Shortcut</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-ds-03">
            <span>Save changes</span>
            <kbd className="rounded-ds-sm border border-current/20 bg-current/10 px-ds-02 py-[1px] font-mono text-ds-xs">
              Ctrl+S
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Multi-line</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <p className="text-ds-sm">
            This tooltip has a longer description that wraps to multiple lines for extra context.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const AllSides: Story = {
  render: () => (
    <div className="flex items-center gap-ds-07 p-ds-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Top tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">Right tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">Left tooltip</TooltipContent>
      </Tooltip>
    </div>
  ),
}
