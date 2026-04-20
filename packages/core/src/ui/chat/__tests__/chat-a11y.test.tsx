import { render } from '@testing-library/react'
import { beforeAll,describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Message } from '../message'
import { MessageInput } from '../message-input'
import { MessageList } from '../message-list'
import { SystemMessage } from '../system-message'
import { TypingIndicator } from '../typing-indicator'

// jsdom doesn't implement scrollTo
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo
})

describe('Chat components — axe accessibility', () => {
  // ── Message (flat variant) ────────────────────────────────────────────
  it('Message flat variant has no a11y violations', async () => {
    const { container } = render(
      <Message variant="flat">
        <Message.Avatar fallback="JD" />
        <Message.Content>
          <Message.Author name="John Doe" formattedTimestamp="2:30 PM" />
          <Message.Body>Hello, this is a test message.</Message.Body>
        </Message.Content>
      </Message>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── Message (bubble variant) ──────────────────────────────────────────
  it('Message bubble variant has no a11y violations', async () => {
    const { container } = render(
      <Message variant="bubble" placement="end">
        <Message.Content>
          <Message.Body>Bubble message from me</Message.Body>
        </Message.Content>
      </Message>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Message bubble variant (start placement) has no a11y violations', async () => {
    const { container } = render(
      <Message variant="bubble" placement="start">
        <Message.Content>
          <Message.Author name="Alice" formattedTimestamp="3:15 PM" />
          <Message.Body>Bubble message from them</Message.Body>
        </Message.Content>
      </Message>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── MessageInput (default state) ──────────────────────────────────────
  it('MessageInput default state has no a11y violations', async () => {
    const { container } = render(
      <MessageInput onSubmit={vi.fn()} placeholder="Type a message..." />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── MessageList with messages ─────────────────────────────────────────
  it('MessageList with children has no a11y violations', async () => {
    const { container } = render(
      <MessageList>
        <div key="1">First message</div>
        <div key="2">Second message</div>
      </MessageList>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── SystemMessage (event variant) ─────────────────────────────────────
  it('SystemMessage event variant has no a11y violations', async () => {
    const { container } = render(
      <SystemMessage variant="event">
        Alice joined the channel
      </SystemMessage>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── SystemMessage (alert variant) ─────────────────────────────────────
  it('SystemMessage alert variant has no a11y violations', async () => {
    const { container } = render(
      <SystemMessage variant="alert">
        Connection lost. Retrying...
      </SystemMessage>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── TypingIndicator with users ────────────────────────────────────────
  it('TypingIndicator with one user has no a11y violations', async () => {
    const { container } = render(
      <TypingIndicator users={[{ name: 'Sarah' }]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TypingIndicator with multiple users has no a11y violations', async () => {
    const { container } = render(
      <TypingIndicator users={[{ name: 'Sarah' }, { name: 'Arjun' }]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
