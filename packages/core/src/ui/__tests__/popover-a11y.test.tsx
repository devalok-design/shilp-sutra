import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'

describe('Popover accessibility', () => {
  it('should have no violations in closed state', async () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content goes here.</p>
        </PopoverContent>
      </Popover>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in open state', async () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger asChild>
          <button type="button">Open popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content goes here.</p>
        </PopoverContent>
      </Popover>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
