import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('has aria-invalid when state is error', () => {
    render(<Input state="error" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not have aria-invalid for non-error states', () => {
    render(<Input state="warning" placeholder="Name" />)
    expect(screen.getByPlaceholderText('Name')).not.toHaveAttribute('aria-invalid')
  })

  it('applies custom className', () => {
    render(<Input className="my-custom-class" placeholder="Test" />)
    expect(screen.getByPlaceholderText('Test')).toHaveClass('my-custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref as React.Ref<HTMLInputElement>} placeholder="Ref test" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
