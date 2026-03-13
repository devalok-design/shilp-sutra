import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Sparkline } from '../charts/sparkline'

const data = [10, 20, 15, 25, 30, 18]

describe('Sparkline', () => {
  it('renders without crashing', () => {
    const { container } = render(<Sparkline data={data} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Sparkline data={data} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref to SVG element', () => {
    const ref = { current: null as SVGSVGElement | null }
    render(<Sparkline ref={ref} data={data} />)
    expect(ref.current).toBeInstanceOf(SVGSVGElement)
  })

  it('merges className', () => {
    const { container } = render(<Sparkline data={data} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<Sparkline data={data} data-testid="sp" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'sp')
  })
})
