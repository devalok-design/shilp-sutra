import { fireEvent,render, screen } from '@testing-library/react'
import * as React from 'react'
import { vi } from 'vitest'
import { axe } from 'vitest-axe'

// ── Mocks ──────────────────────────────────────────────────────────────────

// IntersectionObserver — used by AIConversation auto-scroll
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {
      // Immediately report as intersecting so "isAtBottom" stays true
      this.cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as globalThis.IntersectionObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver
}

// react-markdown — ESM-only dep, mock to a simple passthrough
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}))

// remark-gfm — stub
vi.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}))

// ── Imports (after mocks) ──────────────────────────────────────────────────

import { AICommandProvider, useAICommand } from '../ai-command-provider'
import { BlockRenderer } from '../block-renderer'
import { TextBlock } from '../blocks/text'
import { CommandBar } from '../command-bar'
import { AIConversation } from '../conversation'
import type { Block,ConversationMessage } from '../types'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeUserMessage(
  id: string,
  content: string,
): ConversationMessage {
  return { id, role: 'user', content, createdAt: new Date() }
}

function makeAssistantMessage(
  id: string,
  blocks: Block[],
): ConversationMessage {
  return { id, role: 'assistant', blocks, createdAt: new Date() }
}

// ────────────────────────────────────────────────────────────────────────────
// AICommandProvider
// ────────────────────────────────────────────────────────────────────────────

