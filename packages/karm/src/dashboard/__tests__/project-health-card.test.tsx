import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ProjectHealthCard } from '../project-health-card'
import type { ProjectHealthData } from '../project-health-card'

const baseProject: ProjectHealthData = {
  id: 'p1',
  name: 'Client Portal Redesign',
  completed: 18,
  total: 24,
  contextLine: 'Sprint ends Mar 19',
}

describe('ProjectHealthCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ProjectHealthCard project={baseProject} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders project name', () => {
    render(<ProjectHealthCard project={baseProject} />)
    expect(screen.getByText('Client Portal Redesign')).toBeInTheDocument()
  })

  it('renders urgent badge when urgent > 0', () => {
    render(
      <ProjectHealthCard
        project={{ ...baseProject, urgent: 2, overdue: 3 }}
      />,
    )
    expect(screen.getByText('2 urgent')).toBeInTheDocument()
  })

  it('renders overdue badge when no urgent but overdue > 0', () => {
    render(
      <ProjectHealthCard project={{ ...baseProject, overdue: 3 }} />,
    )
    // Badge contains "3 overdue" — find it within the badge element
    const badges = screen.getAllByText('3 overdue')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "on track" when neither urgent nor overdue', () => {
    render(<ProjectHealthCard project={baseProject} />)
    expect(screen.getByText('on track')).toBeInTheDocument()
  })

  it('renders progress count "N/N tasks"', () => {
    render(<ProjectHealthCard project={baseProject} />)
    expect(screen.getByText('18/24 tasks')).toBeInTheDocument()
  })

  it('renders context line', () => {
    render(
      <ProjectHealthCard
        project={{ ...baseProject, contextLine: 'Sprint ends Mar 19' }}
      />,
    )
    expect(screen.getByText(/Sprint ends Mar 19/)).toBeInTheDocument()
  })

  it('renders sparkline SVG when trend provided', () => {
    const { container } = render(
      <ProjectHealthCard
        project={{
          ...baseProject,
          trend: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        }}
      />,
    )
    const svg = container.querySelector('svg.sparkline')
    expect(svg).toBeInTheDocument()
  })

  it('does not render sparkline when no trend', () => {
    const { container } = render(
      <ProjectHealthCard project={baseProject} />,
    )
    const svg = container.querySelector('svg.sparkline')
    expect(svg).not.toBeInTheDocument()
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<ProjectHealthCard project={baseProject} onClick={onClick} />)
    fireEvent.click(screen.getByText('Client Portal Redesign').closest('[data-testid="project-health-card"]')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders loading skeleton', () => {
    const { container } = render(
      <ProjectHealthCard project={baseProject} loading />,
    )
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })
})
