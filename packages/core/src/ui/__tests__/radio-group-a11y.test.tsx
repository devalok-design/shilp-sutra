import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { RadioGroup, RadioGroupItem } from '../radio'
import { Label } from '../label'

describe('RadioGroup accessibility', () => {
  it('should have no violations with labeled options', async () => {
    const { container } = render(
      <RadioGroup aria-label="Select a plan" defaultValue="free">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="free" id="free" />
          <Label htmlFor="free">Free</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="pro" id="pro" />
          <Label htmlFor="pro">Pro</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="enterprise" id="enterprise" />
          <Label htmlFor="enterprise">Enterprise</Label>
        </div>
      </RadioGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
