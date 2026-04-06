import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '../breadcrumb'

const renderBreadcrumb = () =>
  render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  )

describe('Breadcrumb', () => {
  it('renders navigation landmark with breadcrumb label', () => {
    renderBreadcrumb()
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
  })

  it('renders links', () => {
    renderBreadcrumb()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products')
  })

  it('renders current page with aria-current', () => {
    renderBreadcrumb()
    const page = screen.getByText('Current')
    expect(page).toHaveAttribute('aria-current', 'page')
  })

  it('renders separator as presentation role', () => {
    const { container } = renderBreadcrumb()
    const separators = container.querySelectorAll('[aria-hidden="true"]')
    expect(separators.length).toBeGreaterThanOrEqual(2)
  })

  it('renders ellipsis', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(container.querySelector('.sr-only')).toHaveTextContent('More')
  })

  it('forwards ref on root', () => {
    const ref = { current: null as HTMLElement | null }
    render(
      <Breadcrumb ref={ref as React.Ref<HTMLElement>}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('merges custom className on list', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList className="my-list" data-testid="list">
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByTestId('list')).toHaveClass('my-list')
  })
})
