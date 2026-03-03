import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { NumberInput } from '../number-input'

describe('NumberInput accessibility', () => {
  it('should have no violations with an implicit label wrapper', async () => {
    const { container } = render(
      <label>
        Quantity
        <NumberInput value={5} onChange={() => {}} />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <label>
        Quantity
        <NumberInput value={0} onChange={() => {}} disabled />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with min and max bounds', async () => {
    const { container } = render(
      <label>
        Rating
        <NumberInput value={3} onChange={() => {}} min={0} max={10} />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
