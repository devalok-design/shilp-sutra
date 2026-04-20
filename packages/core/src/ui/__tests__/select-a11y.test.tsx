import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Label } from '../label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select'

describe('Select accessibility', () => {
  it('should have no violations in default closed state', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="fruit-select">Fruit</Label>
        <Select>
          <SelectTrigger id="fruit-select" aria-label="Select a fruit">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
          </SelectContent>
        </Select>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
