import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Checkbox } from '../checkbox'
import { Label } from '../label'

describe('Checkbox accessibility', () => {
  it('should have no violations when unchecked with aria-label', async () => {
    const { container } = render(
      <Checkbox aria-label="Accept terms and conditions" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when checked', async () => {
    const { container } = render(
      <Checkbox checked aria-label="Accept terms and conditions" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Checkbox disabled aria-label="Disabled checkbox" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a paired label', async () => {
    const { container } = render(
      <div className="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">I accept the terms</Label>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
