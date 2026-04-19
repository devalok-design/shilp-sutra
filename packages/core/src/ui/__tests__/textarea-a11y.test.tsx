import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Label } from '../label'
import { Textarea } from '../textarea'

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
