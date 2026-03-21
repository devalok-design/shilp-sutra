import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Settings" subtitle="Manage your preferences" />)
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument()
  })

  it('renders breadcrumbs navigation', () => {
    render(
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Current' },
        ]}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    // "Current" appears as both a breadcrumb span and as the resolved h1 title
    expect(screen.getAllByText('Current').length).toBe(2)
  })

  it('renders breadcrumb links as anchor tags', () => {
    render(
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ]}
      />,
    )
    const link = screen.getByText('Home')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/')
  })

  it('uses last breadcrumb as title when title is not provided', () => {
    render(
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'My Page' },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'My Page' })).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(
      <PageHeader title="Page" actions={<button>Create</button>} />,
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<PageHeader title="Test" className="my-header" />)
    expect(container.firstElementChild).toHaveClass('my-header')
  })

  it('applies titleClassName to the heading', () => {
    render(<PageHeader title="Styled" titleClassName="text-red-500" />)
    expect(screen.getByRole('heading', { name: 'Styled' })).toHaveClass('text-red-500')
  })
})
