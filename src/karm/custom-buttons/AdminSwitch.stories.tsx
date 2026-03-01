import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AdminSwitch } from './AdminSwitch'

const meta: Meta<typeof AdminSwitch> = {
  title: 'Karm/CustomButtons/AdminSwitch',
  component: AdminSwitch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the admin switch is toggled on',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback when the switch value changes',
    },
  },
  args: {
    disabled: false,
  },
}
export default meta

type Story = StoryObj<typeof AdminSwitch>

// --- Static States ---

export const Off: Story = {
  args: {
    checked: false,
  },
}

export const On: Story = {
  args: {
    checked: true,
  },
}

// --- Disabled States ---

export const DisabledOff: Story = {
  args: {
    checked: false,
    disabled: true,
  },
}

export const DisabledOn: Story = {
  args: {
    checked: true,
    disabled: true,
  },
}

// --- All States Overview ---

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AdminSwitch checked={false} onCheckedChange={() => {}} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary, #666)' }}>Off</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AdminSwitch checked={true} onCheckedChange={() => {}} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary, #666)' }}>On</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AdminSwitch checked={false} onCheckedChange={() => {}} disabled />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary, #666)' }}>Disabled Off</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AdminSwitch checked={true} onCheckedChange={() => {}} disabled />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary, #666)' }}>Disabled On</span>
      </div>
    </div>
  ),
}

// --- Interactive / Controlled ---

const InteractiveTemplate = () => {
  const [checked, setChecked] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <AdminSwitch checked={checked} onCheckedChange={setChecked} />
      <span style={{ fontSize: '14px', color: 'var(--text-primary, #333)' }}>
        Admin mode: <strong>{checked ? 'Enabled' : 'Disabled'}</strong>
      </span>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
}

// --- With Label Context ---

const WithLabelTemplate = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-primary, #e0e0e0)',
        minWidth: '280px',
      }}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #333)' }}>Admin Mode</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', marginTop: '2px' }}>
          {isAdmin ? 'Full access enabled' : 'Standard access'}
        </div>
      </div>
      <AdminSwitch checked={isAdmin} onCheckedChange={setIsAdmin} />
    </div>
  )
}

export const WithLabel: Story = {
  render: () => <WithLabelTemplate />,
}

// --- Playground ---

export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
}
