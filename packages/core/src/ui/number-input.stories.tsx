import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { NumberInput } from './number-input'

const meta: Meta<typeof NumberInput> = {
  title: 'Components/Inputs/NumberInput',
  component: NumberInput,
  tags: ['autodocs', 'stable'],
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof NumberInput>

const NumberInputControlled = (props: React.ComponentProps<typeof NumberInput>) => {
  const [value, setValue] = useState(props.value ?? 0)
  return <NumberInput {...props} value={value} onValueChange={setValue} />
}

export const Default: Story = {
  render: () => <NumberInputControlled value={0} />,
}

export const WithValue: Story = {
  render: () => <NumberInputControlled value={5} />,
}

export const WithMinMax: Story = {
  render: () => <NumberInputControlled value={3} min={0} max={10} />,
}

export const WithStep: Story = {
  render: () => <NumberInputControlled value={0} step={5} min={0} max={100} />,
}

export const Disabled: Story = {
  render: () => <NumberInputControlled value={7} disabled />,
}

export const AtMinimum: Story = {
  render: () => <NumberInputControlled value={0} min={0} max={10} />,
}

export const AtMaximum: Story = {
  render: () => <NumberInputControlled value={10} min={0} max={10} />,
}

export const Sizes: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const

    return (
      <div className="flex flex-wrap items-end gap-ds-05">
        {sizes.map((size) => (
          <div key={size}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">{size}</p>
            <NumberInputControlled value={3} min={0} max={10} size={size} />
          </div>
        ))}
      </div>
    )
  },
}

export const ErrorState: Story = {
  render: () => <NumberInputControlled value={5} min={0} max={10} state="error" />,
}
