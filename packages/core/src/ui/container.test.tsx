import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Container } from './container'

describe('Container', () => {
  it('renders children in a div by default', () => {
    render(<Container data-testid="ctr">Page content</Container>)
    const el = screen.getByTestId('ctr')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveTextContent('Page content')
  })

  it('applies default maxWidth (max-w-layout)', () => {
    render(<Container data-testid="ctr">Content</Container>)
    expect(screen.getByTestId('ctr')).toHaveClass('max-w-layout')
  })

  it('maxWidth="body" applies max-w-layout-body', () => {
    render(<Container data-testid="ctr" maxWidth="body">Content</Container>)
    expect(screen.getByTestId('ctr')).toHaveClass('max-w-layout-body')
  })

  it('maxWidth="full" applies max-w-full', () => {
    render(<Container data-testid="ctr" maxWidth="full">Content</Container>)
    expect(screen.getByTestId('ctr')).toHaveClass('max-w-full')
  })

  it('applies base layout classes', () => {
    render(<Container data-testid="ctr">Content</Container>)
    const el = screen.getByTestId('ctr')
    expect(el).toHaveClass('mx-auto', 'w-full', 'px-page-x')
  })

  it('as prop changes rendered element', () => {
    render(<Container as="main" data-testid="ctr">Content</Container>)
    expect(screen.getByTestId('ctr').tagName).toBe('MAIN')
  })

  it('as="section" renders a section', () => {
    render(<Container as="section" data-testid="ctr">Content</Container>)
    expect(screen.getByTestId('ctr').tagName).toBe('SECTION')
  })

  it('merges custom className', () => {
    render(<Container data-testid="ctr" className="my-container">Content</Container>)
    const el = screen.getByTestId('ctr')
    expect(el).toHaveClass('my-container')
    expect(el).toHaveClass('mx-auto')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Container ref={ref}>Ref test</Container>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes through HTML attributes', () => {
    render(<Container data-testid="ctr" id="main-container" role="main">Content</Container>)
    const el = screen.getByTestId('ctr')
    expect(el).toHaveAttribute('id', 'main-container')
    expect(el).toHaveAttribute('role', 'main')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Container as="main">
        <p>Page content goes here.</p>
      </Container>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
