import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { TaskComposer } from '../task-composer'

describe('TaskComposer', () => {
  const onSubmit = vi.fn()

  afterEach(() => { vi.clearAllMocks() })

  it('renders textarea with placeholder', () => {
    render(<TaskComposer onSubmit={onSubmit} placeholder="Write a message..." />)
    expect(screen.getByPlaceholderText('Write a message...')).toBeInTheDocument()
  })

  it('does not show visibility tabs when showVisibility is false', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.queryByText('Team')).not.toBeInTheDocument()
    expect(screen.queryByText('Client')).not.toBeInTheDocument()
  })

  it('shows visibility tabs when showVisibility is true', () => {
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Client')).toBeInTheDocument()
  })

  it('defaults to INTERNAL visibility', () => {
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    const teamTab = screen.getByText('Team').closest('button')!
    expect(teamTab.className).toContain('bg-surface-raised-hover')
  })

  it('switches to client mode on Client tab click', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    const clientTab = screen.getByText('Client').closest('button')!
    expect(clientTab.className).toContain('bg-warning-3')
  })

  it('submits with correct visibility', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello')
    await user.click(screen.getByLabelText('Send message'))
    expect(onSubmit).toHaveBeenCalledWith('Hello', 'INTERNAL')
  })

  it('submits with CLIENT visibility after tab switch', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello client')
    await user.click(screen.getByLabelText('Send message'))
    expect(onSubmit).toHaveBeenCalledWith('Hello client', 'CLIENT')
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Hello', 'INTERNAL')
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} />)
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('resets visibility to default after submit', async () => {
    const user = userEvent.setup()
    render(<TaskComposer onSubmit={onSubmit} showVisibility />)
    await user.click(screen.getByText('Client'))
    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello{Enter}')
    await user.type(screen.getByLabelText('Message input'), 'Second{Enter}')
    expect(onSubmit).toHaveBeenLastCalledWith('Second', 'INTERNAL')
    const teamTab = screen.getByText('Team').closest('button')!
    expect(teamTab.className).toContain('bg-surface-raised-hover')
  })

  it('shows attach button when showAttach is true', () => {
    render(<TaskComposer onSubmit={onSubmit} showAttach />)
    expect(screen.getByLabelText('Attach file')).toBeInTheDocument()
  })

  it('hides attach button when showAttach is false', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.queryByLabelText('Attach file')).not.toBeInTheDocument()
  })

  it('disables send when text is empty', () => {
    render(<TaskComposer onSubmit={onSubmit} />)
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })
})
