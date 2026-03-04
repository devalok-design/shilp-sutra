import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from './select'

// Radix Select internals use DOM APIs that jsdom does not provide
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

function renderSelect({
  placeholder = 'Pick a fruit',
  onValueChange = vi.fn(),
  defaultValue,
  disabled = false,
  open,
}: {
  placeholder?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  open?: boolean
} = {}) {
  return render(
    <Select
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
      open={open}
    >
      <SelectTrigger aria-label="Fruit selector">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled>
            Cherry
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  )
}

describe('Select', () => {
  it('renders trigger with placeholder text', () => {
    renderSelect()
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit')
  })

  it('renders options when forced open', () => {
    renderSelect({ open: true })

    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeInTheDocument()
  })

  it('renders group label in open state', () => {
    renderSelect({ open: true })
    expect(screen.getByText('Fruits')).toBeInTheDocument()
  })

  it('calls onValueChange when an option is clicked', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    renderSelect({ onValueChange, open: true })

    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(onValueChange).toHaveBeenCalledWith('banana')
  })

  it('renders with a default value shown in trigger', () => {
    renderSelect({ defaultValue: 'banana' })
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana')
  })

  it('renders disabled trigger', () => {
    renderSelect({ disabled: true })
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('forwards ref to trigger element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Select>
        <SelectTrigger ref={ref as React.Ref<HTMLButtonElement>}>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className on trigger', () => {
    render(
      <Select>
        <SelectTrigger className="my-custom">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveClass('my-custom')
  })

  it('renders disabled option with data-disabled attribute', () => {
    renderSelect({ open: true })
    const cherryOption = screen.getByRole('option', { name: 'Cherry' })
    expect(cherryOption).toHaveAttribute('data-disabled')
  })

  it('shows trigger in closed state by default', () => {
    renderSelect()
    expect(screen.getByRole('combobox')).toHaveAttribute('data-state', 'closed')
  })

  it('has no a11y violations', async () => {
    const { container } = renderSelect()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
