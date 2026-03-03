import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { EmptyState } from '../empty-state'

describe('EmptyState', () => {
  it('should have no accessibility violations with title only', async () => {
    const { container } = render(<EmptyState title="No items found" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with description', async () => {
    const { container } = render(
      <EmptyState
        title="No results"
        description="Try adjusting your search filters to find what you are looking for."
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with action', async () => {
    const { container } = render(
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
        action={<button type="button">Create Project</button>}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations in compact mode', async () => {
    const { container } = render(
      <EmptyState title="Empty list" compact />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
