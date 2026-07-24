import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { PriorityIndicator } from './priority-indicator'

describeConformance(
  'PriorityIndicator',
  (props) => <PriorityIndicator priority="LOW" {...props} />,
  // PriorityIndicator uses `display` not `variant`. Skip that axis;
  // compact display is tested in behavior tests below.
  { skip: ['variants'] },
)

describe('PriorityIndicator', () => {
  it('renders Low priority with label', () => {
    render(<PriorityIndicator priority="LOW" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders Medium priority with label', () => {
    render(<PriorityIndicator priority="MEDIUM" />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders High priority with label', () => {
    render(<PriorityIndicator priority="HIGH" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders Urgent priority with label', () => {
    render(<PriorityIndicator priority="URGENT" />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('normalizes lowercase priority values', () => {
    render(<PriorityIndicator priority="low" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('iconOnly: no visible text but a real accessible name', () => {
    render(<PriorityIndicator priority="HIGH" iconOnly />)
    // Accessible name via aria-label + role="img" (not a mouse-only title on a div)
    expect(screen.getByRole('img', { name: 'High' })).toBeInTheDocument()
    expect(screen.queryByText('High')).not.toBeInTheDocument()
  })

  it('deprecated display="compact" still maps to icon-only', () => {
    render(<PriorityIndicator priority="HIGH" display="compact" />)
    expect(screen.getByRole('img', { name: 'High' })).toBeInTheDocument()
  })

  it('children override the label (i18n)', () => {
    render(<PriorityIndicator priority="HIGH">Alta</PriorityIndicator>)
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.queryByText('High')).not.toBeInTheDocument()
  })

  it('unknown priority falls back without throwing', () => {
    // @ts-expect-error deliberately invalid priority
    expect(() => render(<PriorityIndicator priority="BOGUS" />)).not.toThrow()
  })

  it('renders an SVG icon', () => {
    const { container } = render(<PriorityIndicator priority="LOW" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
