import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll,describe, expect, it, vi } from 'vitest'

// ── ESM-only dep mocks (must be before component imports) ────────────────────

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}))

vi.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}))

import { AICommandProvider } from '../ai-command-provider'
import { AIConversation } from '../conversation'
import type { ConversationMessage } from '../types'

// ── IntersectionObserver mock ────────────────────────────────────────────────

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {
      this.cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as any,
      )
    }
    unobserve() {}
    disconnect() {}
  } as any
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function userMsg(id: string, content: string): ConversationMessage {
  return { id, role: 'user', content, createdAt: new Date() }
}

function assistantMsg(
  id: string,
  blocks: ConversationMessage['blocks'],
): ConversationMessage {
  return { id, role: 'assistant', blocks, createdAt: new Date() }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AIConversation', () => {
  it('renders user messages', () => {
    render(<AIConversation messages={[userMsg('1', 'Hello')]} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders assistant messages with blocks', () => {
    render(
      <AIConversation
        messages={[
          assistantMsg('2', [
            { type: 'text', data: { content: 'Response' } },
          ]),
        ]}
      />,
    )
    expect(screen.getByText('Response')).toBeInTheDocument()
  })

  it('shows agent name for assistant messages', () => {
    render(
      <AIConversation
        messages={[
          assistantMsg('2', [
            { type: 'text', data: { content: 'Hi' } },
          ]),
        ]}
        agent={{ name: 'Devadoot' }}
      />,
    )
    expect(screen.getByText('Devadoot')).toBeInTheDocument()
  })

  it('shows processing dots when isProcessing and no steps', () => {
    render(
      <AIConversation messages={[]} isProcessing agent={{ name: 'AI' }} />,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument()
  })

  it('shows processing steps when provided', () => {
    render(
      <AIConversation
        messages={[]}
        isProcessing
        processingSteps={[
          { id: '1', label: 'Querying projects', status: 'done' },
          { id: '2', label: 'Building preview', status: 'active' },
        ]}
      />,
    )
    expect(screen.getByText('Querying projects')).toBeInTheDocument()
    expect(screen.getByText('Building preview')).toBeInTheDocument()
  })

  it('passes onAction through to BlockRenderer', async () => {
    const onAction = vi.fn()
    render(
      <AIConversation
        messages={[
          assistantMsg('3', [
            { type: 'confirm', data: { actionId: 'x', label: 'Go' } },
          ]),
        ]}
        onAction={onAction}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /go/i }))
    expect(onAction).toHaveBeenCalledWith('x', 'confirm')
  })

  it('renders multiple messages in sequence', () => {
    render(
      <AIConversation
        messages={[
          userMsg('1', 'Query 1'),
          assistantMsg('2', [
            { type: 'text', data: { content: 'Answer 1' } },
          ]),
          userMsg('3', 'Query 2'),
        ]}
      />,
    )
    expect(screen.getByText('Query 1')).toBeInTheDocument()
    expect(screen.getByText('Answer 1')).toBeInTheDocument()
    expect(screen.getByText('Query 2')).toBeInTheDocument()
  })

  it('renders empty state without error', () => {
    const { container } = render(<AIConversation messages={[]} />)
    expect(container).toBeInTheDocument()
  })

  it('reads agent from context when not provided as prop', () => {
    render(
      <AICommandProvider agent={{ name: 'CtxAgent' }}>
        <AIConversation
          messages={[
            assistantMsg('1', [
              { type: 'text', data: { content: 'Hello' } },
            ]),
          ]}
        />
      </AICommandProvider>,
    )
    expect(screen.getByText('CtxAgent')).toBeInTheDocument()
  })

  it('does not show processing indicator when isProcessing is false', () => {
    render(<AIConversation messages={[]} isProcessing={false} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('uses default agent name when no agent provided', () => {
    render(
      <AIConversation
        messages={[]}
        isProcessing
      />,
    )
    expect(screen.getByText(/Assistant is thinking/i)).toBeInTheDocument()
  })

  it('prop agent overrides context agent', () => {
    render(
      <AICommandProvider agent={{ name: 'CtxAgent' }}>
        <AIConversation
          messages={[
            assistantMsg('1', [
              { type: 'text', data: { content: 'Hello' } },
            ]),
          ]}
          agent={{ name: 'PropAgent' }}
        />
      </AICommandProvider>,
    )
    expect(screen.getByText('PropAgent')).toBeInTheDocument()
    expect(screen.queryByText('CtxAgent')).not.toBeInTheDocument()
  })

  it('shows step status for done, active, pending, and error', () => {
    render(
      <AIConversation
        messages={[]}
        isProcessing
        processingSteps={[
          { id: '1', label: 'Step done', status: 'done' },
          { id: '2', label: 'Step active', status: 'active' },
          { id: '3', label: 'Step pending', status: 'pending' },
          { id: '4', label: 'Step error', status: 'error' },
        ]}
      />,
    )
    expect(screen.getByText('Step done')).toBeInTheDocument()
    expect(screen.getByText('Step active')).toBeInTheDocument()
    expect(screen.getByText('Step pending')).toBeInTheDocument()
    expect(screen.getByText('Step error')).toBeInTheDocument()
  })

  it('applies maxHeight style', () => {
    const { container } = render(
      <AIConversation messages={[]} maxHeight={400} />,
    )
    const scrollContainer = container.querySelector('.overflow-y-auto')
    expect(scrollContainer).toHaveStyle({ maxHeight: '400px' })
  })

  it('applies string maxHeight style', () => {
    const { container } = render(
      <AIConversation messages={[]} maxHeight="50vh" />,
    )
    const scrollContainer = container.querySelector('.overflow-y-auto')
    expect(scrollContainer).toHaveStyle({ maxHeight: '50vh' })
  })

  it('does not apply maxHeight when not provided', () => {
    const { container } = render(<AIConversation messages={[]} />)
    const scrollContainer = container.querySelector('.overflow-y-auto')
    expect(scrollContainer).not.toHaveAttribute('style')
  })
})
