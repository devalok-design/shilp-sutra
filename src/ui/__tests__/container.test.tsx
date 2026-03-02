import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from '../container'

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('defaults to div element', () => {
    render(<Container data-testid="container">Content</Container>)
    expect(screen.getByTestId('container').tagName).toBe('DIV')
  })

  it('supports as prop', () => {
    // @ts-expect-error -- polymorphic `as` narrowing lost through forwardRef
    render(<Container as="main" data-testid="container">Content</Container>)
    expect(screen.getByTestId('container').tagName).toBe('MAIN')
  })

  it('applies custom className', () => {
    render(<Container className="custom" data-testid="container">Content</Container>)
    expect(screen.getByTestId('container')).toHaveClass('custom')
  })

  it('applies mx-auto for centering', () => {
    render(<Container data-testid="container">Content</Container>)
    expect(screen.getByTestId('container')).toHaveClass('mx-auto')
  })
})
