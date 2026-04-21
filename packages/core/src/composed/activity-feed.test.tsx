import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { ActivityFeed, type ActivityItem,groupItemsByTime } from './activity-feed'

const now = new Date()

function makeItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: '1',
    actor: { name: 'Alice' },
    action: 'created a task',
    timestamp: now,
    ...overrides,
  }
}

describe('ActivityFeed', () => {
  it('renders activity items', () => {
    const items = [
      makeItem({ id: '1', actor: { name: 'Alice' }, action: 'created a task' }),
      makeItem({ id: '2', actor: { name: 'Bob' }, action: 'commented' }),
    ]
    render(<ActivityFeed items={items} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('created a task')).toBeInTheDocument()
    expect(screen.getByText('commented')).toBeInTheDocument()
  })

  it('shows emptyState when items is empty', () => {
    render(<ActivityFeed items={[]} emptyState={<p>No activity</p>} />)
    expect(screen.getByText('No activity')).toBeInTheDocument()
  })

  it('returns null when items is empty and no emptyState', () => {
    const { container } = render(<ActivityFeed items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<ActivityFeed items={[]} loading />)
    // Loading skeleton renders divs, not the items
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('truncates items and shows "Show all" button with maxInitialItems', async () => {
    const user = userEvent.setup()
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({ id: String(i), action: `action ${i}` }),
    )
    render(<ActivityFeed items={items} maxInitialItems={2} />)
    expect(screen.getByText('action 0')).toBeInTheDocument()
    expect(screen.getByText('action 1')).toBeInTheDocument()
    expect(screen.queryByText('action 4')).not.toBeInTheDocument()
    expect(screen.getByText('Show all (5)')).toBeInTheDocument()

    await user.click(screen.getByText('Show all (5)'))
    expect(screen.getByText('action 4')).toBeInTheDocument()
  })

  it('shows "Load more" button when hasMore and onLoadMore', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()
    render(
      <ActivityFeed
        items={[makeItem()]}
        hasMore
        onLoadMore={onLoadMore}
      />,
    )
    const btn = screen.getByText('Load more')
    expect(btn).toBeInTheDocument()
    await user.click(btn)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  describe('renderItem', () => {
    it('renders custom content when renderItem returns JSX', () => {
      const items = [makeItem({ id: '1', action: 'created a task' })]
      render(
        <ActivityFeed
          items={items}
          renderItem={() => <div>Custom card content</div>}
        />,
      )
      expect(screen.getByText('Custom card content')).toBeInTheDocument()
      // Default action text should NOT be rendered
      expect(screen.queryByText('created a task')).not.toBeInTheDocument()
    })

    it('falls back to default ActivityEntry when renderItem returns undefined', () => {
      const items = [makeItem({ id: '1', actor: { name: 'Alice' }, action: 'created a task' })]
      render(
        <ActivityFeed
          items={items}
          renderItem={() => undefined}
        />,
      )
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('created a task')).toBeInTheDocument()
    })

    it('uses default rendering when renderItem is not provided', () => {
      const items = [
        makeItem({ id: '1', actor: { name: 'Alice' }, action: 'created a task' }),
        makeItem({ id: '2', actor: { name: 'Bob' }, action: 'commented' }),
      ]
      render(<ActivityFeed items={items} />)
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('created a task')).toBeInTheDocument()
      expect(screen.getByText('commented')).toBeInTheDocument()
    })

    it('still renders timeline dot when using custom renderItem', () => {
      const items = [makeItem({ id: '1', color: 'success' })]
      const { container } = render(
        <ActivityFeed
          items={items}
          renderItem={() => <div>Custom content</div>}
        />,
      )
      // The dot should have the success color class
      const dot = container.querySelector('.bg-success-9')
      expect(dot).toBeInTheDocument()
      // The timeline line should still be present
      const timelineLine = container.querySelector('.bg-surface-border')
      expect(timelineLine).toBeInTheDocument()
    })

    it('supports mixed rendering: some items custom, some default', () => {
      const items = [
        makeItem({ id: '1', actor: { name: 'Alice' }, action: 'created a task' }),
        makeItem({ id: '2', actor: { name: 'Bob' }, action: 'commented' }),
      ]
      render(
        <ActivityFeed
          items={items}
          renderItem={(item, index) => {
            if (index === 0) return <div>Custom for Alice</div>
            return undefined // fallback for Bob
          }}
        />,
      )
      // First item: custom rendering
      expect(screen.getByText('Custom for Alice')).toBeInTheDocument()
      expect(screen.queryByText('created a task')).not.toBeInTheDocument()
      // Second item: default rendering
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('commented')).toBeInTheDocument()
    })
  })

  it('applies gap-1 in compact mode', () => {
    const { container } = render(<ActivityFeed items={[makeItem()]} compact />)
    expect(container.querySelector('.gap-1')).toBeInTheDocument()
  })

  it('expands detail on action click', async () => {
    const user = userEvent.setup()
    const items = [
      makeItem({
        id: '1',
        action: 'updated the status',
        detail: <p>Status changed from "In Progress" to "Done"</p>,
      }),
    ]
    render(<ActivityFeed items={items} />)
    expect(screen.queryByText(/Status changed/)).not.toBeInTheDocument()
    await user.click(screen.getByText('updated the status'))
    expect(screen.getByText(/Status changed from/)).toBeInTheDocument()
  })
})

describe('ActivityFeed groupBy', () => {
  beforeEach(() => {
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
  })

  it('does not render group headers by default (groupBy="none")', () => {
    render(<ActivityFeed items={groupedItems} />)
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
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

describe('groupItemsByTime', () => {
  it('groups items into time buckets', () => {
    const todayItem = makeItem({ id: 'today', timestamp: new Date() })
    const oldItem = makeItem({
      id: 'old',
      timestamp: new Date('2020-01-01'),
    })
    const groups = groupItemsByTime([todayItem, oldItem])
    expect(groups.length).toBeGreaterThanOrEqual(2)
    expect(groups[0].label).toBe('Today')
    expect(groups[groups.length - 1].label).toBe('Older')
  })

  it('respects custom group labels', () => {
    const todayItem = makeItem({ id: 'today', timestamp: new Date() })
    const groups = groupItemsByTime([todayItem], { today: 'Hoy' })
    expect(groups[0].label).toBe('Hoy')
  })
})
