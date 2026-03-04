import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { GlobalLoading } from '../global-loading'

describe('GlobalLoading', () => {
  it('should have no accessibility violations when loading', async () => {
    const { container } = render(<GlobalLoading isLoading={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations when not loading', async () => {
    const { container } = render(<GlobalLoading isLoading={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
