import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Slider } from './slider'

describeConformance(
  'Slider',
  (props) => <Slider aria-label="Volume" defaultValue={[50]} {...props} />,
  { sizes: ['sm', 'md', 'lg'] },
)

describe('Slider', () => {
  it('renders with aria-label', () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('renders with default value', () => {
    render(<Slider aria-label="Volume" defaultValue={[75]} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders with min and max', () => {
    render(
      <Slider aria-label="Volume" defaultValue={[5]} min={0} max={10} />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '10')
  })

  it('renders disabled state', () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} disabled />)
    // Radix Slider uses data-disabled attribute rather than native disabled
    expect(screen.getByRole('slider')).toHaveAttribute('data-disabled')
  })

  it('supports step prop', () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={[50]}
        step={10}
        min={0}
        max={100}
      />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })
})
