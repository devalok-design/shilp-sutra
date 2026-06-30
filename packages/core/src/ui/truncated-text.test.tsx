import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TruncatedText } from './truncated-text'

const LONG = 'this-is-a-very-long-string-that-would-overflow-its-container.pdf'

/** Force the next-rendered element to report overflow (jsdom has no layout). */
function mockOverflow(scrollWidth: number, clientWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get() {
      return scrollWidth
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return clientWidth
    },
  })
}

afterEach(() => {
  // Restore jsdom's default (0) so each test starts clean.
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 0 })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 0 })
  vi.restoreAllMocks()
})

describe('TruncatedText', () => {
  it('renders the full string as the visible/accessible text in end mode', () => {
    render(<TruncatedText>{LONG}</TruncatedText>)
    expect(screen.getByText(LONG)).toBeInTheDocument()
  })

  it('applies the single-line truncate class in end mode', () => {
    render(<TruncatedText>{LONG}</TruncatedText>)
    expect(screen.getByText(LONG)).toHaveClass('truncate')
  })

  it('applies line-clamp style in clamp mode', () => {
    render(
      <TruncatedText mode="clamp" lines={3}>
        {LONG}
      </TruncatedText>,
    )
    const el = screen.getByText(LONG)
    expect(el.style.getPropertyValue('-webkit-line-clamp')).toBe('3')
    expect(el).toHaveClass('overflow-hidden')
  })

  it('renders a custom element via `as`', () => {
    render(
      <TruncatedText as="p">{LONG}</TruncatedText>,
    )
    expect(screen.getByText(LONG).tagName).toBe('P')
  })

  it('does NOT set an aria-label or tooltip when text fits (no overflow)', () => {
    // jsdom default: scrollWidth === clientWidth === 0 → not overflowing.
    render(<TruncatedText>{LONG}</TruncatedText>)
    expect(screen.getByText(LONG)).not.toHaveAttribute('aria-label')
  })

  it('sets the full string as aria-label when actually overflowing', () => {
    mockOverflow(500, 100)
    render(<TruncatedText>{LONG}</TruncatedText>)
    expect(screen.getByText(LONG)).toHaveAttribute('aria-label', LONG)
  })

  it('keeps the full string accessible in middle mode even when shortened', () => {
    mockOverflow(500, 100)
    render(<TruncatedText mode="middle">{LONG}</TruncatedText>)
    // Visible text may be shortened, but the full string is the accessible name.
    expect(screen.getByLabelText(LONG)).toBeInTheDocument()
  })

  it('can disable the tooltip recovery', () => {
    mockOverflow(500, 100)
    render(
      <TruncatedText tooltip={false}>{LONG}</TruncatedText>,
    )
    // aria-label still set (SR recovery), but no tooltip trigger wiring.
    const el = screen.getByText(LONG)
    expect(el).toHaveAttribute('aria-label', LONG)
    expect(el).not.toHaveAttribute('data-state')
  })
})
