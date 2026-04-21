import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Toggle } from './toggle'

describeConformance('Toggle', (props) => <Toggle aria-label="Bold" {...props}>B</Toggle>, {
  variants: ['default', 'outline'],
  sizes: ['sm', 'md', 'lg'],
  colors: ['accent', 'error', 'success', 'neutral'],
})

describe('Toggle', () => {
  it('renders with text content', () => {
    render(<Toggle aria-label="Bold">B</Toggle>)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('toggles pressed state on click', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )

    await user.click(screen.getByRole('button'))

    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it('renders as pressed when pressed prop is true', () => {
    render(
      <Toggle aria-label="Bold" pressed>
        B
      </Toggle>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'on')
  })

  it('renders as not pressed by default', () => {
    render(<Toggle aria-label="Bold">B</Toggle>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'off')
  })

  it('renders with defaultPressed', () => {
    render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders disabled state', () => {
    render(
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>,
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not toggle when disabled', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )

    await user.click(screen.getByRole('button'))

    expect(onPressedChange).not.toHaveBeenCalled()
  })

})
