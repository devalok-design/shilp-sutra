import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from './radio'
import { Label } from './label'

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Form Controls/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="option-1" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">Option One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">Option Two</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">Option Three</Label>
      </div>
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="small" className="flex flex-row gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="small" id="size-s" />
        <Label htmlFor="size-s">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="medium" id="size-m" />
        <Label htmlFor="size-m">Medium</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="large" id="size-l" />
        <Label htmlFor="size-l">Large</Label>
      </div>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="d1" />
        <Label htmlFor="d1">Selected but disabled</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="d2" />
        <Label htmlFor="d2">Disabled option</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithoutDefaultValue: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="no-default-a" />
        <Label htmlFor="no-default-a">Choice A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="no-default-b" />
        <Label htmlFor="no-default-b">Choice B</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="c" id="no-default-c" />
        <Label htmlFor="no-default-c">Choice C</Label>
      </div>
    </RadioGroup>
  ),
}
