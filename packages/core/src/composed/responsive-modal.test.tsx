import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from './responsive-modal'

// jsdom reports matches:false for the mobile media query, so these tests exercise
// the desktop (centered Dialog) branch. Mobile drag/snap behaviour is covered by
// Storybook interaction + manual QA (jsdom has no layout to drag against).

function Example(props: React.ComponentProps<typeof ResponsiveModal>) {
  return (
    <ResponsiveModal {...props}>
      <ResponsiveModalTrigger>Open</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Filters</ResponsiveModalTitle>
          <ResponsiveModalDescription>Narrow the results.</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>Body content</ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose>Cancel</ResponsiveModalClose>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

describe('ResponsiveModal accessibility', () => {
  it('has no axe violations when open with title + description', async () => {
    const { container } = render(<Example open />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('ResponsiveModal', () => {
  it('renders title, description, body and footer when open', () => {
    render(<Example open />)
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByText('Narrow the results.')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('opens from the trigger (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<Example />)
    expect(screen.queryByRole('heading', { name: 'Filters' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('heading', { name: 'Filters' })).toBeInTheDocument()
  })

  it('renders a built-in close button that dismisses', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Example open onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on Escape when dismissable (default)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Example open onOpenChange={onOpenChange} />)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('does NOT close on Escape and hides the close button when dismissable={false}', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Example open dismissable={false} onOpenChange={onOpenChange} />)
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    // Give any (unwanted) close a chance to fire.
    await new Promise((r) => setTimeout(r, 50))
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
