import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Popover, PopoverContent,PopoverTrigger } from '../popover'

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
