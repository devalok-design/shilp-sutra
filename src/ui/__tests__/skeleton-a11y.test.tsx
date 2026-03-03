import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '../skeleton'

describe('Skeleton accessibility', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with shape variants', async () => {
    const { container } = render(
      <div>
        <Skeleton variant="rectangle" className="h-4 w-48" />
        <Skeleton variant="circle" className="h-12 w-12" />
        <Skeleton variant="text" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with animation variants', async () => {
    const { container } = render(
      <div>
        <Skeleton animation="pulse" className="h-4 w-48" />
        <Skeleton animation="shimmer" className="h-4 w-48" />
        <Skeleton animation="none" className="h-4 w-48" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('Skeleton rendering', () => {
  it('renders with default variants (rectangle + pulse)', () => {
    const { container } = render(<Skeleton className="h-4 w-48" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('bg-skeleton-base')
    expect(el.className).toContain('rounded-ds-md')
    expect(el.className).toContain('animate-pulse')
  })

  it('renders circle variant', () => {
    const { container } = render(
      <Skeleton variant="circle" className="h-12 w-12" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('aspect-square')
  })

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-ds-sm')
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-full')
  })

  it('renders shimmer animation', () => {
    const { container } = render(
      <Skeleton animation="shimmer" className="h-4 w-48" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('animate-skeleton-shimmer')
    expect(el.className).toContain('motion-reduce:animate-none')
  })

  it('renders none animation without animation classes', () => {
    const { container } = render(
      <Skeleton animation="none" className="h-4 w-48" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).not.toContain('animate-pulse')
    expect(el.className).not.toContain('animate-skeleton-shimmer')
  })

  it('allows className override', () => {
    const { container } = render(
      <Skeleton className="h-4 w-[200px]" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-[200px]')
  })

  it('backward compatible: bare Skeleton with className works identically', () => {
    const { container } = render(
      <Skeleton className="h-4 w-[200px]" />,
    )
    const el = container.firstChild as HTMLElement
    // Must have the same classes as the old Skeleton
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('rounded-ds-md')
    expect(el.className).toContain('bg-skeleton-base')
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-[200px]')
  })

  it('passes additional HTML attributes', () => {
    const { container } = render(
      <Skeleton data-testid="my-skeleton" aria-label="Loading" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('data-testid')).toBe('my-skeleton')
    expect(el.getAttribute('aria-label')).toBe('Loading')
  })
})
