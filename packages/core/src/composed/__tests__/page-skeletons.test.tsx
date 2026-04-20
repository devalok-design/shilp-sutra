import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  DashboardSkeleton,
  ProjectListSkeleton,
  TaskDetailSkeleton,
} from '../page-skeletons'

describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DashboardSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<DashboardSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(<DashboardSkeleton className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})

describe('ProjectListSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProjectListSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ProjectListSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<ProjectListSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('TaskDetailSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TaskDetailSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<TaskDetailSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<TaskDetailSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
