import type { Meta, StoryObj } from '@storybook/react'
import { IconBold } from '@tabler/icons-react'
import { Toggle } from './toggle'

const meta: Meta<typeof Toggle> = {
  title: 'UI/Form Controls/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  args: {
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const WithIcon: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <IconBold className="h-4 w-4" />
    </Toggle>
  ),
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}
