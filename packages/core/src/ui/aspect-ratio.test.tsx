import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { AspectRatio } from './aspect-ratio'

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="Landscape scenery" />
      </AspectRatio>,
    )
    expect(screen.getByAltText('Landscape scenery')).toBeInTheDocument()
  })

  it('renders with default ratio', () => {
    const { container } = render(
      <AspectRatio>
        <div data-testid="child">Content</div>
      </AspectRatio>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    // The wrapper div should exist
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies padding-bottom style for aspect ratio', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    )
    // Radix AspectRatio uses padding-bottom to maintain ratio
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.style.paddingBottom).toBeTruthy()
  })

  it('merges custom className', () => {
    const { container } = render(
      <AspectRatio ratio={1} className="custom-aspect">
        <div>Content</div>
      </AspectRatio>,
    )
    expect(container.querySelector('.custom-aspect')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <AspectRatio ref={ref as React.Ref<HTMLDivElement>} ratio={4 / 3}>
        <div>Content</div>
      </AspectRatio>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('renders with 1:1 ratio', () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <div data-testid="square">Square</div>
      </AspectRatio>,
    )
    expect(screen.getByTestId('square')).toBeInTheDocument()
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.paddingBottom).toBe('100%')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="Landscape scenery" />
      </AspectRatio>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
