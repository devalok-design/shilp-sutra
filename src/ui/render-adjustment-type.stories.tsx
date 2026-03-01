import type { Meta, StoryObj } from '@storybook/react'
import renderAdjustmentType, { AdjustmentType } from './render-adjustment-type'

const meta: Meta = {
  title: 'UI/Other/RenderAdjustmentType',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.keys(AdjustmentType),
    },
  },
}
export default meta
type Story = StoryObj

export const YearlyBalance: Story = {
  render: () => renderAdjustmentType('YEARLY_BALANCE'),
}

export const CarryForward: Story = {
  render: () => renderAdjustmentType('CARRY_FORWARD'),
}

export const Cashout: Story = {
  render: () => renderAdjustmentType('CASHOUT'),
}

export const Other: Story = {
  render: () => renderAdjustmentType('OTHER'),
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(Object.keys(AdjustmentType) as (keyof typeof AdjustmentType)[]).map((type) => (
        <div key={type} className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-text-secondary)] w-32 font-mono">{type}</span>
          <span>{renderAdjustmentType(type)}</span>
        </div>
      ))}
    </div>
  ),
}
