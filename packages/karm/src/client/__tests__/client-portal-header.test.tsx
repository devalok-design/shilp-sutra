import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { ClientPortalHeader } from '../client-portal-header'

describe('ClientPortalHeader', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders organization name', () => {
    render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      />,
    )
    expect(screen.getByText('Devalok Studios')).toBeInTheDocument()
  })

  it('renders org initials when no logo', () => {
    render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      />,
    )
    expect(screen.getByText('DS')).toBeInTheDocument()
  })

  it('renders org logo when provided', () => {
    render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        orgLogo="/logo.png"
        userName="Alice Johnson"
      />,
    )
    const img = screen.getByAltText('Devalok Studios')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/logo.png')
  })

  it('renders user avatar fallback initials', () => {
    render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      />,
    )
    expect(screen.getByText('AJ')).toBeInTheDocument()
  })

  it('renders header element with banner role', () => {
    const { container } = render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      />,
    )
    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <ClientPortalHeader
        orgName="Devalok Studios"
        userName="Alice Johnson"
      >
        <button>Custom Action</button>
      </ClientPortalHeader>,
    )
    expect(screen.getByText('Custom Action')).toBeInTheDocument()
  })
})
