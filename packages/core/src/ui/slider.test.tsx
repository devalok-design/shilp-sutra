import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Slider } from './slider'

describeConformance(
  'Slider',
  (props) => <Slider aria-label="Volume" defaultValue={[50]} {...props} />,
  { sizes: ['sm', 'md', 'lg'] },
)

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
})

describe('Slider marks', () => {
  it('renders a tick per number in `marks`, captioned with the value', () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} marks={[0, 50, 100]} />)
    for (const v of ['0', '50', '100']) {
      expect(screen.getByText(v)).toBeInTheDocument()
    }
  })

  it('positions each tick by its place on the scale, honouring min/max', () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[5]} min={0} max={10} marks={[0, 5, 10]} />,
    )
    const ticks = container.querySelectorAll('[aria-hidden="true"] > div')
    expect(ticks).toHaveLength(3)
    // 0 / 10 -> 0%, 5 / 10 -> 50%, 10 / 10 -> 100%
    expect((ticks[0] as HTMLElement).style.insetInlineStart).toBe('0%')
    expect((ticks[1] as HTMLElement).style.insetInlineStart).toBe('50%')
    expect((ticks[2] as HTMLElement).style.insetInlineStart).toBe('100%')
  })

  it('accepts object marks with custom labels', () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[50]}
        marks={[{ value: 0, label: 'Off' }, { value: 100, label: 'Max' }]}
      />,
    )
    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('label: null draws the tick with no caption', () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[50]} marks={[{ value: 25, label: null }]} />,
    )
    expect(container.querySelectorAll('[aria-hidden="true"] > div')).toHaveLength(1)
    expect(screen.queryByText('25')).not.toBeInTheDocument()
  })

  it('reads marks from Slider.Mark children', () => {
    render(
      <Slider aria-label="Volume" defaultValue={[50]}>
        <Slider.Mark value={30}>Launch</Slider.Mark>
      </Slider>,
    )
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })

  it('merges both forms and sorts them by position', () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[50]} marks={[100, 0]}>
        <Slider.Mark value={50} />
      </Slider>,
    )
    const ticks = [...container.querySelectorAll('[aria-hidden="true"] > div')]
    expect(ticks.map((t) => (t as HTMLElement).style.insetInlineStart)).toEqual([
      '0%',
      '50%',
      '100%',
    ])
  })

  it('marks are hidden from assistive tech — the thumb already announces the value', () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[50]} marks={[0, 100]} />,
    )
    const group = container.querySelector('[aria-hidden="true"]')
    expect(group).toBeInTheDocument()
    expect(group).toContainElement(screen.getByText('0'))
  })

  it('renders no tick container when there are no marks', () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={[50]} />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })
})

describe('Slider value bubble', () => {
  it('is absent by default', () => {
    render(<Slider aria-label="Volume" defaultValue={[42]} />)
    expect(screen.queryByText('42')).not.toBeInTheDocument()
  })

  it('showValue renders the current value', () => {
    render(<Slider aria-label="Volume" defaultValue={[42]} showValue />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formatValue controls the text', () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[42]}
        showValue
        formatValue={(v) => `${v}%`}
      />,
    )
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('renders one bubble per thumb on a range', () => {
    render(<Slider aria-label="Range" defaultValue={[20, 80]} showValue />)
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it("showValue='interact' still renders the node, hidden until focus", () => {
    render(<Slider aria-label="Volume" defaultValue={[42]} showValue="interact" />)
    const bubble = screen.getByText('42')
    // opacity is CSS-driven off data-visible, so the node exists either way —
    // asserting on the attribute rather than a computed style jsdom won't apply
    expect(bubble).not.toHaveAttribute('data-visible')
  })

  it('the bubble is hidden from assistive tech (the thumb carries the value)', () => {
    render(<Slider aria-label="Volume" defaultValue={[42]} showValue />)
    expect(screen.getByText('42')).toHaveAttribute('aria-hidden', 'true')
  })
})
