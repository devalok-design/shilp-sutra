import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NumberInput } from './number-input'

const meta: Meta<typeof NumberInput> = {
  title: 'UI/Form Controls/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
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
  return <NumberInput {...props} value={value} onChange={setValue} />
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
