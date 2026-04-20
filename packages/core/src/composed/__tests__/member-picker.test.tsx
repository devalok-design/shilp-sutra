import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import type { MemberPickerMember } from '../member-picker'
import { MemberPicker } from '../member-picker'

const mockMembers: MemberPickerMember[] = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Charlie Brown' },
]

describe('MemberPicker', () => {
  it('should have no accessibility violations when closed', async () => {
    const { container } = render(
      <MemberPicker
        members={mockMembers}
        selectedIds={[]}
        onSelect={() => {}}
      >
        <button type="button">Assign Member</button>
      </MemberPicker>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemberPicker
        members={mockMembers}
        selectedIds={['1']}
        onSelect={() => {}}
      >
        <button type="button">Assign Member</button>
      </MemberPicker>,
    )

    // Open the popover by clicking the trigger
    await user.click(container.querySelector('button')!)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with no members', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemberPicker
        members={[]}
        selectedIds={[]}
        onSelect={() => {}}
      >
        <button type="button">Assign Member</button>
      </MemberPicker>,
    )

    await user.click(container.querySelector('button')!)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
