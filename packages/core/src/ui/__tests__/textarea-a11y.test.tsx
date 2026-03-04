import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Textarea } from '../textarea'
import { Label } from '../label'

describe('Textarea accessibility', () => {
  it('should have no violations with a visible label', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Type your message" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="disabled-textarea">Notes</Label>
        <Textarea id="disabled-textarea" disabled />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
