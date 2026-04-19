import { fireEvent,render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MessageInput } from './message-input'

describe('MessageInput', () => {
  it('renders textarea with placeholder', () => {
    render(<MessageInput onSubmit={vi.fn()} placeholder="Say something..." />)
    expect(screen.getByPlaceholderText('Say something...')).toBeInTheDocument()
  })

  it('calls onSubmit on Enter', () => {
    const onSubmit = vi.fn()
    render(<MessageInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('Hello')
  })

  it('does NOT call onSubmit on Shift+Enter', () => {
    const onSubmit = vi.fn()
    render(<MessageInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('send button disabled when empty', () => {
    render(<MessageInput onSubmit={vi.fn()} />)
    const sendBtn = screen.getByLabelText('Send')
    expect(sendBtn).toBeDisabled()
  })

  it('send button enabled when text entered', () => {
    render(<MessageInput onSubmit={vi.fn()} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    const sendBtn = screen.getByLabelText('Send')
    expect(sendBtn).not.toBeDisabled()
  })

  it('shows stop button when isStreaming', () => {
    render(<MessageInput onSubmit={vi.fn()} isStreaming onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Stop')).toBeInTheDocument()
    expect(screen.queryByLabelText('Send')).not.toBeInTheDocument()
  })

  it('click stop calls onCancel', () => {
    const onCancel = vi.fn()
    render(<MessageInput onSubmit={vi.fn()} isStreaming onCancel={onCancel} />)
    fireEvent.click(screen.getByLabelText('Stop'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('Enter does NOT send when isStreaming', () => {
    const onSubmit = vi.fn()
    render(<MessageInput onSubmit={onSubmit} isStreaming onCancel={vi.fn()} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders leadingSlot content', () => {
    render(
      <MessageInput
        onSubmit={vi.fn()}
        leadingSlot={<span data-testid="leading">+</span>}
      />,
    )
    expect(screen.getByTestId('leading')).toBeInTheDocument()
  })

  it('renders trailingSlot content', () => {
    render(
      <MessageInput
        onSubmit={vi.fn()}
        trailingSlot={<span data-testid="trailing">...</span>}
      />,
    )
    expect(screen.getByTestId('trailing')).toBeInTheDocument()
  })

  it('renders disclaimer text', () => {
    render(
      <MessageInput onSubmit={vi.fn()} disclaimer="AI may make mistakes" />,
    )
    expect(screen.getByText('AI may make mistakes')).toBeInTheDocument()
  })

  it('disabled state disables textarea and send', () => {
    render(<MessageInput onSubmit={vi.fn()} disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    const sendBtn = screen.getByLabelText('Send')
    expect(sendBtn).toBeDisabled()
  })

  it('clears text after submit', () => {
    const onSubmit = vi.fn()
    render(<MessageInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('')
  })
})
