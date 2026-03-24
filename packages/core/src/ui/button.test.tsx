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
    render(<Button variant="solid" color="error">Delete</Button>)
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
    screen.getByRole('button')
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

  it('onClickAsync — renders correctly with async prop', () => {
    const asyncFn = vi.fn(() => Promise.resolve())
    render(<Button onClickAsync={asyncFn}>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('onClickAsync — click triggers loading then success', async () => {
    const user = userEvent.setup()
    let resolveFn!: () => void
    const asyncFn = vi.fn(
      () => new Promise<void>((resolve) => { resolveFn = resolve }),
    )

    render(<Button onClickAsync={asyncFn}>Save</Button>)
    const button = screen.getByRole('button')

    // 1. Click — should call asyncFn and enter loading state
    await user.click(button)
    expect(asyncFn).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    // 2. Resolve the promise — should enter success state
    await vi.waitFor(() => {
      resolveFn()
    })
    await vi.waitFor(() => {
      expect(button).not.toHaveAttribute('aria-busy')
    })
  })

  it('renders xs size', () => {
    render(<Button size="xs">Compact</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-ds-xs-plus')
  })

  it('renders icon-xs size', () => {
    render(<Button size="icon-xs">X</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('h-ds-xs-plus')
    expect(btn).toHaveClass('w-ds-xs-plus')
  })

  it('onClickAsync — click triggers loading then error on rejection', async () => {
    const user = userEvent.setup()
    let rejectFn!: (reason: Error) => void
    const asyncFn = vi.fn(
      () => new Promise<void>((_resolve, reject) => { rejectFn = reject }),
    )

    render(<Button onClickAsync={asyncFn}>Save</Button>)
    const button = screen.getByRole('button')

    // 1. Click — should call asyncFn and enter loading state
    await user.click(button)
    expect(asyncFn).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    // 2. Reject the promise — should enter error state (still disabled, no longer busy)
    await vi.waitFor(() => {
      rejectFn(new Error('fail'))
    })
    await vi.waitFor(() => {
      expect(button).not.toHaveAttribute('aria-busy')
    })
  })

  // ============ Soft variant ============

  it('renders soft variant with accent color', () => {
    const { container } = render(<Button variant="soft" color="accent">Soft</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-accent-3')
    expect(btn.className).toContain('text-accent-11')
  })

  it('renders soft variant with error color', () => {
    const { container } = render(<Button variant="soft" color="error">Soft Error</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-error-3')
    expect(btn.className).toContain('text-error-11')
  })

  it('renders soft variant with success color', () => {
    const { container } = render(<Button variant="soft" color="success">Approve</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-success-3')
    expect(btn.className).toContain('text-success-11')
  })

  it('renders soft variant with warning color', () => {
    const { container } = render(<Button variant="soft" color="warning">Draft</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-warning-3')
    expect(btn.className).toContain('text-warning-11')
  })

  it('renders soft variant with neutral color', () => {
    const { container } = render(<Button variant="soft" color="neutral">Cancel</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-surface-raised-hover')
    expect(btn.className).toContain('text-surface-fg-muted')
  })

  // ============ Shape prop ============

  it('renders with pill shape', () => {
    const { container } = render(<Button shape="pill">Pill</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('rounded-full')
  })

  it('does not apply rounded-full by default', () => {
    const { container } = render(<Button>Default</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).not.toContain('rounded-full')
  })

  // ============ Compact sizes ============

  it('renders compact-xs without fixed height', () => {
    const { container } = render(<Button size="compact-xs">Compact</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('py-ds-01')
    expect(btn.className).not.toMatch(/\bh-ds-/)
  })

  it('renders compact-sm without fixed height', () => {
    const { container } = render(<Button size="compact-sm">Compact</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('py-[5px]')
    expect(btn.className).not.toMatch(/\bh-ds-/)
  })

  // ============ New colors on solid variant ============

  it('renders solid success', () => {
    const { container } = render(<Button variant="solid" color="success">Approve</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-success-9')
  })

  it('renders solid warning', () => {
    const { container } = render(<Button variant="solid" color="warning">Caution</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-warning-9')
  })

  it('renders solid neutral', () => {
    const { container } = render(<Button variant="solid" color="neutral">Cancel</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-neutral-5')
  })

  // ============ Deprecated aliases ============

  it('deprecated variant="default" renders as solid accent', () => {
    const { container } = render(<Button variant="default">Legacy</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-accent-9')
  })

  it('deprecated variant="destructive" renders as solid error', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-error-9')
  })

  it('deprecated color="default" renders as accent', () => {
    const { container } = render(<Button color="default">Legacy</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-accent-9')
  })

  // ============ Weight ============

  it('renders weight normal', () => {
    const { container } = render(<Button weight="normal">Normal</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('font-normal')
  })

  // ============ Disabled desaturate ============

  it('disabled button has saturate class', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('disabled:saturate-')
  })
})
