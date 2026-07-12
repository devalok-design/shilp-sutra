import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Switch } from './switch'

describeConformance('Switch', (props) => <Switch aria-label="Toggle feature" {...props} />, {
  sizes: ['sm', 'md', 'lg'],
  colors: ['accent', 'success', 'warning'],
})

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

  it('renders thumbIcon inside thumb', () => {
    render(
      <Switch
        aria-label="Icon switch"
        thumbIcon={<span data-testid="thumb-icon">!</span>}
      />,
    )
    expect(screen.getByTestId('thumb-icon')).toBeInTheDocument()
  })

  it('state="error" overrides color prop', () => {
    render(<Switch aria-label="Error switch" color="warning" state="error" checked />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveClass('data-[state=checked]:bg-error-9')
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
