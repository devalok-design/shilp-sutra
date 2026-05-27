import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { EmptyState } from './empty-state'

describeConformance(
  'EmptyState',
  (props) => <EmptyState title="Nothing here" {...props} />,
)

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No tasks yet" />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <EmptyState title="No items" description="Create your first item" />,
    )
    expect(screen.getByText('Create your first item')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('renders an action when provided', () => {
    render(
      <EmptyState
        title="No results"
        action={<button>Create new</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Create new' })).toBeInTheDocument()
  })

  it('renders a custom icon element', () => {
    render(
      <EmptyState
        title="Custom icon"
        icon={<svg data-testid="custom-icon" />}
      />,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders a component-type icon (plain function component)', () => {
    function MyIcon() {
      return <span data-testid="component-icon">icon</span>
    }
    render(<EmptyState title="Component Icon" icon={MyIcon} />)
    expect(screen.getByTestId('component-icon')).toBeInTheDocument()
  })

  it('renders a Tabler-style forwardRef icon', () => {
    const TablerIcon = React.forwardRef<SVGSVGElement, { size?: number }>(
      function TablerIcon({ size }, ref) {
        return <svg ref={ref} data-testid="tabler-icon" width={size} height={size} />
      },
    )
    render(<EmptyState title="Tabler" icon={TablerIcon} />)
    expect(screen.getByTestId('tabler-icon')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <EmptyState title="Styled" className="my-empty" />,
    )
    expect(container.firstElementChild).toHaveClass('my-empty')
  })

  describe('iconSize prop — forwardRef icons get px sizing via IconProvider', () => {
    // Tabler-style icon. Reads width/height from the props it's passed.
    const TestIcon = React.forwardRef<SVGSVGElement, { size?: number; width?: number; height?: number }>(
      function TestIcon({ width, height, size }, ref) {
        const w = width ?? size
        const h = height ?? size
        return <svg ref={ref} data-testid="test-icon" width={w} height={h} aria-hidden="true" />
      },
    )

    function getSvgSize() {
      const svg = screen.getByTestId('test-icon')
      return [svg.getAttribute('width'), svg.getAttribute('height')] as const
    }

    it('default (md): icon renders at xl token = 24px', () => {
      render(<EmptyState title="Default" icon={TestIcon} />)
      expect(getSvgSize()).toEqual(['24', '24'])
    })

    it('sm iconSize: md token = 18px', () => {
      render(<EmptyState title="Small" icon={TestIcon} iconSize="sm" />)
      expect(getSvgSize()).toEqual(['18', '18'])
    })

    it('lg iconSize: 2xl token = 32px', () => {
      render(<EmptyState title="Large" icon={TestIcon} iconSize="lg" />)
      expect(getSvgSize()).toEqual(['32', '32'])
    })

    it('compact defaults to sm (md token = 18px)', () => {
      render(<EmptyState title="Compact" icon={TestIcon} compact />)
      expect(getSvgSize()).toEqual(['18', '18'])
    })

    it('explicit iconSize beats compact default', () => {
      render(<EmptyState title="Compact lg" icon={TestIcon} compact iconSize="lg" />)
      expect(getSvgSize()).toEqual(['32', '32'])
    })

    it('ReactNode icon (raw SVG) — not auto-sized, rendered as-is', () => {
      render(
        <EmptyState
          title="ReactNode icon"
          icon={<span data-testid="node-icon">icon</span>}
          iconSize="lg"
        />,
      )
      expect(screen.getByTestId('node-icon')).toBeInTheDocument()
    })
  })
})
