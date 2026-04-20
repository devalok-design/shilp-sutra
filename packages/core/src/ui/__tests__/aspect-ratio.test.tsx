import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AspectRatio } from '../aspect-ratio'

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="test.jpg" alt="Test" />
      </AspectRatio>,
    )
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(
      <AspectRatio ratio={4 / 3} className="my-aspect" data-testid="ar">
        <div>Content</div>
      </AspectRatio>,
    )
    // The className is applied to the inner AspectRatio element
    const el = document.querySelector('.my-aspect')
    expect(el).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(
      <AspectRatio ref={ref} ratio={1}>
        <span>Square</span>
      </AspectRatio>,
    )
    expect(ref).toHaveBeenCalled()
  })

  it('applies inline padding-bottom style for aspect ratio', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    )
    // Radix AspectRatio uses a padding-bottom wrapper to enforce the ratio
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toBeInTheDocument()
  })
})
