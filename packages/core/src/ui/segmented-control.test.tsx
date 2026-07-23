import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { SegmentedControl, type SegmentedControlOption } from './segmented-control'

const options: SegmentedControlOption[] = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Beta' },
  { id: 'c', text: 'Gamma' },
]

describeConformance(
  'SegmentedControl',
  (props) => (
    <SegmentedControl options={options} value="a" onValueChange={vi.fn()} {...props} />
  ),
)

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeInTheDocument()
  })

  it('calls onSelect when an option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} />)

    await user.click(screen.getByRole('radio', { name: 'Beta' }))
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('marks the selected option with aria-checked (radio semantics)', () => {
    render(<SegmentedControl options={options} value="b" onValueChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('aria-checked', 'false')
  })

  it('disabled prevents click interaction', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} disabled />)

    const tab = screen.getByRole('radio', { name: 'Beta' })
    expect(tab).toBeDisabled()

    await user.click(tab)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ArrowRight moves selection to next option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} />)

    // Focus the selected tab then press ArrowRight
    screen.getByRole('radio', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('ArrowLeft wraps from first to last', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} />)

    screen.getByRole('radio', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenCalledWith('c')
  })

  it('ArrowRight wraps from last to first', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="c" onValueChange={onSelect} />)

    screen.getByRole('radio', { name: 'Gamma' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('Home moves selection to first option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="c" onValueChange={onSelect} />)

    screen.getByRole('radio', { name: 'Gamma' }).focus()
    await user.keyboard('{Home}')
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('End moves selection to last option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} />)

    screen.getByRole('radio', { name: 'Alpha' }).focus()
    await user.keyboard('{End}')
    expect(onSelect).toHaveBeenCalledWith('c')
  })

  it('has role="radiogroup" on the container', () => {
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('selected radio has tabIndex=0, others have tabIndex=-1', () => {
    render(<SegmentedControl options={options} value="b" onValueChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('tabindex', '-1')
  })

  it('variant="solid" applies accent selected text style', () => {
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} variant="solid" />)
    const tab = screen.getByRole('radio', { name: 'Alpha' })
    expect(tab.className).toContain('text-accent-fg')
  })

  it('variant="soft" applies the surface-fg selected text style', () => {
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} variant="soft" />)
    const tab = screen.getByRole('radio', { name: 'Alpha' })
    expect(tab.className).toContain('text-surface-fg')
  })

  it('back-compat: variant="default" maps to soft', () => {
    // @ts-expect-error 'default' is the deprecated alias, not in the public union
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} variant="default" />)
    const tab = screen.getByRole('radio', { name: 'Alpha' })
    expect(tab.className).toContain('text-surface-fg')
  })

  it('back-compat: selectedId + onSelect (deprecated) still work', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    // @ts-expect-error selectedId/onSelect are the deprecated alias props
    render(<SegmentedControl options={options} selectedId="a" onSelect={onSelect} />)
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: 'Beta' }))
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('uncontrolled: defaultValue seeds selection and clicking updates it', async () => {
    const user = userEvent.setup()
    render(<SegmentedControl options={options} defaultValue="b" />)
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: 'Gamma' }))
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'false')
  })

  it('uncontrolled with no defaultValue selects the first option', () => {
    render(<SegmentedControl options={options} />)
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true')
  })

  it('fullWidth makes segments flex-fill the container', () => {
    render(<SegmentedControl options={options} value="a" onValueChange={() => {}} fullWidth />)
    expect(screen.getByRole('radiogroup').className).toContain('w-full')
    expect(screen.getByRole('radio', { name: 'Alpha' }).className).toContain('flex-1')
  })

  it('renders option icon when provided', () => {
    const IconMock = ({ className }: { className?: string }) => (
      <svg data-testid="test-icon" className={className}><rect /></svg>
    )
    const optionsWithIcon: SegmentedControlOption[] = [
      { id: 'x', text: 'With Icon', icon: IconMock },
    ]
    render(<SegmentedControl options={optionsWithIcon} value="x" onValueChange={() => {}} />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('disabled prevents keyboard navigation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SegmentedControl options={options} value="a" onValueChange={onSelect} disabled />)

    const group = screen.getByRole('radiogroup')
    group.focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('RTL: ArrowRight moves to the previous option (reading-order aware)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <div dir="rtl">
        <SegmentedControl options={options} value="b" onValueChange={onSelect} />
      </div>,
    )
    screen.getByRole('radio', { name: 'Beta' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('a')
  })

  it('RTL: ArrowLeft moves to the next option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <div dir="rtl">
        <SegmentedControl options={options} value="b" onValueChange={onSelect} />
      </div>,
    )
    screen.getByRole('radio', { name: 'Beta' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenCalledWith('c')
  })

  it('icon-only segment uses ariaLabel as its accessible name', () => {
    const IconMock = ({ className }: { className?: string }) => (
      <svg data-testid="ico" className={className}><rect /></svg>
    )
    const iconOnly: SegmentedControlOption[] = [
      { id: 'grid', icon: IconMock, ariaLabel: 'Grid view' },
      { id: 'list', icon: IconMock, ariaLabel: 'List view' },
    ]
    render(<SegmentedControl options={iconOnly} defaultValue="grid" />)
    expect(screen.getByRole('radio', { name: 'Grid view' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'List view' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SegmentedControl options={options} value="a" onValueChange={() => {}} aria-label="View mode" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
