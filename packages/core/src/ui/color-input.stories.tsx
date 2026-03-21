import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorInput } from './color-input'

const meta: Meta<typeof ColorInput> = {
  title: 'UI/Core/ColorInput',
  component: ColorInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'color' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ColorInput>

export const Default: Story = {
  args: {
    value: '#6366F1',
  },
}

export const WithPresets: Story = {
  args: {
    value: '#D33163',
    presets: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
  },
}

export const Disabled: Story = {
  args: {
    value: '#6366F1',
    disabled: true,
    presets: ['#EF4444', '#3B82F6'],
  },
}

export const Controlled: Story = {
  render: function Controlled() {
    const [color, setColor] = useState('#3B82F6')
    return (
      <div className="flex flex-col gap-ds-04">
        <ColorInput
          value={color}
          onChange={setColor}
          presets={['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']}
        />
        <p className="text-ds-sm text-surface-fg-subtle">
          Selected: <code className="font-mono">{color}</code>
        </p>
      </div>
    )
  },
}
