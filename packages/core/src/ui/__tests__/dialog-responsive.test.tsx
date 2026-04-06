import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../dialog'

describe('Dialog responsive', () => {
  it('applies mobile-first fullscreen + desktop override classes by default', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('inset-0')
    expect(dialog.className).toContain('md:max-w-lg')
  })

  it('uses centered modal without fullscreen when responsive={false}', () => {
    render(
      <Dialog open>
        <DialogContent responsive={false}>
          <DialogTitle>Test</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-lg')
    expect(dialog.className).not.toContain('inset-0')
  })

  it('has no accessibility violations in responsive mode', async () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
