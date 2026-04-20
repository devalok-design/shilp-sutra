import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Banner } from './banner'

describe('Banner', () => {
  it('renders with role="alert"', () => {
    render(<Banner>System update available</Banner>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<Banner>Scheduled maintenance tonight</Banner>)
    expect(screen.getByRole('alert')).toHaveTextContent('Scheduled maintenance tonight')
  })

  it('applies info color classes by default', () => {
    render(<Banner>Info banner</Banner>)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('info')
  })

  it('applies color variant classes', () => {
    const { rerender } = render(<Banner color="error">Error</Banner>)
    expect(screen.getByRole('alert').className).toContain('error')

    rerender(<Banner color="success">Success</Banner>)
    expect(screen.getByRole('alert').className).toContain('success')

    rerender(<Banner color="warning">Warning</Banner>)
    expect(screen.getByRole('alert').className).toContain('warning')

    // neutral uses bg-surface-raised, not a class containing "neutral"
    rerender(<Banner color="neutral">Neutral</Banner>)
    expect(screen.getByRole('alert').className).toContain('bg-surface-raised')
  })

  it('shows dismiss button when onDismiss is provided', () => {
    render(<Banner onDismiss={() => {}}>Dismissible</Banner>)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('does not show dismiss button without onDismiss', () => {
    render(<Banner>Not dismissible</Banner>)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })

  it('hides banner when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<Banner onDismiss={onDismiss}>Dismiss me</Banner>)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    // framer-motion exit sets height: 0 + opacity: 0 in JSDOM
    // (onExitComplete / onDismiss only fires after real animation completes,
    //  which doesn't happen in JSDOM — so we assert the exit state instead)
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveStyle({ height: '0px', opacity: '0' })
    })
  })

  it('renders actions slot', () => {
    render(
      <Banner actions={<button>View details</button>}>
        New update
      </Banner>,
    )
    expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument()
  })

  it('renders deprecated action prop', () => {
    render(
      <Banner action={<button>Legacy action</button>}>
        Legacy banner
      </Banner>,
    )
    expect(screen.getByRole('button', { name: 'Legacy action' })).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<Banner className="my-custom-banner">Custom</Banner>)
    expect(screen.getByRole('alert').className).toContain('my-custom-banner')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Banner color="warning" onDismiss={() => {}}>
        Accessible banner
      </Banner>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
