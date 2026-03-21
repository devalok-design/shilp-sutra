import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toaster } from '../toaster'

describe('Toaster', () => {
  it('renders without crashing', () => {
    const { container } = render(<Toaster />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Toaster className="custom-toast" />)
    expect(container.firstChild).toHaveClass('custom-toast')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<Toaster ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('renders with custom position prop without errors', () => {
    const { container } = render(<Toaster position="top-center" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
