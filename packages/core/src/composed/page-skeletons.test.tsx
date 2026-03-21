import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardSkeleton, ProjectListSkeleton, TaskDetailSkeleton } from './page-skeletons'

describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders 4 stat cards', () => {
    const { container } = render(<DashboardSkeleton />)
    const statCards = container.querySelectorAll('[class*="grid-cols-1"] > div')
    expect(statCards.length).toBe(4)
  })

  it('merges custom className', () => {
    const { container } = render(<DashboardSkeleton className="my-dash" />)
    expect(container.firstElementChild).toHaveClass('my-dash')
  })

  it('forwards ref', () => {
    let ref: HTMLDivElement | null = null
    render(<DashboardSkeleton ref={(el) => { ref = el }} />)
    expect(ref).toBeInstanceOf(HTMLDivElement)
  })
})

describe('ProjectListSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProjectListSkeleton />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders 6 project cards', () => {
    const { container } = render(<ProjectListSkeleton />)
    // The project cards grid uses lg:grid-cols-3
    const grid = container.querySelector('[class*="grid-cols-1"][class*="lg:grid-cols-3"]')
    expect(grid).toBeInTheDocument()
    expect(grid!.children.length).toBe(6)
  })

  it('merges custom className', () => {
    const { container } = render(<ProjectListSkeleton className="my-projects" />)
    expect(container.firstElementChild).toHaveClass('my-projects')
  })
})

describe('TaskDetailSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TaskDetailSkeleton />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders 5 property rows', () => {
    const { container } = render(<TaskDetailSkeleton />)
    const propertyRows = container.querySelectorAll('[class*="flex items-center gap-ds-05 py-ds-03"]')
    expect(propertyRows.length).toBe(5)
  })

  it('merges custom className', () => {
    const { container } = render(<TaskDetailSkeleton className="my-task" />)
    expect(container.firstElementChild).toHaveClass('my-task')
  })
})
