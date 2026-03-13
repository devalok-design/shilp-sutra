import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ReviewTab } from '../review-tab'
import type { ReviewRequest } from '../review-tab'

// Mock MemberPicker (uses Popover internally)
vi.mock('@/composed/member-picker', () => ({
  MemberPicker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockReview: ReviewRequest = {
  id: 'rev1',
  taskId: 't1',
  status: 'PENDING',
  feedback: null,
  requestedBy: { id: 'u1', name: 'Alice', image: null },
  reviewer: { id: 'u2', name: 'Bob', image: null },
  createdAt: '2026-03-10T10:00:00Z',
  updatedAt: '2026-03-10T10:00:00Z',
}

const mockMembers = [
  { id: 'u1', name: 'Alice', image: null },
  { id: 'u2', name: 'Bob', image: null },
]

describe('ReviewTab', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders reviewer name', () => {
    render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders "requested by" text', () => {
    render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText(/requested by Alice/)).toBeInTheDocument()
  })

  it('renders Pending badge for pending review', () => {
    render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders Respond button for pending review', () => {
    render(
      <ReviewTab
        reviews={[mockReview]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText('Respond')).toBeInTheDocument()
  })

  it('renders empty state when no reviews', () => {
    render(
      <ReviewTab
        reviews={[]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('renders Request Review button', () => {
    render(
      <ReviewTab
        reviews={[]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(screen.getByText('Request Review')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <ReviewTab
        ref={ref}
        className="custom"
        reviews={[]}
        members={mockMembers}
        onRequestReview={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
