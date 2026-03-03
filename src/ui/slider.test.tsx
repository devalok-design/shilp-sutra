import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'
import { axe } from 'vitest-axe'
import { Slider } from './slider'

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('Slider', () => {
  it('renders with aria-label', () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('renders with default value', () => {
    render(<Slider aria-label="Volume" defaultValue={[75]} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders with min and max', () => {
    render(
      <Slider aria-label="Volume" defaultValue={[5]} min={0} max={10} />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '10')
  })

  it('renders disabled state', () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} disabled />)
    // Radix Slider uses data-disabled attribute rather than native disabled
    expect(screen.getByRole('slider')).toHaveAttribute('data-disabled')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(
      <Slider
        ref={ref as React.Ref<HTMLSpanElement>}
        aria-label="Ref test"
        defaultValue={[50]}
      />,
    )
    // Radix Slider Root renders as a span
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('merges custom className', () => {
    const { container } = render(
      <Slider
        aria-label="Styled"
        defaultValue={[50]}
        className="my-slider"
      />,
    )
    expect(container.querySelector('.my-slider')).toBeInTheDocument()
  })

  it('supports step prop', () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[50]}
        step={10}
        min={0}
        max={100}
      />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Slider aria-label="Volume control" defaultValue={[50]} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
