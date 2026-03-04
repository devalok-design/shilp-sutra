import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

describe('ToggleGroup accessibility', () => {
  it('should have no violations with single selection', async () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">C</ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">R</ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with multiple selection', async () => {
    const { container } = render(
      <ToggleGroup type="multiple" aria-label="Text formatting">
        <ToggleGroupItem value="bold" aria-label="Bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">U</ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a default value selected', async () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">C</ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">R</ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
