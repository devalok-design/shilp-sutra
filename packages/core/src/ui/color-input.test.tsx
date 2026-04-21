import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { ColorInput } from './color-input'

describeConformance(
  'ColorInput',
  (props) => <ColorInput value="#d33163" {...props} />,
)

describe('ColorInput', () => {
  it('renders trigger with color value', () => {
    render(<ColorInput value="#d33163" />)
    expect(screen.getByText('#D33163')).toBeInTheDocument()
  })

  it('renders trigger with aria-label', () => {
    render(<ColorInput value="#d33163" />)
    expect(screen.getByRole('button', { name: /Color picker: #d33163/i })).toBeInTheDocument()
  })

  it('opens popover on click', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#ff0000" />)
    await user.click(screen.getByRole('button'))
    // Format switcher buttons appear when popover opens
    expect(await screen.findByText('hex')).toBeInTheDocument()
    expect(screen.getByText('rgb')).toBeInTheDocument()
    expect(screen.getByText('hsl')).toBeInTheDocument()
  })

  it('displays preset color swatches', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#000000" />)
    await user.click(screen.getByRole('button'))
    // Default presets include named colors
    expect(await screen.findByLabelText(/Red/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Blue/i)).toBeInTheDocument()
  })

  it('hides presets when presets={false}', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#000000" presets={false} />)
    await user.click(screen.getByRole('button'))
    await screen.findByText('hex')
    expect(screen.queryByLabelText(/Red/i)).not.toBeInTheDocument()
  })

  it('fires onChange when preset is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ColorInput value="#000000" onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    const redPreset = await screen.findByLabelText(/Red/i)
    await user.click(redPreset)
    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('switches to RGB format', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#ff0000" />)
    await user.click(screen.getByRole('button'))
    const rgbButton = await screen.findByText('rgb')
    await user.click(rgbButton)
    // Should show R, G, B labels
    expect(await screen.findByText('R')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('switches to HSL format', async () => {
    const user = userEvent.setup()
    render(<ColorInput value="#ff0000" />)
    await user.click(screen.getByRole('button'))
    const hslButton = await screen.findByText('hsl')
    await user.click(hslButton)
    expect(await screen.findByText('H')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<ColorInput value="#000000" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders inline variant', () => {
    render(<ColorInput value="#d33163" variant="inline" />)
    expect(screen.getByRole('button', { name: /Color picker/i })).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(<ColorInput value="#ff0000" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
