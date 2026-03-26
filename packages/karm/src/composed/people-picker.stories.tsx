import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/ui/button'
import { AvatarGroup } from '@/composed/avatar-group'
import type { AvatarUser } from '@/composed/avatar-group'
import { PeoplePicker, type PeoplePickerMember } from './people-picker'

const MOCK_MEMBERS: PeoplePickerMember[] = [
  { id: '1', name: 'Aarav Sharma', image: null },
  { id: '2', name: 'Priya Patel', image: null },
  { id: '3', name: 'Rohan Gupta', image: null },
  { id: '4', name: 'Ananya Verma', image: null },
  { id: '5', name: 'Vikram Singh', image: null },
]

const meta: Meta<typeof PeoplePicker> = {
  title: 'Karm/Composed/PeoplePicker',
  component: PeoplePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Popover-based member picker with assign/unassign and lead toggle.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof PeoplePicker>

function InteractivePicker({
  initialAssignees,
  initialLeads,
  hintPosition,
}: {
  initialAssignees: PeoplePickerMember[]
  initialLeads: PeoplePickerMember[]
  hintPosition?: 'top' | 'bottom'
}) {
  const [assignees, setAssignees] = React.useState(initialAssignees)
  const [leads, setLeads] = React.useState(initialLeads)

  const handleAssign = (memberId: string) => {
    const member = MOCK_MEMBERS.find((m) => m.id === memberId)
    if (member) setAssignees((prev) => [...prev, member])
  }

  const handleUnassign = (memberId: string) => {
    setAssignees((prev) => prev.filter((a) => a.id !== memberId))
    setLeads((prev) => prev.filter((l) => l.id !== memberId))
  }

  const handleToggleLead = (memberId: string) => {
    setLeads((prev) =>
      prev.some((l) => l.id === memberId)
        ? prev.filter((l) => l.id !== memberId)
        : [...prev, assignees.find((a) => a.id === memberId)!],
    )
  }

  const avatarUsers: AvatarUser[] = assignees.map((a) => ({
    name: a.name,
    image: a.image,
    indicator: leads.some((l) => l.id === a.id) ? ('lead' as const) : undefined,
  }))

  return (
    <PeoplePicker
      members={MOCK_MEMBERS}
      assignees={assignees}
      leads={leads}
      onAssign={handleAssign}
      onUnassign={handleUnassign}
      onToggleLead={handleToggleLead}
      hintPosition={hintPosition}
    >
      {assignees.length > 0 ? (
        <button type="button" className="cursor-pointer">
          <AvatarGroup users={avatarUsers} size="xs" max={3} />
        </button>
      ) : (
        <Button variant="ghost" size="sm">
          Assign
        </Button>
      )}
    </PeoplePicker>
  )
}

export const Default: Story = {
  render: () => (
    <InteractivePicker
      initialAssignees={[MOCK_MEMBERS[0], MOCK_MEMBERS[2]]}
      initialLeads={[MOCK_MEMBERS[0]]}
    />
  ),
}

export const HintBottom: Story = {
  render: () => (
    <InteractivePicker
      initialAssignees={[MOCK_MEMBERS[0], MOCK_MEMBERS[2]]}
      initialLeads={[MOCK_MEMBERS[0]]}
      hintPosition="bottom"
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <InteractivePicker initialAssignees={[]} initialLeads={[]} />
  ),
}
