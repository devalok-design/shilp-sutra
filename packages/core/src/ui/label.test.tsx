import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Label } from './label'

describeConformance('Label', (props) => <Label {...props}>Email</Label>)

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
})
