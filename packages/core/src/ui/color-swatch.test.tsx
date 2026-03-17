import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ColorSwatch } from './color-swatch'

describe('ColorSwatch', () => {
  it('renders with given color', () => {
    render(<ColorSwatch color="#FF5733" data-testid="swatch" />)
    const el = screen.getByTestId('swatch')
    expect(el).toHaveStyle({ backgroundColor: '#FF5733' })
  })

  it('defaults to circle shape', () => {
    render(<ColorSwatch color="#000" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('rounded-full')
  })

  it('renders square shape', () => {
    render(<ColorSwatch color="#000" shape="square" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).not.toHaveClass('rounded-full')
    expect(screen.getByTestId('swatch')).toHaveClass('rounded-none')
  })

  it('renders ring when ring prop is set', () => {
    render(<ColorSwatch color="#FFF" ring data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('shadow-ring-sm')
  })

  it('applies size classes', () => {
    const { rerender } = render(<ColorSwatch color="#000" size="sm" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('h-3')

    rerender(<ColorSwatch color="#000" size="lg" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('h-6')
  })

  it('merges custom className', () => {
    render(<ColorSwatch color="#000" className="my-class" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('my-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<ColorSwatch color="#000" ref={ref as React.Ref<HTMLSpanElement>} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
