import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { ActivityFeed, groupItemsByTime, type ActivityItem } from '../activity-feed'

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

// ── Time grouping tests ────────────────────────────────────────

describe('groupItemsByTime', () => {
  beforeEach(() => {
    // Wednesday 2026-03-11 at 14:00 UTC
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-11T14:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('groups items into today, yesterday, this week, and older', () => {
    const items: ActivityItem[] = [
      { id: 't1', action: 'today action', timestamp: new Date('2026-03-11T10:00:00Z') },
      { id: 't2', action: 'yesterday action', timestamp: new Date('2026-03-10T10:00:00Z') },
      { id: 't3', action: 'this week action', timestamp: new Date('2026-03-09T10:00:00Z') }, // Monday
      { id: 't4', action: 'older action', timestamp: new Date('2026-03-05T10:00:00Z') },
    ]
    const groups = groupItemsByTime(items)
    expect(groups).toHaveLength(4)
    expect(groups[0].label).toBe('Today')
    expect(groups[0].items).toHaveLength(1)
    expect(groups[1].label).toBe('Yesterday')
    expect(groups[1].items).toHaveLength(1)
    expect(groups[2].label).toBe('This Week')
    expect(groups[2].items).toHaveLength(1)
    expect(groups[3].label).toBe('Older')
    expect(groups[3].items).toHaveLength(1)
  })

  it('skips empty groups', () => {
    const items: ActivityItem[] = [
      { id: 't1', action: 'today action', timestamp: new Date('2026-03-11T10:00:00Z') },
      { id: 't2', action: 'older action', timestamp: new Date('2026-02-01T10:00:00Z') },
    ]
    const groups = groupItemsByTime(items)
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe('Today')
    expect(groups[1].label).toBe('Older')
  })

  it('supports custom group labels', () => {
    const items: ActivityItem[] = [
      { id: 't1', action: 'today action', timestamp: new Date('2026-03-11T10:00:00Z') },
      { id: 't2', action: 'old action', timestamp: new Date('2026-01-01T10:00:00Z') },
    ]
    const groups = groupItemsByTime(items, { today: 'Aaj', older: 'Purana' })
    expect(groups[0].label).toBe('Aaj')
    expect(groups[1].label).toBe('Purana')
  })
})

describe('ActivityFeed groupBy', () => {
  beforeEach(() => {
    // Wednesday 2026-03-11 at 14:00 UTC
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-11T14:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const groupedItems: ActivityItem[] = [
    { id: 'g1', actor: { name: 'Alice' }, action: 'did thing today', timestamp: new Date('2026-03-11T10:00:00Z') },
    { id: 'g2', actor: { name: 'Bob' }, action: 'did thing yesterday', timestamp: new Date('2026-03-10T10:00:00Z') },
    { id: 'g3', actor: { name: 'Charlie' }, action: 'did thing last week', timestamp: new Date('2026-03-01T10:00:00Z') },
  ]

  it('renders group headers when groupBy="time"', () => {
    render(<ActivityFeed items={groupedItems} groupBy="time" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Older')).toBeInTheDocument()
    // Items still rendered
    expect(screen.getByText('did thing today')).toBeInTheDocument()
    expect(screen.getByText('did thing yesterday')).toBeInTheDocument()
    expect(screen.getByText('did thing last week')).toBeInTheDocument()
  })

  it('does not render group headers when groupBy="none"', () => {
    render(<ActivityFeed items={groupedItems} groupBy="none" />)
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
    expect(screen.queryByText('Yesterday')).not.toBeInTheDocument()
    expect(screen.queryByText('Older')).not.toBeInTheDocument()
  })

  it('does not render group headers by default', () => {
    render(<ActivityFeed items={groupedItems} />)
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })

  it('maxInitialItems applies before grouping', () => {
    render(<ActivityFeed items={groupedItems} groupBy="time" maxInitialItems={2} />)
    // Only first 2 items should appear (today + yesterday)
    expect(screen.getByText('did thing today')).toBeInTheDocument()
    expect(screen.getByText('did thing yesterday')).toBeInTheDocument()
    expect(screen.queryByText('did thing last week')).not.toBeInTheDocument()
    // Show all button
    expect(screen.getByRole('button', { name: /show all \(3\)/i })).toBeInTheDocument()
  })

  it('renders custom group labels', () => {
    render(
      <ActivityFeed
        items={groupedItems}
        groupBy="time"
        groupLabels={{ today: 'Aaj', yesterday: 'Kal', older: 'Purana' }}
      />,
    )
    expect(screen.getByText('Aaj')).toBeInTheDocument()
    expect(screen.getByText('Kal')).toBeInTheDocument()
    expect(screen.getByText('Purana')).toBeInTheDocument()
  })
})
