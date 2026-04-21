import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Textarea } from './textarea'

describeConformance('Textarea', (props) => <Textarea aria-label="Test textarea" {...props} />, {
  sizes: ['xs', 'sm', 'md', 'lg'],
})

describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('handles value change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Textarea placeholder="Type here" onChange={onChange} />)

    await user.type(screen.getByPlaceholderText('Type here'), 'Hello')

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('Hello')
  })

  it('renders disabled state', () => {
    render(<Textarea disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })

  it('applies rows attribute', () => {
    render(<Textarea rows={8} placeholder="Rows" />)
    expect(screen.getByPlaceholderText('Rows')).toHaveAttribute('rows', '8')
  })

  it('applies error state border class', () => {
    render(<Textarea state="error" placeholder="Error" />)
    const el = screen.getByPlaceholderText('Error')
    expect(el.className).toContain('border-error-7')
  })

  it('applies warning state border class', () => {
    render(<Textarea state="warning" placeholder="Warn" />)
    const el = screen.getByPlaceholderText('Warn')
    expect(el.className).toContain('border-warning-7')
  })

  it('applies success state border class', () => {
    render(<Textarea state="success" placeholder="Success" />)
    const el = screen.getByPlaceholderText('Success')
    expect(el.className).toContain('border-success-7')
  })

  it('renders read-only textarea', () => {
    render(<Textarea readOnly defaultValue="Read only text" placeholder="RO" />)
    expect(screen.getByPlaceholderText('RO')).toHaveAttribute('readonly')
  })
})
