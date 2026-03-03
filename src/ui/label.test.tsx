import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Label } from './label'

describe('Label', () => {
  it('renders text content', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </>,
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('merges custom className', () => {
    render(<Label className="my-label">Name</Label>)
    expect(screen.getByText('Name')).toHaveClass('my-label')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(
      <Label ref={ref as React.Ref<HTMLLabelElement>}>Ref test</Label>,
    )
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('renders required indicator when required is true', () => {
    render(<Label required>Username</Label>)
    const label = screen.getByText('Username')
    expect(label.parentElement?.textContent || label.textContent).toContain('*')
  })

  it('does not render required indicator by default', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username').textContent).not.toContain('*')
  })

  it('renders children elements', () => {
    render(
      <Label>
        <span data-testid="child">Email</span>
      </Label>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <>
        <Label htmlFor="name-input">Name</Label>
        <input id="name-input" type="text" />
      </>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
