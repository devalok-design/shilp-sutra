import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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
import { BlockRenderer } from '../block-renderer'
import type { Block } from '../types'

describe('BlockRenderer', () => {
  it('renders a text block', () => {
    render(<BlockRenderer blocks={[{ type: 'text', data: { content: 'Hello' } }]} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders multiple blocks in sequence', () => {
    const blocks: Block[] = [
      { type: 'text', data: { content: 'First' } },
      { type: 'info', data: { message: 'Second' } },
    ]
    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('passes onAction to blocks', async () => {
    const onAction = vi.fn()
    render(
      <BlockRenderer
        blocks={[{ type: 'confirm', data: { actionId: 'x', label: 'Go' } }]}
        onAction={onAction}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /go/i }))
    expect(onAction).toHaveBeenCalledWith('x', 'confirm')
  })

  it('renders custom blocks from prop', () => {
    const Custom = ({ data }: { data: any }) => <div>Custom: {data.value}</div>
    render(
      <BlockRenderer
        blocks={[{ type: 'my_custom', data: { value: 'test' } }]}
        customBlocks={{ my_custom: Custom }}
      />
    )
    expect(screen.getByText('Custom: test')).toBeInTheDocument()
  })

  it('renders custom blocks from context', () => {
    const Custom = ({ data }: { data: any }) => <div>Context: {data.value}</div>
    render(
      <AICommandProvider customBlocks={{ ctx_block: Custom }}>
        <BlockRenderer blocks={[{ type: 'ctx_block', data: { value: 'from-ctx' } }]} />
      </AICommandProvider>
    )
    expect(screen.getByText('Context: from-ctx')).toBeInTheDocument()
  })

  it('prop customBlocks override context customBlocks', () => {
    const CtxBlock = ({ data }: { data: any }) => <div>Context: {data.v}</div>
    const PropBlock = ({ data }: { data: any }) => <div>Prop: {data.v}</div>
    render(
      <AICommandProvider customBlocks={{ test: CtxBlock }}>
        <BlockRenderer
          blocks={[{ type: 'test', data: { v: '1' } }]}
          customBlocks={{ test: PropBlock }}
        />
      </AICommandProvider>
    )
    expect(screen.getByText('Prop: 1')).toBeInTheDocument()
  })

  it('renders fallback for unknown block types', () => {
    render(<BlockRenderer blocks={[{ type: 'nonexistent', data: { foo: 'bar' } }]} />)
    expect(screen.getByText(/unknown block type/i)).toBeInTheDocument()
  })

  it('renders empty without error when blocks is empty', () => {
    const { container } = render(<BlockRenderer blocks={[]} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('uses onAction from context when prop not provided', async () => {
    const ctxAction = vi.fn()
    render(
      <AICommandProvider onAction={ctxAction}>
        <BlockRenderer
          blocks={[{ type: 'confirm', data: { actionId: 'y', label: 'Confirm' } }]}
        />
      </AICommandProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(ctxAction).toHaveBeenCalledWith('y', 'confirm')
  })

  it('prop onAction overrides context onAction', async () => {
    const ctxAction = vi.fn()
    const propAction = vi.fn()
    render(
      <AICommandProvider onAction={ctxAction}>
        <BlockRenderer
          blocks={[{ type: 'confirm', data: { actionId: 'z', label: 'Do' } }]}
          onAction={propAction}
        />
      </AICommandProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /do/i }))
    expect(propAction).toHaveBeenCalled()
    expect(ctxAction).not.toHaveBeenCalled()
  })
})
