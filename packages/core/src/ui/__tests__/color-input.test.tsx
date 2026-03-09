import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ColorInput } from '../color-input'

describe('ColorInput', () => {
  it('renders with default value', () => {
    render(<ColorInput />)
    const inputs = screen.getAllByDisplayValue('#000000')
    // Both the hidden color input and the text input share the value
    expect(inputs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with provided value', () => {
    render(<ColorInput value="#d33163" />)
    const inputs = screen.getAllByDisplayValue('#d33163')
    expect(inputs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders preset swatches when provided', () => {
    render(<ColorInput presets={['#ff0000', '#00ff00', '#0000ff']} />)
    expect(screen.getByLabelText('Select color #ff0000')).toBeInTheDocument()
    expect(screen.getByLabelText('Select color #00ff00')).toBeInTheDocument()
    expect(screen.getByLabelText('Select color #0000ff')).toBeInTheDocument()
  })

  it('calls onChange when preset is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ColorInput value="#000000" onChange={onChange} presets={['#ff0000']} />)
    await user.click(screen.getByLabelText('Select color #ff0000'))
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('disables inputs when disabled', () => {
    render(<ColorInput disabled value="#d33163" presets={['#ff0000']} />)
    // Find the text input specifically (type="text")
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeDisabled()
    expect(screen.getByLabelText('Select color #ff0000')).toBeDisabled()
  })
})
