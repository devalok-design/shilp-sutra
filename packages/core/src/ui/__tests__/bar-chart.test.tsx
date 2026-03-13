import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { BarChart } from '../charts/bar-chart'

const data = [
  { category: 'A', value: 30 },
  { category: 'B', value: 50 },
  { category: 'C', value: 20 },
]

describe('BarChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BarChart data={data} xKey="category" yKey="value" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BarChart data={data} xKey="category" yKey="value" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<BarChart ref={ref} data={data} xKey="category" yKey="value" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(
      <BarChart data={data} xKey="category" yKey="value" className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(
      <BarChart data={data} xKey="category" yKey="value" data-testid="bc" />,
    )
    expect(container.firstChild).toHaveAttribute('data-testid', 'bc')
  })
})
