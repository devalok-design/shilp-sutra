import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { DividerBlock } from '../../blocks/divider'

describe('DividerBlock', () => {
  it('renders a separator element', () => {
    const { container } = render(
      <DividerBlock data={{} as Record<string, never>} />,
    )
    const separator = container.querySelector('[data-orientation="horizontal"]')
    expect(separator).toBeInTheDocument()
  })

  it('renders without crashing when no props beyond data', () => {
    const { container } = render(
      <DividerBlock data={{} as Record<string, never>} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
