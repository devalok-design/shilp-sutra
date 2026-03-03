import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { ProjectCard } from '../project-card'

describe('ProjectCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ProjectCard
        name="Design System"
        status="active"
        taskCount={10}
        completedTasks={3}
        description="Build a comprehensive design system"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders project name', () => {
    render(
      <ProjectCard name="Design System" status="active" />,
    )
    expect(screen.getByText('Design System')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <ProjectCard
        name="Design System"
        status="active"
        description="Build a comprehensive design system"
      />,
    )
    expect(screen.getByText('Build a comprehensive design system')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(
      <ProjectCard name="Project X" status="completed" />,
    )
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('renders task progress', () => {
    render(
      <ProjectCard
        name="Project X"
        status="active"
        taskCount={10}
        completedTasks={5}
      />,
    )
    expect(screen.getByText('5 / 10 tasks')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders 0% when no tasks', () => {
    render(
      <ProjectCard name="Project X" status="paused" />,
    )
    expect(screen.getByText('0 / 0 tasks')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
