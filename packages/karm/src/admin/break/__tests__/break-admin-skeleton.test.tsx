import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { BreakAdminSkeleton } from '../break-admin-skeleton'

describe('BreakAdminSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<BreakAdminSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BreakAdminSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<BreakAdminSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts className', () => {
    const { container } = render(<BreakAdminSkeleton className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
