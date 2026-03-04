import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Spinner } from '../spinner'

describe('Spinner accessibility', () => {
  it('should have no violations with default size', async () => {
    const { container } = render(<Spinner />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with small size', async () => {
    const { container } = render(<Spinner size="sm" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with large size', async () => {
    const { container } = render(<Spinner size="lg" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have role="status" for assistive technology', async () => {
    const { container } = render(<Spinner />)
    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl).toBeTruthy()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
