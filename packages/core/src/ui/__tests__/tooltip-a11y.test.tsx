import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../tooltip'

describe('Tooltip accessibility', () => {
  it('should have no violations with trigger and content', async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Helpful tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
