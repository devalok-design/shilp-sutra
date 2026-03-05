import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from '../label'

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('renders required indicator when required prop is set', () => {
    render(<Label required>Username</Label>)
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Label className="custom-class">Custom</Label>)
    const el = screen.getByText('Custom')
    expect(el).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLLabelElement>
    render(<Label ref={ref}>Ref test</Label>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
