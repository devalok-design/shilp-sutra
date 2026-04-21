import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { AspectRatio } from './aspect-ratio'

describeConformance(
  'AspectRatio',
  (props) => (
    <AspectRatio ratio={16 / 9} {...props}>
      <img src="/test.jpg" alt="Landscape scenery" />
    </AspectRatio>
  ),
)

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="Landscape scenery" />
      </AspectRatio>,
    )
    expect(screen.getByAltText('Landscape scenery')).toBeInTheDocument()
  })

  it('applies padding-bottom style to maintain the ratio', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.paddingBottom).toBeTruthy()
  })

  it('renders a 1:1 ratio as padding-bottom: 100%', () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <div>Content</div>
      </AspectRatio>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.paddingBottom).toBe('100%')
  })
})
