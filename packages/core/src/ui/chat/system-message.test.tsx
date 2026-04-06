import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SystemMessage } from './system-message'

describe('SystemMessage', () => {
  it('event variant renders compact with bg tint', () => {
    const { container } = render(
      <SystemMessage>User joined the channel</SystemMessage>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('bg-surface-raised-hover/30')
    expect(screen.getByText('User joined the channel')).toBeInTheDocument()
  })

  it('alert variant renders centered error banner', () => {
    const { container } = render(
      <SystemMessage variant="alert">Connection lost</SystemMessage>,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('flex', 'justify-center')
    // Inner banner has error bg
    const banner = root.firstChild as HTMLElement
    expect(banner).toHaveClass('bg-error-3')
    expect(screen.getByText('Connection lost')).toBeInTheDocument()
  })

  it('alert variant auto-renders IconAlertCircle when no icon provided', () => {
    const { container } = render(
      <SystemMessage variant="alert">Error</SystemMessage>,
    )
    // Should have an SVG (the auto icon)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('icon renders when provided', () => {
    render(
      <SystemMessage icon={<span data-testid="custom-icon">!</span>}>
        Event
      </SystemMessage>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('timestamp renders formatted', () => {
    const { container } = render(
      <SystemMessage timestamp="2026-03-25T14:30:00Z">
        Event
      </SystemMessage>,
    )
    // The event variant root contains child spans; the last one is the timestamp
    const root = container.firstChild as HTMLElement
    const spans = root.querySelectorAll('span')
    const lastSpan = spans[spans.length - 1]
    // Should contain a colon (time format like "2:30 PM")
    expect(lastSpan.textContent).toMatch(/\d+:\d+/)
  })

  it('default variant is event', () => {
    const { container } = render(
      <SystemMessage>Default variant</SystemMessage>,
    )
    const root = container.firstChild as HTMLElement
    // Should have event variant classes, not alert classes
    expect(root.className).toContain('bg-surface-raised-hover/30')
    expect(root).not.toHaveClass('justify-center')
  })
})
