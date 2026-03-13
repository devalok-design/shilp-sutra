import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { PieChart } from '../charts/pie-chart'

const data = [
  { label: 'Red', value: 30 },
  { label: 'Blue', value: 50 },
  { label: 'Green', value: 20 },
]

describe('PieChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<PieChart data={data} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<PieChart data={data} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<PieChart ref={ref} data={data} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(<PieChart data={data} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<PieChart data={data} data-testid="pc" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'pc')
  })
})
