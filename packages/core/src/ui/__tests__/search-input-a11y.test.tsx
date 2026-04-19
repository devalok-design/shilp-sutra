import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { SearchInput } from '../search-input'

describe('SearchInput accessibility', () => {
  it('should have no violations with aria-label', async () => {
    const { container } = render(
      <SearchInput aria-label="Search tasks" placeholder="Search..." />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with a value and clear button', async () => {
    const { container } = render(
      <SearchInput
        aria-label="Search tasks"
        value="design"
        onChange={() => {}}
        onClear={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in loading state', async () => {
    const { container } = render(
      <SearchInput
        aria-label="Search tasks"
        value="loading"
        onChange={() => {}}
        loading
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations when disabled', async () => {
    const { container } = render(
      <SearchInput aria-label="Search tasks" disabled />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