describe('AICommandProvider', () => {
  it('renders children', () => {
    render(
      <AICommandProvider>
        <span>hello</span>
      </AICommandProvider>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('provides context values to consumers', () => {
    const onAction = vi.fn()

    function Consumer() {
      const ctx = useAICommand()
      return (
        <div>
          <span data-testid="has-ctx">{ctx ? 'yes' : 'no'}</span>
          <span data-testid="agent-name">{ctx?.agent?.name ?? 'none'}</span>
        </div>
      )
    }

    render(
      <AICommandProvider
        agent={{ name: 'TestBot' }}
        onAction={onAction}
      >
        <Consumer />
      </AICommandProvider>,
    )

    expect(screen.getByTestId('has-ctx')).toHaveTextContent('yes')
    expect(screen.getByTestId('agent-name')).toHaveTextContent('TestBot')
  })

  it('useAICommand() returns null outside provider', () => {
    function Consumer() {
      const ctx = useAICommand()
      return <span data-testid="ctx">{ctx === null ? 'null' : 'has'}</span>
    }

    render(<Consumer />)
    expect(screen.getByTestId('ctx')).toHaveTextContent('null')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// TextBlock
// ────────────────────────────────────────────────────────────────────────────

describe('TextBlock', () => {
  it('renders text block with content', () => {
    render(<TextBlock data={{ content: 'Hello **world**' }} />)
    expect(screen.getByTestId('markdown')).toHaveTextContent(
      'Hello **world**',
    )
  })

  it('applies low-confidence styling (wash, no rail)', () => {
    const { container } = render(
      <TextBlock data={{ content: 'Uncertain' }} confidence="low" />,
    )
    const wrapper = container.querySelector('[data-confidence="low"]') as HTMLElement
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.className).toContain('bg-warning-2')
    expect(wrapper.className).not.toContain('border-warning-7')
  })

  it('does not apply low-confidence surface for high confidence', () => {
    const { container } = render(
      <TextBlock data={{ content: 'Sure' }} confidence="high" />,
    )
    expect(container.querySelector('[data-confidence="low"]')).toBeNull()
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toContain('bg-warning-2')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <TextBlock data={{ content: 'Accessible text' }} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ────────────────────────────────────────────────────────────────────────────
// BlockRenderer
// ────────────────────────────────────────────────────────────────────────────

describe('BlockRenderer', () => {
  it('renders a text block', () => {
    const blocks: Block[] = [
      { type: 'text', id: 'b1', data: { content: 'Hello from block' } },
    ]
    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByTestId('markdown')).toHaveTextContent(
      'Hello from block',
    )
  })

  it('renders a fallback for unknown block type', () => {
    const blocks: Block[] = [
      { type: 'custom_widget', id: 'b2', data: { foo: 'bar' } },
    ]
    render(<BlockRenderer blocks={blocks} />)
    expect(
      screen.getByText(/Unknown block type: custom_widget/),
    ).toBeInTheDocument()
  })

  it('renders multiple blocks', () => {
    const blocks: Block[] = [
      { type: 'text', id: 'b1', data: { content: 'First' } },
      { type: 'text', id: 'b2', data: { content: 'Second' } },
    ]
    render(<BlockRenderer blocks={blocks} />)
    const markdowns = screen.getAllByTestId('markdown')
    expect(markdowns).toHaveLength(2)
    expect(markdowns[0]).toHaveTextContent('First')
    expect(markdowns[1]).toHaveTextContent('Second')
  })

  it('uses custom block component when provided', () => {
    function MyBlock({ data }: { data: { value: string } }) {
      return <span data-testid="custom">{data.value}</span>
    }

    const blocks: Block[] = [
      { type: 'my_type', id: 'c1', data: { value: 'custom-val' } },
    ]
    render(<BlockRenderer blocks={blocks} customBlocks={{ my_type: MyBlock }} />)
    expect(screen.getByTestId('custom')).toHaveTextContent('custom-val')
  })

  it('has no axe violations', async () => {
    const blocks: Block[] = [
      { type: 'text', id: 'b1', data: { content: 'Accessible block' } },
    ]
    const { container } = render(<BlockRenderer blocks={blocks} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ────────────────────────────────────────────────────────────────────────────
// AIConversation
// ────────────────────────────────────────────────────────────────────────────

describe('AIConversation', () => {
  it('renders with empty messages array', () => {
    const { container } = render(<AIConversation messages={[]} />)
    // Should render the scroll container with aria-live
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toBeTruthy()
  })

  it('renders user messages', () => {
    const messages = [makeUserMessage('u1', 'What is the weather?')]
    render(<AIConversation messages={messages} />)
    expect(screen.getByText('What is the weather?')).toBeInTheDocument()
  })

  it('renders assistant messages with blocks', () => {
    const messages = [
      makeAssistantMessage('a1', [
        { type: 'text', id: 't1', data: { content: 'It is sunny.' } },
      ]),
    ]
    render(
      <AIConversation
        messages={messages}
        agent={{ name: 'WeatherBot' }}
      />,
    )
    expect(screen.getByText('WeatherBot')).toBeInTheDocument()
    expect(screen.getByTestId('markdown')).toHaveTextContent('It is sunny.')
  })

  it('shows processing indicator when isProcessing is true', () => {
    render(
      <AIConversation
        messages={[]}
        isProcessing
        agent={{ name: 'Bot' }}
      />,
    )
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveAttribute('aria-busy', 'true')
  })

  it('shows processing steps', () => {
    render(
      <AIConversation
        messages={[]}
        isProcessing
        processingSteps={[
          { id: 's1', label: 'Fetching data', status: 'active' },
          { id: 's2', label: 'Analyzing', status: 'pending' },
        ]}
        agent={{ name: 'Bot' }}
      />,
    )
    expect(screen.getByText('Fetching data')).toBeInTheDocument()
    expect(screen.getByText('Analyzing')).toBeInTheDocument()
  })

  it('resolves agent from AICommandProvider context', () => {
    const messages = [
      makeAssistantMessage('a1', [
        { type: 'text', id: 't1', data: { content: 'Hi' } },
      ]),
    ]
    render(
      <AICommandProvider agent={{ name: 'CtxAgent' }}>
        <AIConversation messages={messages} />
      </AICommandProvider>,
    )
    expect(screen.getByText('CtxAgent')).toBeInTheDocument()
  })

  it('prop agent overrides context agent', () => {
    const messages = [
      makeAssistantMessage('a1', [
        { type: 'text', id: 't1', data: { content: 'Hi' } },
      ]),
    ]
    render(
      <AICommandProvider agent={{ name: 'CtxAgent' }}>
        <AIConversation
          messages={messages}
          agent={{ name: 'PropAgent' }}
        />
      </AICommandProvider>,
    )
    expect(screen.getByText('PropAgent')).toBeInTheDocument()
    expect(screen.queryByText('CtxAgent')).not.toBeInTheDocument()
  })

  it('has no axe violations with mixed messages', async () => {
    const messages = [
      makeUserMessage('u1', 'Hello'),
      makeAssistantMessage('a1', [
        { type: 'text', id: 't1', data: { content: 'Hi there' } },
      ]),
    ]
    const { container } = render(
      <AIConversation messages={messages} agent={{ name: 'Bot' }} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ────────────────────────────────────────────────────────────────────────────
// CommandBar
// ────────────────────────────────────────────────────────────────────────────

describe('CommandBar', () => {
  it('renders hero variant without crashing', () => {
    render(<CommandBar variant="hero" />)
    const search = screen.getByRole('search')
    expect(search).toBeInTheDocument()
  })

  it('renders inline variant without crashing', () => {
    render(<CommandBar variant="inline" />)
    const search = screen.getByRole('search')
    expect(search).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<CommandBar variant="inline" placeholder="Type here..." />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('placeholder', 'Type here...')
  })

  it('renders greeting text in hero variant', () => {
    render(<CommandBar variant="hero" greeting="Good morning!" />)
    expect(screen.getByText('Good morning!')).toBeInTheDocument()
  })

  it('renders hint buttons in hero variant', () => {
    render(
      <CommandBar
        variant="hero"
        hints={['Create task', 'Show metrics']}
      />,
    )
    expect(screen.getByText('Create task')).toBeInTheDocument()
    expect(screen.getByText('Show metrics')).toBeInTheDocument()
  })

  it('calls onSubmit when Enter is pressed with a query', () => {
    const onSubmit = vi.fn()
    render(<CommandBar variant="inline" onSubmit={onSubmit} />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledWith('test query')
  })

  it('does not submit when query is empty', () => {
    const onSubmit = vi.fn()
    render(<CommandBar variant="inline" onSubmit={onSubmit} />)
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit when disabled', () => {
    const onSubmit = vi.fn()
    render(<CommandBar variant="inline" onSubmit={onSubmit} disabled />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows spinner during processing state', () => {
    render(<CommandBar variant="inline" state="processing" />)
    expect(screen.getByTestId('command-bar-spinner')).toBeInTheDocument()
  })

  it('shows clear button in responded state', () => {
    render(<CommandBar variant="inline" state="responded" />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('has no axe violations (inline variant)', async () => {
    const { container } = render(
      <CommandBar variant="inline" placeholder="Ask..." />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no axe violations (hero variant)', async () => {
    const { container } = render(
      <CommandBar
        variant="hero"
        placeholder="Ask anything..."
        greeting="Hello"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
