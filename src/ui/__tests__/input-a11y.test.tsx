import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Input } from '../input'
import { Label } from '../label'

describe('Input accessibility', () => {
  it('should have no violations with a visible label', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with aria-label', async () => {
    const { container } = render(
      <Input aria-label="Email address" placeholder="Email" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in error state', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" state="error" placeholder="Invalid email" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="disabled-input">Disabled</Label>
        <Input id="disabled-input" disabled placeholder="Disabled" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
