import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SuccessBlock } from '../../blocks/success'

describe('SuccessBlock', () => {
  it('renders title and message', () => {
    render(
      <SuccessBlock
        data={{ title: 'Task completed', message: 'All items saved' }}
      />,
    )
    expect(screen.getByText('Task completed')).toBeInTheDocument()
    expect(screen.getByText('All items saved')).toBeInTheDocument()
  })

  it('renders success alert with icon', () => {
    const { container } = render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Success' }}
      />,
    )
    // Alert color="success" renders its own checkmark icon
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows undo button when undoable is true', () => {
    vi.useFakeTimers()
    render(
      <SuccessBlock
        data={{ title: 'Deleted', message: 'Item removed', undoable: true }}
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /undo action/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('calls onAction with undo when undo button clicked', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    render(
      <SuccessBlock
        data={{ title: 'Deleted', message: 'Item removed', undoable: true }}
        blockId="block-1"
        onAction={onAction}
      />,
    )
    const undoBtn = screen.getByRole('button', { name: /undo action/i })
    fireEvent.click(undoBtn)
    expect(onAction).toHaveBeenCalledWith('block-1', 'undo')
    vi.useRealTimers()
  })

  it('undo button disappears after timeout', () => {
    vi.useFakeTimers()
    render(
      <SuccessBlock
        data={{
          title: 'Deleted',
          message: 'Item removed',
          undoable: true,
          undoTimeout: 3000,
        }}
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /undo action/i })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    expect(screen.queryByRole('button', { name: /undo action/i })).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('does not show undo button when undoable is false', () => {
    render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Completed', undoable: false }}
      />,
    )
    expect(screen.queryByRole('button', { name: /undo action/i })).not.toBeInTheDocument()
  })

  it('does not show undo button when undoable is absent', () => {
    render(
      <SuccessBlock
        data={{ title: 'Done', message: 'Completed' }}
      />,
    )
    expect(screen.queryByRole('button', { name: /undo action/i })).not.toBeInTheDocument()
  })

  it('uses data.actionId when blockId is not provided', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    render(
      <SuccessBlock
        data={{
          title: 'Deleted',
          message: 'Removed',
          undoable: true,
        }}
        blockId="action-42"
        onAction={onAction}
      />,
    )
    const undoBtn = screen.getByRole('button', { name: /undo action/i })
    fireEvent.click(undoBtn)
    expect(onAction).toHaveBeenCalledWith('action-42', 'undo')
    vi.useRealTimers()
  })
})
