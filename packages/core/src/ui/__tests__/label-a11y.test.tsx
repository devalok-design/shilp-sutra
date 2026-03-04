import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Label } from '../label'

describe('Label accessibility', () => {
  it('should have no violations', async () => {
    const { container } = render(<Label htmlFor="field">Field label</Label>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with required indicator', async () => {
    const { container } = render(
      <Label htmlFor="required-field" required>
        Required field
      </Label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
