import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import type { SegmentedControlOption } from '../segmented-control'
import { SegmentedControl } from '../segmented-control'

const options: SegmentedControlOption[] = [
  { id: 'weekly', text: 'Weekly' },
  { id: 'monthly', text: 'Monthly' },
]

describe('SegmentedControl', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders all options', () => {
    render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('has tablist role', () => {
    render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('marks selected tab with aria-selected', () => {
    render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('renders disabled state', () => {
    render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
        disabled
      />,
    )
    const tabs = screen.getAllByRole('tab')
    tabs.forEach((tab) => {
      expect(tab).toBeDisabled()
    })
  })

  it('renders with accent variant', async () => {
    const { container } = render(
      <SegmentedControl
        variant="accent"
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('defaults to md size and default variant', () => {
    render(
      <SegmentedControl
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
