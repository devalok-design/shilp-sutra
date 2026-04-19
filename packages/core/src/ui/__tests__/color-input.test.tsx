import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ColorInput } from '../color-input'

describe('ColorInput', () => {
  it('renders trigger button with color value', () => {
    render(<ColorInput value="#d33163" />)
    expect(screen.getByRole('button', { name: /color picker/i })).toBeInTheDocument()
    expect(screen.getByText('#D33163')).toBeInTheDocument()
  })

  it('renders trigger with default black when no value provided', () => {
    render(<ColorInput />)
    expect(screen.getByText('#000000')).toBeInTheDocument()
  })

  it('opens popover on trigger click and shows picker', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#3b82f6" />)
    await user.click(screen.getByRole('button', { name: /color picker/i }))
    // Format switcher should be visible
    expect(screen.getByText('hex')).toBeInTheDocument()
    expect(screen.getByText('rgb')).toBeInTheDocument()
    expect(screen.getByText('hsl')).toBeInTheDocument()
  })

  it('shows default named presets in popover', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#000000" />)
    await user.click(screen.getByRole('button', { name: /color picker/i }))
    expect(screen.getByTitle('Red')).toBeInTheDocument()
    expect(screen.getByTitle('Blue')).toBeInTheDocument()
    expect(screen.getByTitle('Emerald')).toBeInTheDocument()
  })

  it('calls onChange when a preset is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ColorInput value="#000000" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /color picker/i }))
    await user.click(screen.getByTitle('Red'))
    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('hides presets when presets={false}', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#000000" presets={false} />)
    await user.click(screen.getByRole('button', { name: /color picker/i }))
    expect(screen.queryByTitle('Red')).not.toBeInTheDocument()
  })

  it('disables trigger when disabled', () => {
    render(<ColorInput disabled value="#d33163" />)
    expect(screen.getByRole('button', { name: /color picker/i })).toBeDisabled()
  })
})
