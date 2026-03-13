import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { LineChart } from '../charts/line-chart'

const data = [
  { month: 'Jan', revenue: 100 },
  { month: 'Feb', revenue: 150 },
  { month: 'Mar', revenue: 200 },
]
const series = [{ key: 'revenue', label: 'Revenue' }]

describe('LineChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<LineChart ref={ref} data={data} xKey="month" series={series} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} data-testid="lc" />,
    )
    expect(container.firstChild).toHaveAttribute('data-testid', 'lc')
  })
})
