import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Switch } from './switch'

describe('Switch', () => {
  it('renders as unchecked by default', () => {
    render(<Switch aria-label="Toggle feature" />)
    const toggle = screen.getByRole('switch', { name: 'Toggle feature' })
    expect(toggle).not.toBeChecked()
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on click', async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Switch
        aria-label="Toggle feature"
        onCheckedChange={onCheckedChange}
      />,
    )

    await user.click(screen.getByRole('switch'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders checked state when checked prop is true', () => {
    render(<Switch aria-label="Toggle feature" checked />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeChecked()
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('renders with defaultChecked', () => {
    render(<Switch aria-label="Toggle feature" defaultChecked />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('renders disabled state', () => {
    render(<Switch aria-label="Toggle feature" disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Switch
        aria-label="Toggle feature"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    )

    await user.click(screen.getByRole('switch'))

    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Switch
        ref={ref as React.Ref<HTMLButtonElement>}
        aria-label="Ref test"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className', () => {
    render(<Switch aria-label="Styled" className="my-switch" />)
    expect(screen.getByRole('switch')).toHaveClass('my-switch')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <label htmlFor="switch-dark">
        Dark mode
        <Switch id="switch-dark" />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders sm size with correct track dimensions', () => {
    render(<Switch aria-label="Small switch" size="sm" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('h-[18px]', 'w-[32px]')
  })

  it('renders lg size with correct track dimensions', () => {
    render(<Switch aria-label="Large switch" size="lg" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('h-7', 'w-[52px]')
  })

  it('renders success color when checked', () => {
    render(<Switch aria-label="Success switch" color="success" checked />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('data-[state=checked]:bg-success-9')
  })

  it('renders thumbIcon inside thumb', () => {
    render(
      <Switch
        aria-label="Icon switch"
        thumbIcon={<span data-testid="thumb-icon">!</span>}
      />,
    )
    expect(screen.getByTestId('thumb-icon')).toBeInTheDocument()
  })

  it('backward compat: no size/color props renders md/accent defaults', () => {
    render(<Switch aria-label="Default switch" />)
    const toggle = screen.getByRole('switch')
    // md track dimensions
    expect(toggle).toHaveClass('h-6', 'w-11')
    // accent checked color
    expect(toggle).toHaveClass('data-[state=checked]:bg-accent-9')
  })
})
