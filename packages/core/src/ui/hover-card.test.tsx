import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'

describe('HoverCard', () => {
  it('renders the trigger', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="/profile">Hover target</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>Card details</p>
        </HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Hover target')).toBeInTheDocument()
  })

  it('does not show content by default', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="/profile">Hover target</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>Card details</p>
        </HoverCardContent>
      </HoverCard>,
    )
    expect(screen.queryByText('Card details')).not.toBeInTheDocument()
  })

  it('shows content when controlled open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="/profile">Trigger</a>
        </HoverCardTrigger>
        <HoverCardContent>Controlled hover card</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Controlled hover card')).toBeInTheDocument()
  })

  it('shows content via pointerEnter on trigger', async () => {
    render(
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <a href="/profile">Hover me</a>
        </HoverCardTrigger>
        <HoverCardContent>Hovered content</HoverCardContent>
      </HoverCard>,
    )
    fireEvent.pointerEnter(screen.getByText('Hover me'))
    await waitFor(() => {
      expect(screen.getByText('Hovered content')).toBeInTheDocument()
    })
  })

  it('calls onOpenChange when opened via pointer', async () => {
    const onOpenChange = vi.fn()
    render(
      <HoverCard onOpenChange={onOpenChange} openDelay={0}>
        <HoverCardTrigger asChild>
          <a href="/profile">Trigger</a>
        </HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>,
    )
    fireEvent.pointerEnter(screen.getByText('Trigger'))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  it('merges className on content', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="/profile">Trigger</a>
        </HoverCardTrigger>
        <HoverCardContent className="custom-hover-card">Details</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Details').className).toContain('custom-hover-card')
  })

  it('supports defaultOpen prop', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild>
          <a href="/profile">Trigger</a>
        </HoverCardTrigger>
        <HoverCardContent>Default open content</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Default open content')).toBeInTheDocument()
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="/profile">Trigger</a>
        </HoverCardTrigger>
        <HoverCardContent>Accessible hover card</HoverCardContent>
      </HoverCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
