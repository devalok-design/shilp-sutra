import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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
} from '../alert-dialog'

function renderDialog({ open }: { open?: boolean } = {}) {
  return render(
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>
        <button>Open Dialog</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  )
}

describe('AlertDialog', () => {
  it('renders the trigger button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()
  })

  it('does not show content when closed', () => {
    renderDialog()
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
  })

  it('shows content when open is true', () => {
    renderDialog({ open: true })
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('renders action and cancel buttons when open', () => {
    renderDialog({ open: true })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('merges custom className on AlertDialogHeader', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader className="my-header">
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>,
    )
    // AlertDialog content renders via portal, so query from document.body
    const header = document.querySelector('.my-header')
    expect(header).toBeInTheDocument()
  })
})
