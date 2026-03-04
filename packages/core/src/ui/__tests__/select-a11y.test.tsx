import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../select'
import { Label } from '../label'

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
