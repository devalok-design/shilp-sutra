import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Alert } from './alert'

describeConformance('Alert', (props) => <Alert {...props}>Something happened</Alert>, {
  variants: ['subtle', 'solid', 'outline'],
  sizes: ['sm', 'md', 'lg'],
  colors: ['info', 'success', 'warning', 'error', 'neutral'],
})

describe('Alert', () => {
  it('renders with role="alert"', () => {
    render(<Alert>Something happened</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<Alert>Something happened</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Something happened')
  })

  it('renders title when provided', () => {
    render(<Alert title="Heads up">Details here</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Heads up')
    expect(alert).toHaveTextContent('Details here')
  })

  it('shows dismiss button when with onDismiss', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(
      <Alert onDismiss={onDismiss}>
        Dismissible alert
      </Alert>,
    )

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' })
    expect(dismissBtn).toBeInTheDocument()

    await user.click(dismissBtn)
    await waitFor(() => expect(onDismiss).toHaveBeenCalledOnce())
  })

  it('does not show dismiss button when not dismissible', () => {
    render(<Alert>Non-dismissible</Alert>)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })
})
