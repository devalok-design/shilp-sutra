import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { GaugeChart } from '../charts/gauge-chart'

describe('GaugeChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<GaugeChart value={75} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<GaugeChart value={75} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<GaugeChart ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(<GaugeChart value={50} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<GaugeChart value={50} data-testid="gc" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'gc')
  })
})
