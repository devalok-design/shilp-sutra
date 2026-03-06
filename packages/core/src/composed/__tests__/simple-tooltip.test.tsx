import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { SimpleTooltip } from '../simple-tooltip'

describe('SimpleTooltip', () => {
  it('renders trigger children', () => {
    render(
      <SimpleTooltip content="Help text">
        <button>Hover me</button>
      </SimpleTooltip>,
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('should have no a11y violations', async () => {
    const { container } = render(
      <SimpleTooltip content="Help text">
        <button>Hover me</button>
      </SimpleTooltip>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
