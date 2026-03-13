import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MemberPicker, type MemberPickerMember } from './member-picker'

// ── Mock data ───────────────────────────────────────────────

const mockMembers: MemberPickerMember[] = [
  { id: '1', name: 'Mudit Sharma', avatar: '' },
  { id: '2', name: 'Priya Kapoor' },
  { id: '3', name: 'Rahul Verma' },
  { id: '4', name: 'Anika Patel' },
  { id: '5', name: 'Sneha Joshi' },
  { id: '6', name: 'Amit Kumar' },
]

// ── Meta ────────────────────────────────────────────────────

const meta: Meta<typeof MemberPicker> = {
  title: 'Composed/MemberPicker',
  component: MemberPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    multiple: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    onSelect: { action: 'onSelect' },
  },
}
export default meta
type Story = StoryObj<typeof MemberPicker>

// ── Helper wrapper for interactive stories ──────────────────

function SingleSelectDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelect = (memberId: string) => {
    setSelectedIds([memberId])
  }

  const selected = mockMembers.find((m) => selectedIds.includes(m.id))

  return (
    <MemberPicker
      members={mockMembers}
      selectedIds={selectedIds}
      onSelect={handleSelect}
    >
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        {selected ? selected.name : 'Assign member'}
      </button>
    </MemberPicker>
  )
}

function MultiSelectDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['1', '3'])

  const handleSelect = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    )
  }

  const count = selectedIds.length

  return (
    <MemberPicker
      members={mockMembers}
      selectedIds={selectedIds}
      onSelect={handleSelect}
      multiple
    >
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        {count > 0 ? `${count} member${count > 1 ? 's' : ''} selected` : 'Assign members'}
      </button>
    </MemberPicker>
  )
}

function CustomPlaceholderDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <MemberPicker
      members={mockMembers}
      selectedIds={selectedIds}
      onSelect={(id) => setSelectedIds([id])}
      placeholder="Find a teammate..."
    >
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        Pick teammate
      </button>
    </MemberPicker>
  )
}

function EmptyListDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <MemberPicker
      members={[]}
      selectedIds={selectedIds}
      onSelect={(id) => setSelectedIds([id])}
    >
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        Assign member
      </button>
    </MemberPicker>
  )
}

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    members: mockMembers,
    selectedIds: [],
    multiple: false,
    placeholder: 'Search members...',
    children: (
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        Assign member
      </button>
    ),
  },
}

export const SingleSelect: Story = {
  render: () => <SingleSelectDemo />,
}

export const MultiSelect: Story = {
  render: () => <MultiSelectDemo />,
}

export const CustomPlaceholder: Story = {
  render: () => <CustomPlaceholderDemo />,
}

export const PreselectedMember: Story = {
  args: {
    members: mockMembers,
    selectedIds: ['2'],
    multiple: false,
    children: (
      <button
        type="button"
        className="rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-05 py-ds-03 text-ds-md font-body text-surface-fg"
      >
        Priya Kapoor
      </button>
    ),
  },
}

export const EmptyMemberList: Story = {
  render: () => <EmptyListDemo />,
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Single select
        </p>
        <SingleSelectDemo />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Multi select
        </p>
        <MultiSelectDemo />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Custom placeholder
        </p>
        <CustomPlaceholderDemo />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Empty list
        </p>
        <EmptyListDemo />
      </div>
    </div>
  ),
}
