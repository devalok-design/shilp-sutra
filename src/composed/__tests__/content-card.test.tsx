import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { ContentCard } from '../content-card'

describe('ContentCard', () => {
  it('should have no accessibility violations with default rendering', async () => {
    const { container } = render(
      <ContentCard>
        <p>Card content goes here</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with header title', async () => {
    const { container } = render(
      <ContentCard headerTitle="Recent Activity">
        <p>Activity list</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with header actions', async () => {
    const { container } = render(
      <ContentCard
        headerTitle="Tasks"
        headerActions={<button type="button">View All</button>}
      >
        <p>Task list</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with footer', async () => {
    const { container } = render(
      <ContentCard footer={<span>Last updated: today</span>}>
        <p>Card body</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with outline variant', async () => {
    const { container } = render(
      <ContentCard variant="outline">
        <p>Outline card</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with ghost variant', async () => {
    const { container } = render(
      <ContentCard variant="ghost">
        <p>Ghost card</p>
      </ContentCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
