import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Chip } from '../chip'

describe('Chip accessibility', () => {
  it('should have no violations with subtle variant', async () => {
    const { container } = render(<Chip label="Subtle chip" variant="subtle" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with outline variant', async () => {
    const { container } = render(<Chip label="Outline chip" variant="outline" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when clickable', async () => {
    const { container } = render(<Chip label="Clickable chip" onClick={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when dismissible', async () => {
    const { container } = render(<Chip label="Removable chip" onDelete={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // Known issue: when both onClick and onDelete are set, the Chip renders a
  // <button> as the root with a nested delete <button>, which violates
  // nested-interactive. This test documents the violation.
  it('should flag nested-interactive violation when clickable and dismissible', async () => {
    const { container } = render(
      <Chip label="Interactive chip" onClick={() => {}} onDelete={() => {}} />,
    )
    const results = await axe(container)
    const nestedRule = results.violations.find(
      (v: { id: string }) => v.id === 'nested-interactive',
    )
    expect(nestedRule).toBeDefined()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(<Chip label="Disabled chip" onClick={() => {}} disabled />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with icon', async () => {
    const { container } = render(
      <Chip
        label="With icon"
        icon={<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
