import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { GlobalLoading } from '../global-loading'

describe('GlobalLoading', () => {
  it('should have no accessibility violations when loading', async () => {
    const { container } = render(<GlobalLoading isLoading={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations when not loading', async () => {
    const { container } = render(<GlobalLoading isLoading={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders the progressbar as active (not aria-hidden) with a "Loading" valuetext when isLoading is true', () => {
    const { getByRole } = render(<GlobalLoading isLoading={true} />)
    const bar = getByRole('progressbar', { hidden: true })

    expect(bar).toHaveAttribute('aria-hidden', 'false')
    expect(bar).toHaveAttribute('aria-valuetext', 'Loading')
    expect(bar).toHaveAttribute('aria-label', 'Page loading')

    // The inner fill indicator is expanded and fully opaque while loading.
    const fill = bar.firstElementChild as HTMLElement
    expect(fill).toHaveClass('w-4/5')
    expect(fill).toHaveClass('opacity-100')
  })

  it('renders the progressbar as aria-hidden with no valuetext, and the fill collapsed, when isLoading is false', () => {
    const { getByRole } = render(<GlobalLoading isLoading={false} />)
    const bar = getByRole('progressbar', { hidden: true })

    expect(bar).toHaveAttribute('aria-hidden', 'true')
    expect(bar).not.toHaveAttribute('aria-valuetext')

    // Mounting directly with isLoading=false means the bar never animated in,
    // so the fill starts fully collapsed and transparent.
    const fill = bar.firstElementChild as HTMLElement
    expect(fill).toHaveClass('w-0')
    expect(fill).toHaveClass('opacity-0')
  })

  it('transitions from loading to not-loading: aria-hidden flips true and the fill leaves its expanded state', () => {
    const { getByRole, rerender } = render(<GlobalLoading isLoading={true} />)
    const bar = getByRole('progressbar', { hidden: true })
    const fill = bar.firstElementChild as HTMLElement

    expect(bar).toHaveAttribute('aria-hidden', 'false')
    expect(fill).toHaveClass('w-4/5')
    expect(fill).toHaveClass('opacity-100')

    rerender(<GlobalLoading isLoading={false} />)

    expect(bar).toHaveAttribute('aria-hidden', 'true')
    expect(bar).not.toHaveAttribute('aria-valuetext')
    // Having been loading, the bar plays a "complete" animation (full width,
    // still opaque, with a glow) rather than snapping straight to collapsed.
    expect(fill).toHaveClass('w-full')
    expect(fill).toHaveClass('opacity-100')
    expect(fill).not.toHaveClass('w-4/5')
    expect(fill.style.boxShadow).toBe('0 0 8px var(--color-accent-9)')
  })

  it('transitions from not-loading to loading: aria-hidden flips false and the fill expands again', () => {
    const { getByRole, rerender } = render(<GlobalLoading isLoading={false} />)
    const bar = getByRole('progressbar', { hidden: true })
    const fill = bar.firstElementChild as HTMLElement

    expect(bar).toHaveAttribute('aria-hidden', 'true')

    rerender(<GlobalLoading isLoading={true} />)

    expect(bar).toHaveAttribute('aria-hidden', 'false')
    expect(bar).toHaveAttribute('aria-valuetext', 'Loading')
    expect(fill).toHaveClass('w-4/5')
    expect(fill).toHaveClass('opacity-100')
    expect(fill).not.toHaveClass('w-0')
  })

  it('forwards the ref to the underlying progressbar div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<GlobalLoading isLoading={true} ref={ref} />)

    expect(ref.current).not.toBeNull()
    expect(ref.current).toHaveAttribute('role', 'progressbar')
  })

  it('spreads arbitrary div props (from GlobalLoadingProps extending ComponentPropsWithoutRef<"div">) onto the root', () => {
    const { getByTestId } = render(
      <GlobalLoading isLoading={true} data-testid="global-loading-bar" id="page-loader" />,
    )
    const bar = getByTestId('global-loading-bar')

    expect(bar).toHaveAttribute('id', 'page-loader')
    expect(bar).toHaveAttribute('role', 'progressbar')
  })
})
