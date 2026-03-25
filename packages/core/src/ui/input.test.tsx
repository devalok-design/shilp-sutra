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

  it('applies custom className to the input element, not the wrapper', () => {
    render(<Input className="my-custom-class" placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveClass('my-custom-class')
    // Wrapper should NOT have the className
    expect(input.parentElement).not.toHaveClass('my-custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref as React.Ref<HTMLInputElement>} placeholder="Ref test" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('renders xs size with correct height class on the wrapper', () => {
    render(<Input size="xs" placeholder="Dense" />)
    const input = screen.getByPlaceholderText('Dense')
    const wrapper = input.parentElement!
    expect(wrapper).toHaveClass('h-ds-xs-plus')
  })

  // --- Section rendering ---

  it('renders startSection content', () => {
    render(
      <Input startSection={<span data-testid="start-icon">S</span>} placeholder="With start" />,
    )
    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
  })

  it('renders endSection content', () => {
    render(
      <Input endSection={<span data-testid="end-icon">E</span>} placeholder="With end" />,
    )
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it('adjusts input padding when startSection is present', () => {
    render(
      <Input size="md" startSection={<span>S</span>} placeholder="Padded" />,
    )
    const input = screen.getByPlaceholderText('Padded')
    expect(input).toHaveClass('pl-[38px]')
  })

  it('adjusts input padding when endSection is present', () => {
    render(
      <Input size="md" endSection={<span>E</span>} placeholder="Padded" />,
    )
    const input = screen.getByPlaceholderText('Padded')
    expect(input).toHaveClass('pr-[38px]')
  })

  // --- Section pointer-events ---

  it('sections are pointer-events-none by default', () => {
    render(
      <Input
        startSection={<span data-testid="start">S</span>}
        endSection={<span data-testid="end">E</span>}
        placeholder="PE test"
      />,
    )
    const startSpan = screen.getByTestId('start').parentElement!
    const endSpan = screen.getByTestId('end').parentElement!
    expect(startSpan).toHaveClass('pointer-events-none')
    expect(endSpan).toHaveClass('pointer-events-none')
  })

  it('startSectionClickable enables pointer-events on start section', () => {
    render(
      <Input
        startSection={<span data-testid="start">S</span>}
        startSectionClickable
        placeholder="Click start"
      />,
    )
    const startSpan = screen.getByTestId('start').parentElement!
    expect(startSpan).not.toHaveClass('pointer-events-none')
  })

  it('endSectionClickable enables pointer-events on end section', () => {
    render(
      <Input
        endSection={<span data-testid="end">E</span>}
        endSectionClickable
        placeholder="Click end"
      />,
    )
    const endSpan = screen.getByTestId('end').parentElement!
    expect(endSpan).not.toHaveClass('pointer-events-none')
  })

  // --- wrapperClassName ---

  it('applies wrapperClassName to the wrapper div', () => {
    render(<Input wrapperClassName="custom-wrapper" placeholder="Wrap" />)
    const input = screen.getByPlaceholderText('Wrap')
    const wrapper = input.parentElement!
    expect(wrapper).toHaveClass('custom-wrapper')
    expect(input).not.toHaveClass('custom-wrapper')
  })

  // --- State styling on wrapper ---

  it('applies error border classes to the wrapper', () => {
    render(<Input state="error" placeholder="Error" />)
    const wrapper = screen.getByPlaceholderText('Error').parentElement!
    expect(wrapper).toHaveClass('border-error-7')
  })

  it('applies warning border classes to the wrapper', () => {
    render(<Input state="warning" placeholder="Warning" />)
    const wrapper = screen.getByPlaceholderText('Warning').parentElement!
    expect(wrapper).toHaveClass('border-warning-7')
  })

  it('applies success border classes to the wrapper', () => {
    render(<Input state="success" placeholder="Success" />)
    const wrapper = screen.getByPlaceholderText('Success').parentElement!
    expect(wrapper).toHaveClass('border-success-7')
  })

  // --- Deprecated props backward compat ---

  it('deprecated startIcon prop renders as startSection', () => {
    render(
      <Input startIcon={<span data-testid="legacy-icon">L</span>} placeholder="Legacy" />,
    )
    expect(screen.getByTestId('legacy-icon')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Legacy')
    expect(input).toHaveClass('pl-[38px]')
  })

  it('deprecated endIcon prop renders as endSection', () => {
    render(
      <Input endIcon={<span data-testid="legacy-end">L</span>} placeholder="Legacy end" />,
    )
    expect(screen.getByTestId('legacy-end')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Legacy end')
    expect(input).toHaveClass('pr-[38px]')
  })

  // --- Size variants on wrapper ---

  it('renders lg size with rounded-ds-lg on wrapper', () => {
    render(<Input size="lg" placeholder="Large" />)
    const wrapper = screen.getByPlaceholderText('Large').parentElement!
    expect(wrapper).toHaveClass('rounded-ds-lg')
  })

  it('renders md size with rounded-ds-md on wrapper', () => {
    render(<Input size="md" placeholder="Medium" />)
    const wrapper = screen.getByPlaceholderText('Medium').parentElement!
    expect(wrapper).toHaveClass('rounded-ds-md')
  })
})
