import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { NumberInput } from './number-input'

describe('NumberInput', () => {
  it('renders with default value of 0', () => {
    render(<NumberInput />)
    expect(screen.getByRole('spinbutton')).toHaveValue(0)
  })

  it('renders with provided value', () => {
    render(<NumberInput value={5} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(5)
  })

  it('renders increment and decrement buttons', () => {
    render(<NumberInput />)
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeInTheDocument()
  })

  it('calls onChange with incremented value on increment click', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={3} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onChange with decremented value on decrement click', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={3} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('respects step prop', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={10} step={5} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(onChange).toHaveBeenCalledWith(15)
  })

  it('does not increment beyond max', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={10} max={10} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not decrement below min', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={0} min={0} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables increment button when value equals max', () => {
    render(<NumberInput value={10} max={10} />)
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeDisabled()
  })

  it('disables decrement button when value equals min', () => {
    render(<NumberInput value={0} min={0} />)
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeDisabled()
  })

  it('disables all controls when disabled', () => {
    render(<NumberInput value={5} disabled />)
    expect(screen.getByRole('spinbutton')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeDisabled()
  })

  it('forwards ref to input element', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(
      <NumberInput ref={ref as React.Ref<HTMLInputElement>} value={0} />,
    )
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('merges custom className on wrapper', () => {
    const { container } = render(
      <NumberInput value={0} className="my-number" />,
    )
    expect(container.querySelector('.my-number')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label>
        Quantity
        <NumberInput value={1} min={0} max={10} />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
