import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { DevsabhaSkeleton, BandwidthSkeleton } from '../page-skeletons'

describe('DevsabhaSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DevsabhaSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DevsabhaSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<DevsabhaSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const { container } = render(<DevsabhaSkeleton className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})

describe('BandwidthSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<BandwidthSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BandwidthSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<BandwidthSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const { container } = render(<BandwidthSkeleton className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
