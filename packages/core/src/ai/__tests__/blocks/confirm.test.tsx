import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmBlock } from '../../blocks/confirm'

describe('ConfirmBlock', () => {
  const baseData = {
    actionId: 'delete-task-42',
    label: 'Delete',
  }

  it('renders confirm button with label and cancel button', () => {
    render(<ConfirmBlock data={baseData} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('confirm click calls onAction with confirm', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmBlock data={baseData} onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onAction).toHaveBeenCalledWith('delete-task-42', 'confirm')
  })

  it('cancel click calls onAction with cancel', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmBlock data={baseData} onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onAction).toHaveBeenCalledWith('delete-task-42', 'cancel')
  })

  it('renders description when provided', () => {
    render(
      <ConfirmBlock
        data={{ ...baseData, description: 'This will permanently remove the task.' }}
      />,
    )
    expect(screen.getByText('This will permanently remove the task.')).toBeInTheDocument()
  })

  it('does not render description when absent', () => {
    render(<ConfirmBlock data={baseData} />)
    expect(screen.queryByText(/permanently/i)).not.toBeInTheDocument()
  })

  it('uses error color when destructive', () => {
    render(
      <ConfirmBlock data={{ ...baseData, destructive: true }} />,
    )
    const confirmBtn = screen.getByRole('button', { name: 'Delete' })
    // Button's colour now rides on data-palette; the fill class is a role.
    expect(confirmBtn).toHaveAttribute('data-palette', 'error')
    expect(confirmBtn.className).toContain('bg-palette-solid')
  })

  it('does not use error color when not destructive', () => {
    render(<ConfirmBlock data={baseData} />)
    const confirmBtn = screen.getByRole('button', { name: 'Delete' })
    expect(confirmBtn).not.toHaveAttribute('data-palette', 'error')
  })

  it('renders expandable rationale when provided', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmBlock
        data={{
          ...baseData,
          rationale: 'The task has no dependencies and is past due.',
        }}
      />,
    )
    // Trigger should be visible
    const trigger = screen.getByText('Why this action?')
    expect(trigger).toBeInTheDocument()

    // Rationale should initially not be visible (collapsed)
    const rationaleBeforeClick = screen.queryByText('The task has no dependencies and is past due.')
    if (rationaleBeforeClick) {
      // Radix may render it hidden
      expect(rationaleBeforeClick).not.toBeVisible()
    }

    // Click to expand
    await user.click(trigger)

    // Rationale should now be visible
    expect(screen.getByText('The task has no dependencies and is past due.')).toBeVisible()
  })

  it('does not render rationale trigger when rationale absent', () => {
    render(<ConfirmBlock data={baseData} />)
    expect(screen.queryByText('Why this action?')).not.toBeInTheDocument()
  })

  it('applies low confidence indicator (wash + chip, no rail)', () => {
    render(<ConfirmBlock data={baseData} confidence="low" />)
    const wrapper = document.querySelector('[data-confidence="low"]') as HTMLElement
    expect(wrapper).toBeInTheDocument()
    // Wash surface, not the removed accent rail.
    expect(wrapper.className).toContain('bg-warning-2')
    expect(wrapper.className).not.toContain('border-l-2')
    expect(screen.getByText('Low confidence')).toBeInTheDocument()
  })

  it('does not apply low confidence indicator for high confidence', () => {
    render(<ConfirmBlock data={baseData} confidence="high" />)
    expect(document.querySelector('[data-confidence="low"]')).toBeNull()
    expect(screen.queryByText('Low confidence')).not.toBeInTheDocument()
  })
})
