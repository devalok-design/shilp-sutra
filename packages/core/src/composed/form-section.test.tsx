import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormSection } from './form-section'

describe('FormSection', () => {
  it('renders the title', () => {
    render(<FormSection title="Personal Info" />)
    expect(screen.getByText('Personal Info')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <FormSection title="Contact" description="How we can reach you" />,
    )
    expect(screen.getByText('How we can reach you')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<FormSection title="Basic" />)
    // Only the title span and children wrapper should exist
    expect(container.textContent).toBe('Basic')
  })

  it('renders children', () => {
    render(
      <FormSection title="Settings">
        <input placeholder="Name" />
        <input placeholder="Email" />
      </FormSection>,
    )
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <FormSection title="Section" className="my-section" />,
    )
    expect(container.firstElementChild).toHaveClass('my-section')
  })

  it('renders collapsible mode', () => {
    render(
      <FormSection title="Advanced" collapsible>
        <span>Advanced content</span>
      </FormSection>,
    )
    expect(screen.getByText('Advanced')).toBeInTheDocument()
    // Content visible by default (defaultOpen=true)
    expect(screen.getByText('Advanced content')).toBeInTheDocument()
  })
})
