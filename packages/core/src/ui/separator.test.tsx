import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Separator } from './separator'

describeConformance('Separator', (props) => <Separator {...props} />, {
  variants: ['default'],
})

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator data-testid="sep" />)
    const el = screen.getByTestId('sep')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('h-px', 'w-full')
  })

  it('renders a vertical separator', () => {
    render(<Separator data-testid="sep" orientation="vertical" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('h-full', 'w-px')
  })

  it('is decorative by default (role="none")', () => {
    render(<Separator data-testid="sep" />)
    // Radix Separator uses role="none" for decorative separators
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'none')
  })

  it('decorative=false renders as role="separator"', () => {
    render(<Separator data-testid="sep" decorative={false} />)
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'separator')
  })
})
