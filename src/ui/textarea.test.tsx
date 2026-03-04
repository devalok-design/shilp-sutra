import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Textarea } from './textarea'

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

  it('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(
      <Textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        placeholder="Ref test"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('merges custom className', () => {
    render(<Textarea className="my-class" placeholder="Styled" />)
    expect(screen.getByPlaceholderText('Styled')).toHaveClass('my-class')
  })

  it('applies rows attribute', () => {
    render(<Textarea rows={8} placeholder="Rows" />)
    expect(screen.getByPlaceholderText('Rows')).toHaveAttribute('rows', '8')
  })

  it('applies error state border class', () => {
    render(<Textarea state="error" placeholder="Error" />)
    const el = screen.getByPlaceholderText('Error')
    expect(el.className).toContain('border-border-error')
  })

  it('applies warning state border class', () => {
    render(<Textarea state="warning" placeholder="Warn" />)
    const el = screen.getByPlaceholderText('Warn')
    expect(el.className).toContain('border-border-warning')
  })

  it('applies success state border class', () => {
    render(<Textarea state="success" placeholder="Success" />)
    const el = screen.getByPlaceholderText('Success')
    expect(el.className).toContain('border-border-success')
  })

  it('renders read-only textarea', () => {
    render(<Textarea readOnly defaultValue="Read only text" placeholder="RO" />)
    expect(screen.getByPlaceholderText('RO')).toHaveAttribute('readonly')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <label htmlFor="textarea-desc">
        Description
        <Textarea id="textarea-desc" placeholder="Enter description" />
      </label>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
