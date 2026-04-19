import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select'

// jsdom mocks for Radix Select (ResizeObserver, hasPointerCapture, scrollIntoView, etc.)
// are now centralized in test-setup.ts

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

  describe('variant', () => {
    it('applies default variant classes when no variant is specified', () => {
      renderSelect()
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/bg-surface-raised-hover/)
      expect(trigger.className).toMatch(/border-surface-border-strong/)
    })

    it('applies outline variant classes', () => {
      render(
        <Select>
          <SelectTrigger variant="outline">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/bg-transparent/)
      expect(trigger.className).toMatch(/border-surface-border-strong/)
    })

    it('applies ghost variant classes', () => {
      render(
        <Select>
          <SelectTrigger variant="ghost">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/bg-transparent/)
      expect(trigger.className).toMatch(/border-transparent/)
    })
  })

  describe('color', () => {
    it('applies error color classes and sets aria-invalid', () => {
      render(
        <Select>
          <SelectTrigger color="error">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/border-error-7/)
      expect(trigger.className).toMatch(/text-error-11/)
      expect(trigger).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies success color classes', () => {
      render(
        <Select>
          <SelectTrigger color="success">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/border-success-7/)
    })

    it('applies warning color classes', () => {
      render(
        <Select>
          <SelectTrigger color="warning">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger.className).toMatch(/border-warning-7/)
    })

    it('does not set aria-invalid for non-error colors', () => {
      render(
        <Select>
          <SelectTrigger color="success">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      )
      expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
    })

    it('does not set aria-invalid when color is default', () => {
      renderSelect()
      expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('keyboard interaction', () => {
    it('opens on Enter key', async () => {
      const user = userEvent.setup()
      renderSelect()
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      await user.keyboard('{Enter}')
      expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    })

    it('opens on Space key', async () => {
      const user = userEvent.setup()
      renderSelect()
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      await user.keyboard(' ')
      expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    })
  })
})
