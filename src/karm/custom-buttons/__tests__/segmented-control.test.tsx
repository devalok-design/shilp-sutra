import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { SegmentedControl } from '../segmented-control'
import type { SegmentedControlOption } from '../segmented-control'

const options: SegmentedControlOption[] = [
  { id: 'weekly', text: 'Weekly' },
  { id: 'monthly', text: 'Monthly' },
]

describe('SegmentedControl', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <SegmentedControl
        size="medium"
        color="tonal"
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
        size="medium"
        color="tonal"
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
        size="medium"
        color="tonal"
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
        size="medium"
        color="tonal"
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
        size="medium"
        color="tonal"
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

  it('renders with filled color variant', async () => {
    const { container } = render(
      <SegmentedControl
        size="medium"
        color="filled"
        options={options}
        selectedId="weekly"
        onSelect={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
