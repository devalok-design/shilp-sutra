import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Button } from '../button'

describe('Button accessibility', () => {
  it('should have no violations with solid variant', async () => {
    const { container } = render(<Button variant="solid">Solid</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with outline variant', async () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with error color', async () => {
    const { container } = render(<Button variant="solid" color="error">Delete</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with ghost variant', async () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when loading', async () => {
    const { container } = render(<Button loading>Submitting</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with icon-only button and aria-label', async () => {
    const { container } = render(
      <Button size="icon-md" aria-label="Settings">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
      </Button>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with startIcon', async () => {
    const { container } = render(
      <Button startIcon={<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>}>
        Save
      </Button>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
