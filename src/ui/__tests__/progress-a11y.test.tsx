import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Progress } from '../progress'

describe('Progress accessibility', () => {
  it('should have no violations with a value and accessible name', async () => {
    const { container } = render(
      <Progress value={60} aria-label="Upload progress" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations at 0%', async () => {
    const { container } = render(
      <Progress value={0} aria-label="Loading" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations at 100%', async () => {
    const { container } = render(
      <Progress value={100} aria-label="Download complete" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should FAIL without an accessible name (documents known a11y gap)', async () => {
    const { container } = render(<Progress value={50} />)
    const results = await axe(container)
    // This documents the fact that Progress requires an aria-label.
    // Without one, axe reports aria-progressbar-name violation.
    expect(results.violations.length).toBeGreaterThan(0)
    expect(results.violations[0].id).toBe('aria-progressbar-name')
  })
})
