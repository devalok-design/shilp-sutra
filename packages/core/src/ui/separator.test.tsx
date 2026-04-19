import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Separator } from './separator'

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator data-testid="sep" />)
    const el = screen.getByTestId('sep')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('h-[1px]', 'w-full')
  })

  it('renders a vertical separator', () => {
    render(<Separator data-testid="sep" orientation="vertical" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('h-full', 'w-[1px]')
  })

  it('default variant applies bg-surface-border', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveClass('bg-surface-border')
  })

  it('gradient variant applies gradient background', () => {
    render(<Separator data-testid="sep" variant="gradient" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('bg-transparent')
    expect(el.className).toContain('linear-gradient')
  })

  it('gradient-left variant applies left-fading gradient', () => {
    render(<Separator data-testid="sep" variant="gradient-left" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('bg-transparent')
    expect(el.className).toContain('linear-gradient')
  })

  it('gradient-right variant applies right-fading gradient', () => {
    render(<Separator data-testid="sep" variant="gradient-right" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('bg-transparent')
    expect(el.className).toContain('linear-gradient')
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

  it('merges custom className', () => {
    render(<Separator data-testid="sep" className="my-sep" />)
    const el = screen.getByTestId('sep')
    expect(el).toHaveClass('my-sep')
    expect(el).toHaveClass('shrink-0')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Separator ref={ref as React.Ref<HTMLElement>} />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Separator />
        <p>Below</p>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
