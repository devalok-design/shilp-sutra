import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Button variant="error">Delete</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref as React.Ref<HTMLButtonElement>}>Ref test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Styled</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('renders startIcon before children', () => {
    const Icon = () => <svg data-testid="start-icon" />
    render(<Button startIcon={<Icon />}>Click</Button>)
    const button = screen.getByRole('button')
    const icon = screen.getByTestId('start-icon')
    expect(button).toContainElement(icon)
    expect(button.firstElementChild).toContainElement(icon)
  })

  it('renders endIcon after children', () => {
    const Icon = () => <svg data-testid="end-icon" />
    render(<Button endIcon={<Icon />}>Click</Button>)
    const button = screen.getByRole('button')
    const icon = screen.getByTestId('end-icon')
    expect(button).toContainElement(icon)
    expect(button.lastElementChild).toContainElement(icon)
  })

  it('renders both startIcon and endIcon', () => {
    render(
      <Button
        startIcon={<svg data-testid="start" />}
        endIcon={<svg data-testid="end" />}
      >
        Text
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(screen.getByTestId('start')).toBeInTheDocument()
    expect(screen.getByTestId('end')).toBeInTheDocument()
  })

  it('shows loading state with spinner and disables button', () => {
    render(<Button loading>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('loading replaces startIcon by default', () => {
    const Icon = () => <svg data-testid="start-icon" />
    render(<Button loading startIcon={<Icon />}>Save</Button>)
    expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('loading center hides children and shows spinner', () => {
    render(<Button loading loadingPosition="center">Save</Button>)
    const button = screen.getByRole('button')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(button.textContent).toContain('Save')
  })

  it('does not fire onClick when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Wide</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
