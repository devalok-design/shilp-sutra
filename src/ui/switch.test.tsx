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
      <label>
        Dark mode
        <Switch />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
