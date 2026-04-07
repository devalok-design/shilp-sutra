import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Popover> = {
  title: 'UI/Feedback/Popover',
  component: Popover,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-ds-04">
          <div className="space-y-ds-02">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-ds-sm text-surface-fg-muted">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-ds-02">
            <div className="flex flex-col gap-ds-01">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" />
            </div>
            <div className="flex flex-col gap-ds-01">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /open popover/i }))
    const body = within(document.body)
    await waitFor(() => expect(body.getByText('Dimensions')).toBeVisible())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByText('Dimensions')).toBeNull())
  },
}

export const SimpleContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">Info</Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <p className="text-ds-sm">
          This is a simple popover with just text content.
        </p>
      </PopoverContent>
    </Popover>
  ),
}

export const AlignStart: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align Start</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <p className="text-ds-sm">Aligned to start</p>
      </PopoverContent>
    </Popover>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align End</Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p className="text-ds-sm">Aligned to end</p>
      </PopoverContent>
    </Popover>
  ),
}

export const MobileDrawer: Story = {
  globals: { viewport: 'mobile' },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-ds-sm">
          On mobile, this renders as a bottom drawer instead of a floating popover.
        </p>
      </PopoverContent>
    </Popover>
  ),
}
