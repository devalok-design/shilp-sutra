import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonGroup,
  SkeletonText,
} from './skeleton'

describeConformance('Skeleton', (props) => <Skeleton {...props} />, {
  variants: ['rectangle', 'circle', 'text'],
})

describe('Skeleton', () => {
  it('renders with default rectangle variant', () => {
    const { container } = render(<Skeleton data-testid="sk" />)
    const el = screen.getByTestId('sk')
    expect(el.className).toContain('rounded-ds-md')
  })

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" data-testid="sk" />)
    expect(screen.getByTestId('sk').className).toContain('rounded-ds-full')
    expect(screen.getByTestId('sk').className).toContain('aspect-square')
  })

  it('renders text variant', () => {
    render(<Skeleton variant="text" data-testid="sk" />)
    const el = screen.getByTestId('sk')
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-full')
  })

  it('applies pulse animation by default', () => {
    render(<Skeleton data-testid="sk" />)
    expect(screen.getByTestId('sk').className).toContain('animate-pulse')
  })

  it('applies shimmer animation', () => {
    render(<Skeleton animation="shimmer" data-testid="sk" />)
    expect(screen.getByTestId('sk').className).toContain('animate-skeleton-shimmer')
  })

  it('applies no animation when animation="none"', () => {
    render(<Skeleton animation="none" data-testid="sk" />)
    const cls = screen.getByTestId('sk').className
    expect(cls).not.toContain('animate-pulse')
    expect(cls).not.toContain('animate-skeleton-shimmer')
  })

  it('is aria-hidden for screen readers', () => {
    render(<Skeleton data-testid="sk" />)
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true')
  })

})

describe('SkeletonText', () => {
  it('renders 3 lines by default', () => {
    const { container } = render(<SkeletonText data-testid="st" />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    expect(lines).toHaveLength(3)
  })

  it('renders specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    expect(lines).toHaveLength(5)
  })

  it('ensures at least 1 line even with lines=0', () => {
    const { container } = render(<SkeletonText lines={0} />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    expect(lines).toHaveLength(1)
  })

  it('last line has three-quarter width by default', () => {
    const { container } = render(<SkeletonText lines={2} />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    const lastLine = lines[lines.length - 1]
    expect(lastLine.className).toContain('w-3/4')
  })

  it('last line respects lastLineWidth=half', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth="half" />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    const lastLine = lines[lines.length - 1]
    expect(lastLine.className).toContain('w-1/2')
  })

  it('last line respects lastLineWidth=full', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth="full" />)
    const lines = container.querySelectorAll('.bg-skeleton-base')
    const lastLine = lines[lines.length - 1]
    expect(lastLine.className).toContain('w-full')
  })
})

describe('SkeletonAvatar', () => {
  it('renders with default md size', () => {
    const { container } = render(<SkeletonAvatar data-testid="sa" />)
    expect(screen.getByTestId('sa').className).toContain('h-10')
    expect(screen.getByTestId('sa').className).toContain('w-10')
  })

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders size=%s', (size) => {
    render(<SkeletonAvatar size={size} data-testid="sa" />)
    expect(screen.getByTestId('sa')).toBeInTheDocument()
  })

  it('is circular by default', () => {
    render(<SkeletonAvatar data-testid="sa" />)
    expect(screen.getByTestId('sa').className).toContain('rounded-ds-full')
  })
})

describe('SkeletonGroup', () => {
  it('has role="status"', () => {
    render(<SkeletonGroup>content</SkeletonGroup>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label defaulting to "Loading"', () => {
    render(<SkeletonGroup>content</SkeletonGroup>)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('has aria-busy="true"', () => {
    render(<SkeletonGroup>content</SkeletonGroup>)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  it('accepts custom label', () => {
    render(<SkeletonGroup label="Fetching data">content</SkeletonGroup>)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching data')
  })

  it('renders screen-reader text', () => {
    render(<SkeletonGroup label="Fetching data">content</SkeletonGroup>)
    expect(screen.getByText('Fetching data...')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <SkeletonGroup>
        <Skeleton data-testid="child" />
      </SkeletonGroup>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <SkeletonGroup>
        <Skeleton />
        <SkeletonText />
      </SkeletonGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
