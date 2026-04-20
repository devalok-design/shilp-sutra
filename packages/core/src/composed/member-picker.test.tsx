import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MemberPicker, type MemberPickerMember } from './member-picker'

const members: MemberPickerMember[] = [
  { id: 'm1', name: 'Alice Johnson' },
  { id: 'm2', name: 'Bob Smith' },
  { id: 'm3', name: 'Charlie Brown' },
]

function renderPicker(
  props: Partial<React.ComponentProps<typeof MemberPicker>> = {},
) {
  const onSelect = props.onSelect ?? vi.fn()
  return {
    onSelect,
    ...render(
      <MemberPicker
        members={members}
        selectedIds={[]}
        onSelect={onSelect}
        {...props}
      >
        <button>Assign member</button>
      </MemberPicker>,
    ),
  }
}

describe('MemberPicker', () => {
  it('renders the trigger', () => {
    renderPicker()
    expect(screen.getByRole('button', { name: 'Assign member' })).toBeInTheDocument()
  })

  it('opens popover and shows members on trigger click', async () => {
    const user = userEvent.setup()
    renderPicker()
    await user.click(screen.getByRole('button', { name: 'Assign member' }))
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
  })

  it('calls onSelect with member id when a member is clicked', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderPicker()
    await user.click(screen.getByRole('button', { name: 'Assign member' }))
    await user.click(screen.getByText('Bob Smith'))
    expect(onSelect).toHaveBeenCalledWith('m2')
  })

  it('filters members by search', async () => {
    const user = userEvent.setup()
    renderPicker()
    await user.click(screen.getByRole('button', { name: 'Assign member' }))
    await user.type(screen.getByLabelText('Search'), 'alice')
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
  })

  it('renders avatar initials for members', async () => {
    const user = userEvent.setup()
    renderPicker()
    await user.click(screen.getByRole('button', { name: 'Assign member' }))
    // getInitials('Alice Johnson') -> 'AJ'
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })
})
