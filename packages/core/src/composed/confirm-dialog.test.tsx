import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './confirm-dialog'

function renderDialog(
  props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {},
) {
  const onConfirm = props.onConfirm ?? vi.fn()
  const onOpenChange = props.onOpenChange ?? vi.fn()
  return {
    onConfirm,
    onOpenChange,
    ...render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete item?"
        description="This action cannot be undone."
        onConfirm={onConfirm}
        {...props}
      />,
    ),
  }
}

describe('ConfirmDialog', () => {
  it('renders title and description', () => {
    renderDialog()
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('renders default button labels', () => {
    renderDialog()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('renders custom button labels', () => {
    renderDialog({ confirmText: 'Yes, delete', cancelText: 'Nevermind' })
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
    expect(screen.getByText('Nevermind')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderDialog()
    await user.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()
    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows "Processing..." and disables buttons when loading', () => {
    renderDialog({ loading: true })
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })
})
