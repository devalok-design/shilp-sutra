import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ActivityFeed, type ActivityItem } from '../activity-feed'

const now = new Date()

const mockItems: ActivityItem[] = [
  {
    id: '1',
    actor: { name: 'Alice Johnson', image: 'https://example.com/alice.jpg' },
    action: 'created a task',
    timestamp: new Date(now.getTime() - 5 * 60 * 1000),
    color: 'success',
  },
  {
    id: '2',
    actor: { name: 'Bob Smith' },
    action: 'commented on the issue',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    color: 'info',
  },
  {
    id: '3',
    actor: { name: 'Charlie Brown' },
    action: 'updated the status',
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    detail: <p>Status changed from "In Progress" to "Done"</p>,
  },
]

describe('ActivityFeed', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ActivityFeed items={mockItems} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders all activity items with actor names and actions', () => {
    render(<ActivityFeed items={mockItems} />)
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('created a task')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('commented on the issue')).toBeInTheDocument()
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    expect(screen.getByText('updated the status')).toBeInTheDocument()
  })

  it('renders actor avatar when image provided', () => {
    render(<ActivityFeed items={mockItems} />)
    // Radix Avatar falls back to initials in jsdom (no image loading).
    // Verify avatar fallback initials are rendered for actors.
    expect(screen.getByText('AJ')).toBeInTheDocument() // Alice Johnson
  })

  it('renders emptyState when no items', () => {
    render(<ActivityFeed items={[]} emptyState={<p>No activity yet</p>} />)
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
  })

  it('returns null when no items and no emptyState', () => {
    const { container } = render(<ActivityFeed items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows Load more button when hasMore and calls onLoadMore', async () => {
    const onLoadMore = vi.fn()
    const user = userEvent.setup()
    render(<ActivityFeed items={mockItems} hasMore onLoadMore={onLoadMore} />)
    const btn = screen.getByRole('button', { name: /load more/i })
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('truncates with maxInitialItems and shows Show all toggle', async () => {
    const user = userEvent.setup()
    render(<ActivityFeed items={mockItems} maxInitialItems={1} />)
    // Only first item visible
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
    // Show all button
    const showAllBtn = screen.getByRole('button', { name: /show all \(3\)/i })
    expect(showAllBtn).toBeInTheDocument()
    await user.click(showAllBtn)
    // Now all visible
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
  })

  it('renders loading skeleton', () => {
    const { container } = render(<ActivityFeed items={[]} loading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('applies gap-1 in compact mode', () => {
    const { container } = render(<ActivityFeed items={mockItems} compact />)
    const itemsContainer = container.querySelector('.gap-1')
    expect(itemsContainer).toBeInTheDocument()
  })

  it('expands detail on action click', async () => {
    const user = userEvent.setup()
    render(<ActivityFeed items={mockItems} />)
    // Detail not visible initially
    expect(screen.queryByText(/Status changed/)).not.toBeInTheDocument()
    // Click on the action with detail
    await user.click(screen.getByText('updated the status'))
    expect(screen.getByText(/Status changed from/)).toBeInTheDocument()
  })
})
