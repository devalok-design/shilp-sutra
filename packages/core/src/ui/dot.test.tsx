import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Dot } from './dot'

describeConformance('Dot', (props) => <Dot color="success" aria-label="Online" {...props} />)

describe('Dot', () => {
  it('is decorative (aria-hidden) with no label or aria-label', () => {
    const { container } = render(<Dot color="success" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('becomes an announced status when given a label', () => {
    render(<Dot color="error" label="Outage" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Outage')).toBeInTheDocument()
  })

  it('announces via aria-label without a visible label', () => {
    render(<Dot color="warning" aria-label="Degraded" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Degraded')
  })

  it('renders a pulse ripple when pulse is set', () => {
    const { container } = render(<Dot color="success" pulse label="Live" />)
    expect(container.querySelector('[data-pulse]')).toBeInTheDocument()
  })

  it('does not render a pulse ripple by default', () => {
    const { container } = render(<Dot color="success" label="Idle" />)
    expect(container.querySelector('[data-pulse]')).not.toBeInTheDocument()
  })
})
