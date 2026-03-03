import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Combobox, type ComboboxOption } from '../combobox'

const options: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('Combobox accessibility', () => {
  it('should have no violations in default closed state', async () => {
    const { container } = render(
      <Combobox
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select a fruit"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a selected value', async () => {
    const { container } = render(
      <Combobox
        options={options}
        value="apple"
        onChange={() => {}}
        placeholder="Select a fruit"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <Combobox
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select a fruit"
        disabled
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in multi-select mode with pills', async () => {
    const { container } = render(
      <Combobox
        options={options}
        value={['apple', 'banana']}
        onChange={() => {}}
        placeholder="Select fruits"
        multiple
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
