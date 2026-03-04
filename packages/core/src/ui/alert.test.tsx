import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Alert } from './alert'

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

  it('applies variant classes via CVA', () => {
    const { rerender } = render(<Alert variant="error">Error</Alert>)
    const alertEl = screen.getByRole('alert')
    expect(alertEl.className).toContain('error')

    rerender(<Alert variant="success">Success</Alert>)
    expect(screen.getByRole('alert').className).toContain('success')
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
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not show dismiss button when not dismissible', () => {
    render(<Alert>Non-dismissible</Alert>)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })
})
