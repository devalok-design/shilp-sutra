import type { Meta, StoryObj } from '@storybook/react'
import { renderAdjustmentType, AdjustmentType } from './render-adjustment-type'

const meta: Meta = {
  title: 'Karm/Admin/Utils/RenderAdjustmentType',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { renderAdjustmentType } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
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
    <div className="flex flex-col gap-ds-02">
      {(Object.keys(AdjustmentType) as (keyof typeof AdjustmentType)[]).map((type) => (
        <div key={type} className="flex items-center gap-ds-04 text-ds-sm">
          <span className="text-surface-fg-muted w-32 font-mono">{type}</span>
          <span>{renderAdjustmentType(type)}</span>
        </div>
      ))}
    </div>
  ),
}
