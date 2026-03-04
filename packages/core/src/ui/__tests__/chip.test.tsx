import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chip } from '../chip'

describe('Chip', () => {
  it('renders label text', () => {
    render(<Chip label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders as button when onClick provided', () => {
    render(<Chip label="Clickable" onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /clickable/i })).toBeInTheDocument()
  })

  it('renders as span when not interactive', () => {
    render(<Chip label="Static" />)
    expect(screen.queryByRole('button', { name: /static/i })).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Chip label="Click me" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders delete button when onDelete provided', () => {
    const onDelete = vi.fn()
    render(<Chip label="Deletable" onDelete={onDelete} />)
    const deleteBtn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('supports variant prop', () => {
    const { container } = render(<Chip label="Outlined" variant="outlined" />)
    expect((container.firstChild as HTMLElement)?.className).toContain('border')
  })

  it('supports disabled state', () => {
    render(<Chip label="Disabled" onClick={() => {}} disabled />)
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled()
  })
})
