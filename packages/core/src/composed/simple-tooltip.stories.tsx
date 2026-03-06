import type { Meta, StoryObj } from '@storybook/react'
import { SimpleTooltip } from './simple-tooltip'

const meta: Meta<typeof SimpleTooltip> = {
  title: 'Composed/SimpleTooltip',
  component: SimpleTooltip,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    delayDuration: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
    },
  },
}
export default meta
type Story = StoryObj<typeof SimpleTooltip>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
  },
  render: (args) => (
    <SimpleTooltip {...args}>
      <button style={{ padding: '8px 16px' }}>Hover me</button>
    </SimpleTooltip>
  ),
}

export const SideVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 80, justifyContent: 'center' }}>
      <SimpleTooltip content="Top tooltip" side="top">
        <button style={{ padding: '8px 16px' }}>Top</button>
      </SimpleTooltip>
      <SimpleTooltip content="Right tooltip" side="right">
        <button style={{ padding: '8px 16px' }}>Right</button>
      </SimpleTooltip>
      <SimpleTooltip content="Bottom tooltip" side="bottom">
        <button style={{ padding: '8px 16px' }}>Bottom</button>
      </SimpleTooltip>
      <SimpleTooltip content="Left tooltip" side="left">
        <button style={{ padding: '8px 16px' }}>Left</button>
      </SimpleTooltip>
    </div>
  ),
}

export const RichContent: Story = {
  render: () => (
    <SimpleTooltip
      content={
        <div>
          <strong>Rich tooltip</strong>
          <p style={{ margin: 0 }}>With multiple lines of content</p>
        </div>
      }
    >
      <button style={{ padding: '8px 16px' }}>Rich content</button>
    </SimpleTooltip>
  ),
}
