import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisuallyHidden } from '../visually-hidden'

describe('VisuallyHidden', () => {
  it('renders children', () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>)
    expect(screen.getByText('Hidden label')).toBeInTheDocument()
  })

  it('applies sr-only class', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>)
    expect(screen.getByText('Screen reader text')).toHaveClass('sr-only')
  })

  it('applies custom className alongside sr-only', () => {
    render(<VisuallyHidden className="extra">Text</VisuallyHidden>)
    const el = screen.getByText('Text')
    expect(el).toHaveClass('sr-only')
    expect(el).toHaveClass('extra')
  })

  it('renders as a span element', () => {
    render(<VisuallyHidden>Label</VisuallyHidden>)
    expect(screen.getByText('Label').tagName).toBe('SPAN')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLSpanElement>
    render(<VisuallyHidden ref={ref}>Ref test</VisuallyHidden>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
