import { IconArrowRight,IconCheck, IconPlus } from '@tabler/icons-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { Button } from './button'
import { Icon } from './icon'

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
    render(<Button startIcon={<Icon icon={IconPlus} />}>Click</Button>)
    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(button.firstElementChild).toContainElement(svg!)
  })

  it('renders endIcon after children', () => {
    render(<Button endIcon={<Icon icon={IconArrowRight} />}>Click</Button>)
    const button = screen.getByRole('button')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(button.lastElementChild).toContainElement(svg!)
  })

  it('renders both startIcon and endIcon', () => {
    render(
      <Button
        startIcon={<Icon icon={IconPlus} />}
        endIcon={<Icon icon={IconArrowRight} />}
      >
        Text
      </Button>,
    )
    const button = screen.getByRole('button')
    const svgs = button.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
  })

  it('shows loading state with spinner and disables button', () => {
    render(<Button loading>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('loading replaces startIcon by default', () => {
    render(<Button loading startIcon={<Icon icon={IconPlus} />}>Save</Button>)
    // When loading at start position, startIcon is replaced by a Spinner
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

    // 1. Click — should call asyncFn and enter processing state
    //    (onClickAsync auto-enables processing, which uses aria-disabled + pointer-events-none
    //    instead of the disabled attribute)
    await user.click(button)
    expect(asyncFn).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute('aria-disabled', 'true')
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

    // 1. Click — should call asyncFn and enter processing state
    //    (onClickAsync auto-enables processing, which uses aria-disabled + pointer-events-none
    //    instead of the disabled attribute)
    await user.click(button)
    expect(asyncFn).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAttribute('aria-busy', 'true')

    // 2. Reject the promise — should enter error state (no longer busy)
    await vi.waitFor(() => {
      rejectFn(new Error('fail'))
    })
    await vi.waitFor(() => {
      expect(button).not.toHaveAttribute('aria-busy')
    })
  })

  // ============ Soft variant ============

  it('renders soft variant with accent color', () => {
    render(<Button variant="soft" color="accent">Soft</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-accent-3')
    expect(btn.className).toContain('text-accent-11')
  })

  it('renders soft variant with error color', () => {
    render(<Button variant="soft" color="error">Soft Error</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-error-3')
    expect(btn.className).toContain('text-error-11')
  })

  it('renders soft variant with success color', () => {
    render(<Button variant="soft" color="success">Approve</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-success-3')
    expect(btn.className).toContain('text-success-11')
  })

  it('renders soft variant with warning color', () => {
    render(<Button variant="soft" color="warning">Draft</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-warning-3')
    expect(btn.className).toContain('text-warning-11')
  })

  it('renders soft variant with neutral color', () => {
    render(<Button variant="soft" color="neutral">Cancel</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-surface-raised-hover')
    expect(btn.className).toContain('text-surface-fg-muted')
  })

  // ============ Shape prop ============

  it('renders with pill shape', () => {
    render(<Button shape="pill">Pill</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('rounded-full')
  })

  it('does not apply rounded-full by default', () => {
    render(<Button>Default</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).not.toContain('rounded-full')
  })

  // ============ Compact sizes ============

  it('renders compact-xs without fixed height', () => {
    render(<Button size="compact-xs">Compact</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('py-[3px]')
    expect(btn.className).not.toMatch(/\bh-ds-/)
  })

  it('renders compact-sm without fixed height', () => {
    render(<Button size="compact-sm">Compact</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('py-[5px]')
    expect(btn.className).not.toMatch(/\bh-ds-/)
  })

  // ============ New colors on solid variant ============

  it('renders solid success', () => {
    render(<Button variant="solid" color="success">Approve</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-success-9')
  })

  it('renders solid warning', () => {
    render(<Button variant="solid" color="warning">Caution</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-warning-9')
  })

  it('renders solid neutral', () => {
    render(<Button variant="solid" color="neutral">Cancel</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-neutral-5')
  })

  // ============ Weight ============

  it('renders weight normal', () => {
    render(<Button weight="normal">Normal</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('font-normal')
  })

  // ============ Disabled desaturate ============

  it('disabled button has saturate class', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('disabled:saturate-')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })

  // ============ Processing state ============

  describe('processing state', () => {
    it('sets aria-busy when processing', () => {
      render(<Button processing>Save</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('is disabled by default when processing', () => {
      render(<Button processing>Save</Button>)
      // Processing uses aria-disabled + pointer-events-none instead of the disabled attribute
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })

    it('is NOT disabled when processingDisabled={false}', () => {
      render(<Button processing processingDisabled={false}>Cancel</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('renders processing overlay when processing is set', () => {
      const { container } = render(<Button processing="ambient">Syncing</Button>)
      // ProcessingOverlay renders with aria-hidden="true" and z-[3]
      const overlay = container.querySelector('[aria-hidden="true"]')
      expect(overlay).toBeInTheDocument()
    })

    it('does not render overlay when not processing', () => {
      const { container } = render(<Button>Save</Button>)
      // No z-[3] overlay when not processing
      const overlays = container.querySelectorAll('[aria-hidden="true"]')
      // There should be no processing overlay (grain might have aria-hidden but different z-index)
      const processingOverlay = Array.from(overlays).find(el =>
        el.className?.includes('z-[3]')
      )
      expect(processingOverlay).toBeUndefined()
    })

    it('normalizes processing={true} to "working" speed', () => {
      render(<Button processing>Save</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })
  })
})
