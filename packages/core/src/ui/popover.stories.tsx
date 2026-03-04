import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Popover> = {
  title: 'UI/Feedback/Popover',
  component: Popover,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-text-secondary">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const SimpleContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">Info</Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <p className="text-sm">
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
        <Button variant="secondary">Align Start</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <p className="text-sm">Aligned to start</p>
      </PopoverContent>
    </Popover>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Align End</Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p className="text-sm">Aligned to end</p>
      </PopoverContent>
    </Popover>
  ),
}
