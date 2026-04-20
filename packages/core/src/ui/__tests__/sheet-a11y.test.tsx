import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../sheet'

describe('Sheet accessibility', () => {
  it('should have no violations in open state with title and description', async () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your preferences.</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your preferences.</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    await user.click(screen.getByRole('button', { name: 'Open Sheet' }))
    expect(screen.getByText('Settings')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })
  })
})
