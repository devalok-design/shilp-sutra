import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('ToggleGroup', () => {
  it('renders items', () => {
    render(
      <ToggleGroup type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">C</ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">R</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('selects single item on click', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup type="single" onValueChange={onValueChange} aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">C</ToggleGroupItem>
      </ToggleGroup>,
    )
    await user.click(screen.getByText('L'))
    expect(onValueChange).toHaveBeenCalledWith('left')
  })

  it('supports multiple selection', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup type="multiple" onValueChange={onValueChange} aria-label="Formatting">
        <ToggleGroupItem value="bold" aria-label="Bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">I</ToggleGroupItem>
      </ToggleGroup>,
    )
    await user.click(screen.getByText('B'))
    expect(onValueChange).toHaveBeenCalledWith(['bold'])
    await user.click(screen.getByText('I'))
    expect(onValueChange).toHaveBeenCalledWith(['bold', 'italic'])
  })

  it('renders with controlled value', () => {
    render(
      <ToggleGroup type="single" value="center" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">C</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByText('C').closest('button')).toHaveAttribute('data-state', 'on')
    expect(screen.getByText('L').closest('button')).toHaveAttribute('data-state', 'off')
  })

  it('deselects item on second click (single mode)', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup type="single" onValueChange={onValueChange} aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">L</ToggleGroupItem>
      </ToggleGroup>,
    )
    await user.click(screen.getByText('L'))
    expect(onValueChange).toHaveBeenCalledWith('left')
    await user.click(screen.getByText('L'))
    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('renders disabled items', () => {
    render(
      <ToggleGroup type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left" disabled>L</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByText('L').closest('button')).toBeDisabled()
  })

  it('merges className on root', () => {
    render(
      <ToggleGroup type="single" className="my-group" aria-label="Alignment">
        <ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('my-group')
  })

  it('forwards ref on root', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <ToggleGroup type="single" ref={ref as React.Ref<HTMLDivElement>} aria-label="Alignment">
        <ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">L</ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">C</ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">R</ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
