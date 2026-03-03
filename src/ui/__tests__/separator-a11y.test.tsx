import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Separator } from '../separator'

describe('Separator accessibility', () => {
  it('should have no violations with horizontal orientation', async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Separator orientation="horizontal" />
        <p>Below</p>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with vertical orientation', async () => {
    const { container } = render(
      <div style={{ display: 'flex', height: '20px' }}>
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
