import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Alert, alertVariants } from '../alert'

describe('Alert', () => {
  // --- Basic rendering ---
  it('renders with role="alert"', () => {
    render(<Alert>Hello</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders children text', () => {
    render(<Alert>Some message</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Some message')
  })

  it('renders title when provided', () => {
    render(<Alert title="Heads up">Body text</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Heads up')
    expect(screen.getByRole('alert')).toHaveTextContent('Body text')
  })

  it('renders dismiss button when onDismiss is provided', async () => {
    const onDismiss = vi.fn()
    render(<Alert onDismiss={onDismiss}>Dismissible</Alert>)
    const btn = screen.getByRole('button', { name: /dismiss/i })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    await waitFor(() => expect(onDismiss).toHaveBeenCalledOnce())
  })

  it('does not render dismiss button when onDismiss is absent', () => {
    render(<Alert>Not dismissible</Alert>)
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  // --- Variant prop ---
  describe('variant prop', () => {
    it('defaults to subtle (same as no variant)', () => {
      const { container } = render(<Alert color="info">Default variant</Alert>)
      const el = container.firstChild as HTMLElement
      // subtle info should have the surface background
      expect(el.className).toContain('bg-info-3')
      expect(el.className).toContain('border-info-7')
      expect(el.className).toContain('text-info-11')
    })

    it('applies subtle variant explicitly', () => {
      const { container } = render(<Alert variant="subtle" color="success">Subtle</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-success-3')
      expect(el.className).toContain('border-success-7')
      expect(el.className).toContain('text-success-11')
    })

    it('applies filled variant for info', () => {
      const { container } = render(<Alert variant="filled" color="info">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-info')
      expect(el.className).toContain('text-accent-fg')
      expect(el.className).toContain('border-transparent')
    })

    it('applies filled variant for success', () => {
      const { container } = render(<Alert variant="filled" color="success">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-success')
      expect(el.className).toContain('text-accent-fg')
    })

    it('applies filled variant for warning', () => {
      const { container } = render(<Alert variant="filled" color="warning">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-warning')
      expect(el.className).toContain('text-accent-fg')
    })

    it('applies filled variant for error', () => {
      const { container } = render(<Alert variant="filled" color="error">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-error')
      expect(el.className).toContain('text-accent-fg')
    })

    it('applies filled variant for neutral (special case)', () => {
      const { container } = render(<Alert variant="filled" color="neutral">Filled neutral</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-surface-3')
      expect(el.className).toContain('text-surface-fg')
      // neutral filled should NOT have text-on-color (it uses dark text)
      expect(el.className).not.toContain('text-accent-fg')
    })

    it('applies outline variant for info', () => {
      const { container } = render(<Alert variant="outline" color="info">Outline</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-transparent')
      expect(el.className).toContain('border-info-7')
      expect(el.className).toContain('text-info-11')
    })

    it('applies outline variant for error', () => {
      const { container } = render(<Alert variant="outline" color="error">Outline</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-transparent')
      expect(el.className).toContain('border-error-7')
      expect(el.className).toContain('text-error-11')
    })

    it('applies outline variant for neutral', () => {
      const { container } = render(<Alert variant="outline" color="neutral">Outline neutral</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('bg-transparent')
      expect(el.className).toContain('border-surface-border-strong')
      expect(el.className).toContain('text-surface-fg')
    })
  })

  // --- Filled variant icon color ---
  describe('filled variant icon styling', () => {
    it('includes svg text-on-color class for filled non-neutral', () => {
      const { container } = render(<Alert variant="filled" color="info">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('[&>svg]:text-accent-fg')
    })

    it('does not include svg text-on-color for filled neutral', () => {
      const { container } = render(<Alert variant="filled" color="neutral">Filled</Alert>)
      const el = container.firstChild as HTMLElement
      expect(el.className).not.toContain('[&>svg]:text-accent-fg')
    })
  })

  // --- alertVariants function directly ---
  describe('alertVariants', () => {
    it('returns subtle info classes by default (no args)', () => {
      const classes = alertVariants()
      expect(classes).toContain('bg-info-3')
    })

    it('returns filled error classes', () => {
      const classes = alertVariants({ variant: 'filled', color: 'error' })
      expect(classes).toContain('bg-error')
      expect(classes).toContain('text-accent-fg')
    })

    it('returns outline success classes', () => {
      const classes = alertVariants({ variant: 'outline', color: 'success' })
      expect(classes).toContain('bg-transparent')
      expect(classes).toContain('text-success-11')
      expect(classes).toContain('border-success-7')
    })
  })

  // --- className passthrough ---
  it('merges custom className', () => {
    const { container } = render(<Alert className="my-custom">Test</Alert>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('my-custom')
  })

  // --- ref forwarding ---
  it('forwards ref to the root div', () => {
    const ref = vi.fn()
    render(<Alert ref={ref}>Ref test</Alert>)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})
