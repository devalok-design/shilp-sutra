import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { AreaChart } from '../charts/area-chart'

const data = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
  { month: 'Mar', sales: 15 },
]
const series = [{ key: 'sales', label: 'Sales' }]

describe('AreaChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <AreaChart data={data} xKey="month" series={series} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AreaChart data={data} xKey="month" series={series} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<AreaChart ref={ref} data={data} xKey="month" series={series} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(
      <AreaChart data={data} xKey="month" series={series} className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(
      <AreaChart data={data} xKey="month" series={series} data-testid="ac" />,
    )
    expect(container.firstChild).toHaveAttribute('data-testid', 'ac')
  })
})
