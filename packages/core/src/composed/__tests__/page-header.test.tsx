import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { PageHeader } from '../page-header'

describe('PageHeader', () => {
  it('should have no accessibility violations with title only', async () => {
    const { container } = render(<PageHeader title="Dashboard" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with subtitle', async () => {
    const { container } = render(
      <PageHeader title="Projects" subtitle="Manage your active projects" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with breadcrumbs', async () => {
    const { container } = render(
      <PageHeader
        title="Task Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Task Details' },
        ]}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with actions', async () => {
    const { container } = render(
      <PageHeader
        title="Team Members"
        actions={<button type="button">Add Member</button>}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('auto-derives title from last breadcrumb when title is omitted', () => {
    const { getByRole } = render(
      <PageHeader breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />,
    )
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard')
  })

  it('explicit title takes precedence over breadcrumbs', () => {
    const { getByRole } = render(
      <PageHeader title="Custom Title" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />,
    )
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title')
  })

  it('should have no a11y violations with auto-derived title', async () => {
    const { container } = render(
      <PageHeader breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with all props', async () => {
    const { container } = render(
      <PageHeader
        title="Project Alpha"
        subtitle="Sprint 5 overview"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Project Alpha' },
        ]}
        actions={
          <>
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </>
        }
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
