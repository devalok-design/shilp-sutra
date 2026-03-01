import type { Meta, StoryObj } from '@storybook/react'
import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const meta: Meta<typeof ToggleGroup> = {
  title: 'UI/Form Controls/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ToggleGroup>

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <IconBold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <IconItalic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <IconUnderline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <IconBold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <IconItalic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <IconUnderline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <IconBold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <IconItalic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <IconUnderline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
