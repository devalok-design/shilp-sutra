import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

function renderDropdown() {
  return render(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">Open menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  )
}

describe('DropdownMenu accessibility', () => {
  it('should have no violations in closed state', async () => {
    const { container } = renderDropdown()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in open state', async () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button type="button">Open menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('opens on Enter key press', async () => {
    const user = userEvent.setup()
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    renderDropdown()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })
  })
})
