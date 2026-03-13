import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Slider } from '../slider'

describe('Slider accessibility', () => {
  it('should have no violations with aria-label', async () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[50]} max={100} step={1} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with min and max range', async () => {
    const { container } = render(
      <Slider
        aria-label="Price range"
        defaultValue={[25]}
        min={0}
        max={100}
        step={5}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Slider aria-label="Brightness" defaultValue={[75]} disabled />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
