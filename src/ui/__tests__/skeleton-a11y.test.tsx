import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '../skeleton'

describe('Skeleton accessibility', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
