import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Switch } from '../switch'
import { Label } from '../label'

describe('Switch accessibility', () => {
  it('should have no violations when off with aria-label', async () => {
    const { container } = render(
      <Switch aria-label="Enable notifications" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when on', async () => {
    const { container } = render(
      <Switch checked aria-label="Enable notifications" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Switch disabled aria-label="Disabled switch" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a paired label', async () => {
    const { container } = render(
      <div className="flex items-center gap-2">
        <Switch id="dark-mode" />
        <Label htmlFor="dark-mode">Dark mode</Label>
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
