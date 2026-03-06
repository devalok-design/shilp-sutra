import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  const TestIcon = () => <svg data-testid="icon" />

  it('renders icon inside a button', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Add item" />)
    const button = screen.getByRole('button', { name: 'Add item' })
    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('requires aria-label for accessibility', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Delete" />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Delete')
  })

  it('applies circle shape with rounded-ds-full', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Menu" shape="circle" />)
    expect(screen.getByRole('button')).toHaveClass('rounded-ds-full')
  })

  it('defaults to square shape', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Menu" />)
    expect(screen.getByRole('button')).not.toHaveClass('rounded-ds-full')
  })

  it('forwards variant prop to underlying Button', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Delete" variant="solid" color="error" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('maps size sm to icon-sm', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Add" size="sm" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon={<TestIcon />} aria-label="Click" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows loading state', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Loading" loading />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <IconButton
        ref={ref as React.Ref<HTMLButtonElement>}
        icon={<TestIcon />}
        aria-label="Ref test"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
