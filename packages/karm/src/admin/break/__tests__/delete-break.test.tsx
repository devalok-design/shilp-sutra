import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { DeleteBreak } from '../delete-break'

// Mock Dialog primitives
vi.mock('@/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/ui/toast', () => {
  const mockToast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    message: vi.fn(),
  })
  return { toast: mockToast }
})

describe('DeleteBreak', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <DeleteBreak id="b1" userId="u1" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DeleteBreak id="b1" userId="u1" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders delete trigger button', () => {
    render(<DeleteBreak id="b1" userId="u1" />)
    expect(screen.getByLabelText('Delete break')).toBeInTheDocument()
  })

  it('renders confirmation text', () => {
    render(<DeleteBreak id="b1" userId="u1" />)
    expect(screen.getByText('Delete this break?')).toBeInTheDocument()
  })

  it('renders confirm button', () => {
    render(<DeleteBreak id="b1" userId="u1" />)
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
  })
})
