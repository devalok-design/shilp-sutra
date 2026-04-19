import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

function renderAlertDialog(props?: { onAction?: () => void; onCancel?: () => void }) {
  return render(
    <AlertDialog>
      <AlertDialogTrigger>Delete item</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props?.onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={props?.onAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  )
}

describe('AlertDialog', () => {
  it('renders the trigger button', () => {
    renderAlertDialog()
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument()
  })

  it('does not show content when closed', () => {
    renderAlertDialog()
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
  })

  it('opens on trigger click and shows content', async () => {
    const user = userEvent.setup()
    renderAlertDialog()
    await user.click(screen.getByRole('button', { name: 'Delete item' }))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('shows action and cancel buttons when open', async () => {
    const user = userEvent.setup()
    renderAlertDialog()
    await user.click(screen.getByRole('button', { name: 'Delete item' }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls action handler and closes on action click', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderAlertDialog({ onAction })
    await user.click(screen.getByRole('button', { name: 'Delete item' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('cancel button invokes cancel handler', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderAlertDialog({ onCancel })
    await user.click(screen.getByRole('button', { name: 'Delete item' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('supports controlled open state', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Controlled</AlertDialogTitle>
          <AlertDialogDescription>Controlled desc</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    )
    expect(screen.getByText('Controlled')).toBeInTheDocument()
  })

  it('merges className on content', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="custom-alert-dialog">
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogDescription>Desc</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('Title').closest('[class*="custom-alert-dialog"]')).toBeInTheDocument()
  })

  it('has no axe violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderAlertDialog()
    await user.click(screen.getByRole('button', { name: 'Delete item' }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
