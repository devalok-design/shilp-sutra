import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { PriorityIndicator } from '../priority-indicator'
import type { Priority } from '../priority-indicator'

const allPriorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

describe('PriorityIndicator', () => {
  it.each(allPriorities)(
    'should have no accessibility violations for priority="%s"',
    async (priority) => {
      const { container } = render(<PriorityIndicator priority={priority} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )

  it.each(allPriorities)(
    'should have no accessibility violations in compact mode for priority="%s"',
    async (priority) => {
      const { container } = render(
        <PriorityIndicator priority={priority} display="compact" />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )
})
