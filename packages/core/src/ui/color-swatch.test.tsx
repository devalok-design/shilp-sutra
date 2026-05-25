import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { ColorSwatch } from './color-swatch'

describeConformance(
  'ColorSwatch',
  (props) => <ColorSwatch color="#FF5733" {...props} />,
)

describe('ColorSwatch', () => {
  it('renders with given color', () => {
    render(<ColorSwatch color="#FF5733" data-testid="swatch" />)
    const el = screen.getByTestId('swatch')
    expect(el).toHaveStyle({ backgroundColor: '#FF5733' })
  })

  it('defaults to circle shape', () => {
    render(<ColorSwatch color="#000" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).toHaveClass('rounded-pill')
  })

  it('renders square shape', () => {
    render(<ColorSwatch color="#000" shape="square" data-testid="swatch" />)
    expect(screen.getByTestId('swatch')).not.toHaveClass('rounded-pill')
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

})
