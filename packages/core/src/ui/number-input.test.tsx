import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { NumberInput } from './number-input'

describeConformance(
  'NumberInput',
  (props) => <NumberInput aria-label="Quantity" value={0} {...props} />,
  { sizes: ['xs', 'sm', 'md', 'lg'] },
)

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

  it('calls onValueChange with incremented value on increment click', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={3} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))

    expect(onValueChange).toHaveBeenCalledWith(4)
  })

  it('calls onValueChange with decremented value on decrement click', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={3} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))

    expect(onValueChange).toHaveBeenCalledWith(2)
  })

  it('respects step prop', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={10} step={5} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(onValueChange).toHaveBeenCalledWith(15)
  })

  it('does not increment beyond max', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={10} max={10} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not decrement below min', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberInput value={0} min={0} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))

    expect(onValueChange).not.toHaveBeenCalled()
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

})
