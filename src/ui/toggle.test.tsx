import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Toggle } from './toggle'

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

  it('applies outline variant classes', () => {
    render(
      <Toggle aria-label="Bold" variant="outline">
        B
      </Toggle>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('applies size variant classes', () => {
    render(
      <Toggle aria-label="Bold" size="sm">
        B
      </Toggle>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-ds-sm')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Toggle ref={ref as React.Ref<HTMLButtonElement>} aria-label="Ref test">
        B
      </Toggle>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className', () => {
    render(
      <Toggle aria-label="Bold" className="my-toggle">
        B
      </Toggle>,
    )
    expect(screen.getByRole('button')).toHaveClass('my-toggle')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Toggle aria-label="Toggle bold">B</Toggle>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
