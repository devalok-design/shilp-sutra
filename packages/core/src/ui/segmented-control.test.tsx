import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { SegmentedControl, type SegmentedControlOption } from './segmented-control'

const options: SegmentedControlOption[] = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Beta' },
  { id: 'c', text: 'Gamma' },
]

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} selectedId="a" onSelect={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Gamma' })).toBeInTheDocument()
  })

  it('calls onSelect when an option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} />)

    await user.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('marks the selected option with aria-selected', () => {
    render(<SegmentedControl options={options} selectedId="b" onSelect={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'false')
  })

  it('disabled prevents click interaction', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} disabled />)

    const tab = screen.getByRole('tab', { name: 'Beta' })
    expect(tab).toBeDisabled()

    await user.click(tab)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ArrowRight moves selection to next option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} />)

    // Focus the selected tab then press ArrowRight
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('ArrowLeft wraps from first to last', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} />)

    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenCalledWith('c')
  })

  it('ArrowRight wraps from last to first', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="c" onSelect={onSelect} />)

    screen.getByRole('tab', { name: 'Gamma' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('Home moves selection to first option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="c" onSelect={onSelect} />)

    screen.getByRole('tab', { name: 'Gamma' }).focus()
    await user.keyboard('{Home}')
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('End moves selection to last option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} />)

    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{End}')
    expect(onSelect).toHaveBeenCalledWith('c')
  })

  it('has role="tablist" on the container', () => {
    render(<SegmentedControl options={options} selectedId="a" onSelect={() => {}} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('selected tab has tabIndex=0, others have tabIndex=-1', () => {
    render(<SegmentedControl options={options} selectedId="b" onSelect={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('tabindex', '-1')
  })

  it('variant="solid" applies accent selected text style', () => {
    render(<SegmentedControl options={options} selectedId="a" onSelect={() => {}} variant="solid" />)
    const tab = screen.getByRole('tab', { name: 'Alpha' })
    expect(tab.className).toContain('text-accent-fg')
  })

  it('accepts deprecated "accent" alias as equivalent to "solid"', () => {
    render(<SegmentedControl options={options} selectedId="a" onSelect={() => {}} variant="accent" />)
    const tab = screen.getByRole('tab', { name: 'Alpha' })
    expect(tab.className).toContain('text-accent-fg')
  })

  it('variant="default" applies default selected text style', () => {
    render(<SegmentedControl options={options} selectedId="a" onSelect={() => {}} variant="default" />)
    const tab = screen.getByRole('tab', { name: 'Alpha' })
    expect(tab.className).toContain('text-surface-fg')
  })

  it('renders option icon when provided', () => {
    const IconMock = ({ className }: { className?: string }) => (
      <svg data-testid="test-icon" className={className}><rect /></svg>
    )
    const optionsWithIcon: SegmentedControlOption[] = [
      { id: 'x', text: 'With Icon', icon: IconMock },
    ]
    render(<SegmentedControl options={optionsWithIcon} selectedId="x" onSelect={() => {}} />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('disabled prevents keyboard navigation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} disabled />)

    const tablist = screen.getByRole('tablist')
    tablist.focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SegmentedControl options={options} selectedId="a" onSelect={() => {}} aria-label="View mode" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
