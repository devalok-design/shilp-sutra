import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Toggle } from '../toggle'

describe('Toggle accessibility', () => {
  it('should have no violations when unpressed', async () => {
    const { container } = render(
      <Toggle aria-label="Toggle bold">B</Toggle>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when pressed', async () => {
    const { container } = render(
      <Toggle aria-label="Toggle bold" defaultPressed>B</Toggle>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with outline variant', async () => {
    const { container } = render(
      <Toggle variant="outline" aria-label="Toggle italic">I</Toggle>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Toggle aria-label="Toggle underline" disabled>U</Toggle>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
