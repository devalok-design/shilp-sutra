import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Surface } from './surface'

describeConformance('Surface', (props) => <Surface {...props} />)

describe('Surface', () => {
  afterEach(() => vi.restoreAllMocks())

  it('defaults to raised elevation (bg + shadow) with surface radius', () => {
    const { container } = render(<Surface>hi</Surface>)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('bg-surface-raised', 'shadow-raised', 'rounded-surface')
  })

  it('flat elevation keeps the bg but drops the shadow', () => {
    const { container } = render(<Surface elevation="flat">hi</Surface>)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('bg-surface-raised')
    expect(el).not.toHaveClass('shadow-raised')
  })

  it('overlay elevation uses the overlay bg + shadow', () => {
    const { container } = render(<Surface elevation="overlay">hi</Surface>)
    expect(container.firstChild).toHaveClass('bg-surface-overlay', 'shadow-overlay')
  })

  it('applies the padding scale', () => {
    const { container } = render(<Surface padding="md">hi</Surface>)
    expect(container.firstChild).toHaveClass('p-ds-05')
  })

  it('applies a radius override', () => {
    const { container } = render(<Surface radius="pill">hi</Surface>)
    expect(container.firstChild).toHaveClass('rounded-pill')
  })

  it('bordered adds a border (paired with flat)', () => {
    const { container } = render(
      <Surface elevation="flat" bordered>
        hi
      </Surface>,
    )
    expect(container.firstChild).toHaveClass('border', 'border-surface-border-strong')
  })

  it('renders as the child element when asChild, carrying the surface classes', () => {
    render(
      <Surface asChild elevation="raised">
        <a href="/x">link</a>
      </Surface>,
    )
    const link = screen.getByRole('link', { name: 'link' })
    expect(link).toHaveClass('bg-surface-raised', 'shadow-raised')
  })

  it('dev-warns when bordered is combined with a shadowed elevation (double-edge)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Surface elevation="raised" bordered>
        hi
      </Surface>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('double-edge'))
  })

  it('does not warn for a bordered flat surface', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Surface elevation="flat" bordered>
        hi
      </Surface>,
    )
    expect(warn).not.toHaveBeenCalled()
  })
})
