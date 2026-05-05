import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Banner } from './banner'

describeConformance('Banner', (props) => <Banner {...props}>System update</Banner>, {
  colors: ['info', 'success', 'warning', 'error', 'neutral'],
})

describe('Banner', () => {
  it('renders with role="alert"', () => {
    render(<Banner>System update available</Banner>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<Banner>Scheduled maintenance tonight</Banner>)
    expect(screen.getByRole('alert')).toHaveTextContent('Scheduled maintenance tonight')
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

})
