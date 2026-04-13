import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageList } from './message-list'

// jsdom doesn't implement scrollTo
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo
})

describe('MessageList', () => {
  it('renders children inside a role="log" container', () => {
    render(
      <MessageList>
        <div>Hello</div>
      </MessageList>,
    )
    const log = screen.getByRole('log')
    expect(log).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has aria-live="polite" attribute', () => {
    render(
      <MessageList>
        <div>Test</div>
      </MessageList>,
    )
    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
  })

  it('has aria-relevant="additions" attribute', () => {
    render(
      <MessageList>
        <div>Test</div>
      </MessageList>,
    )
    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-relevant', 'additions')
  })

  it('shows emptySlot when no children', () => {
    render(
      <MessageList emptySlot={<div>No messages yet</div>}>
        {[]}
      </MessageList>,
    )
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('does NOT show emptySlot when children present', () => {
    render(
      <MessageList emptySlot={<div>No messages yet</div>}>
        <div>Message 1</div>
      </MessageList>,
    )
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument()
    expect(screen.getByText('Message 1')).toBeInTheDocument()
  })

  it('shows "N new" button text when newMessageCount > 0', () => {
    // The pill shows when newMessageCount > 0 and isAtBottomRef is false.
    // Since jsdom doesn't have real scroll geometry, isAtBottomRef starts true.
    // We need to force it by scrolling — but jsdom doesn't support scrollHeight.
    // Instead, we render with the condition that produces the pill:
    // The component uses isAtBottomRef which defaults to true, so the pill won't
    // show. We test that the button text content is correct by checking the DOM
    // after a manual scroll event that would set isAtBottom to false.

    // In jsdom, scrollHeight = scrollTop = clientHeight = 0, so
    // scrollHeight - scrollTop - clientHeight = 0 < 40, meaning isAtBottom = true.
    // We can't easily fake scroll geometry. Instead, test that the pill renders
    // by verifying the component structure — the AnimatePresence wrapper is always
    // present. For a meaningful test, we directly check that when scrolled up
    // (not at bottom), the pill appears.

    // Since we can't simulate real scroll in jsdom, we'll do a simpler assertion:
    // render with newMessageCount and verify the pill text exists when conditions are met.
    // We'll modify the scroll element to have different geometry.
    const { container } = render(
      <MessageList newMessageCount={3} onScrollToBottom={vi.fn()}>
        <div>Message</div>
      </MessageList>,
    )
    const scrollEl = container.querySelector('[role="log"]') as HTMLElement

    // Mock scroll geometry: make it look like user scrolled up
    Object.defineProperty(scrollEl, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(scrollEl, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 400, configurable: true })

    fireEvent.scroll(scrollEl)

    // After scroll event, isAtBottom should be false, pill should show
    expect(screen.getByText('3 new')).toBeInTheDocument()
  })

  it('calls onScrollToBottom when pill is clicked', () => {
    const onScrollToBottom = vi.fn()
    const { container } = render(
      <MessageList newMessageCount={5} onScrollToBottom={onScrollToBottom}>
        <div>Message</div>
      </MessageList>,
    )
    const scrollEl = container.querySelector('[role="log"]') as HTMLElement

    // Force not-at-bottom state
    Object.defineProperty(scrollEl, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(scrollEl, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 400, configurable: true })
    fireEvent.scroll(scrollEl)

    const pill = screen.getByText('5 new')
    fireEvent.click(pill)
    expect(onScrollToBottom).toHaveBeenCalledOnce()
  })

  it('shows spinner when loadingMore', () => {
    render(
      <MessageList loadingMore>
        <div>Message</div>
      </MessageList>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders headerSlot content', () => {
    render(
      <MessageList headerSlot={<div>Channel Header</div>}>
        <div>Message</div>
      </MessageList>,
    )
    expect(screen.getByText('Channel Header')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <MessageList className="custom-class">
        <div>Message</div>
      </MessageList>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('calls onLoadMore when scrolled near top', () => {
    const onLoadMore = vi.fn()
    const { container } = render(
      <MessageList onLoadMore={onLoadMore}>
        <div>Message</div>
      </MessageList>,
    )
    const scrollEl = container.querySelector('[role="log"]') as HTMLElement

    // Mock: scrollTop near top, enough scrollHeight to not be at bottom
    Object.defineProperty(scrollEl, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(scrollEl, 'scrollTop', { value: 50, configurable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 400, configurable: true })

    fireEvent.scroll(scrollEl)
    expect(onLoadMore).toHaveBeenCalledOnce()
  })
})
