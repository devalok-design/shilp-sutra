import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toggle } from './Toggle'
import type { ToggleOption } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Karm/CustomButtons/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'big'],
      description: 'Size of the toggle buttons',
    },
    color: {
      control: 'select',
      options: ['filled', 'tonal'],
      description: 'Color scheme for the selected toggle',
    },
    options: {
      control: false,
      description: 'Array of toggle options with id and text',
    },
    selectedId: {
      control: false,
      description: 'ID of the currently selected option',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle group is disabled',
    },
  },
  args: {
    disabled: false,
  },
}
export default meta

type Story = StoryObj<typeof Toggle>

// --- Common option sets ---

const twoOptions: ToggleOption[] = [
  { id: 'list', text: 'List' },
  { id: 'board', text: 'Board' },
]

const threeOptions: ToggleOption[] = [
  { id: 'day', text: 'Day' },
  { id: 'week', text: 'Week' },
  { id: 'month', text: 'Month' },
]

const fourOptions: ToggleOption[] = [
  { id: 'all', text: 'All' },
  { id: 'active', text: 'Active' },
  { id: 'completed', text: 'Completed' },
  { id: 'archived', text: 'Archived' },
]

// --- Size Variants (Filled) ---

export const SmallFilled: Story = {
  args: {
    size: 'small',
    color: 'filled',
    options: threeOptions,
    selectedId: 'week',
  },
}

export const MediumFilled: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: threeOptions,
    selectedId: 'week',
  },
}

export const BigFilled: Story = {
  args: {
    size: 'big',
    color: 'filled',
    options: threeOptions,
    selectedId: 'week',
  },
}

// --- Size Variants (Tonal) ---

export const SmallTonal: Story = {
  args: {
    size: 'small',
    color: 'tonal',
    options: threeOptions,
    selectedId: 'week',
  },
}

export const MediumTonal: Story = {
  args: {
    size: 'medium',
    color: 'tonal',
    options: threeOptions,
    selectedId: 'week',
  },
}

export const BigTonal: Story = {
  args: {
    size: 'big',
    color: 'tonal',
    options: threeOptions,
    selectedId: 'week',
  },
}

// --- All Sizes Comparison ---

export const AllSizesFilled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
        <Toggle size="small" color="filled" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
        <Toggle size="medium" color="filled" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Big</span>
        <Toggle size="big" color="filled" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
    </div>
  ),
}

export const AllSizesTonal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
        <Toggle size="small" color="tonal" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
        <Toggle size="medium" color="tonal" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Big</span>
        <Toggle size="big" color="tonal" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
    </div>
  ),
}

// --- Color Comparison ---

export const FilledVsTonal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Filled</span>
        <Toggle size="medium" color="filled" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Tonal</span>
        <Toggle size="medium" color="tonal" options={threeOptions} selectedId="week" onSelect={() => {}} />
      </div>
    </div>
  ),
}

// --- Different Option Counts ---

export const TwoOptions: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: twoOptions,
    selectedId: 'list',
  },
}

export const ThreeOptions: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: threeOptions,
    selectedId: 'day',
  },
}

export const FourOptions: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: fourOptions,
    selectedId: 'all',
  },
}

// --- Disabled States ---

export const DisabledFilled: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: threeOptions,
    selectedId: 'week',
    disabled: true,
  },
}

export const DisabledTonal: Story = {
  args: {
    size: 'medium',
    color: 'tonal',
    options: threeOptions,
    selectedId: 'week',
    disabled: true,
  },
}

export const AllStatesDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Filled Disabled</span>
        <Toggle size="medium" color="filled" options={threeOptions} selectedId="week" onSelect={() => {}} disabled />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Tonal Disabled</span>
        <Toggle size="medium" color="tonal" options={threeOptions} selectedId="week" onSelect={() => {}} disabled />
      </div>
    </div>
  ),
}

// --- Interactive / Controlled ---

const InteractiveFilledTemplate = () => {
  const [selected, setSelected] = useState('week')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <Toggle size="medium" color="filled" options={threeOptions} selectedId={selected} onSelect={setSelected} />
      <span style={{ fontSize: '13px', color: 'var(--text-secondary, #666)' }}>
        Selected: <strong>{selected}</strong>
      </span>
    </div>
  )
}

export const InteractiveFilled: Story = {
  render: () => <InteractiveFilledTemplate />,
}

const InteractiveTonalTemplate = () => {
  const [selected, setSelected] = useState('board')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <Toggle size="medium" color="tonal" options={twoOptions} selectedId={selected} onSelect={setSelected} />
      <span style={{ fontSize: '13px', color: 'var(--text-secondary, #666)' }}>
        Selected: <strong>{selected}</strong>
      </span>
    </div>
  )
}

export const InteractiveTonal: Story = {
  render: () => <InteractiveTonalTemplate />,
}

// --- Real-World Use Cases ---

const ViewSwitcherTemplate = () => {
  const [view, setView] = useState('board')
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-primary, #e0e0e0)',
        minWidth: '320px',
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #333)' }}>Project View</span>
      <Toggle size="small" color="filled" options={twoOptions} selectedId={view} onSelect={setView} />
    </div>
  )
}

export const ViewSwitcher: Story = {
  render: () => <ViewSwitcherTemplate />,
}

const FilterBarTemplate = () => {
  const [filter, setFilter] = useState('all')
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-primary, #e0e0e0)',
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #333)' }}>Tasks:</span>
      <Toggle size="small" color="tonal" options={fourOptions} selectedId={filter} onSelect={setFilter} />
    </div>
  )
}

export const FilterBar: Story = {
  render: () => <FilterBarTemplate />,
}

// --- Playground ---

export const Playground: Story = {
  args: {
    size: 'medium',
    color: 'filled',
    options: threeOptions,
    selectedId: 'week',
    disabled: false,
  },
}
