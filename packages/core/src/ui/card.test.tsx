import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Card, CardContent, CardFooter,CardHeader } from './card'

describeConformance('Card', (props) => <Card {...props}>Content</Card>, {
  variants: ['default', 'elevated', 'outline', 'flat'],
  sizes: ['sm', 'md', 'lg'],
  colors: ['default', 'accent', 'error', 'success', 'warning', 'info', 'neutral'],
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders accent element when accent prop is set', () => {
    const { container } = render(<Card accent="left" accentColor="error">Content</Card>)
    const accentEl = container.querySelector('[aria-hidden="true"]')
    expect(accentEl).toBeInTheDocument()
    expect(accentEl).toHaveStyle({ '--card-accent-bg': 'var(--color-error-9)' })
  })

  it('does not render accent when prop is not set', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('adds overflow-hidden when accent is set', () => {
    const { container } = render(<Card accent="top">Content</Card>)
    expect(container.firstChild).toHaveClass('overflow-hidden')
  })

  it('defaults accentColor to default', () => {
    const { container } = render(<Card accent="left">Content</Card>)
    const accentEl = container.querySelector('[aria-hidden="true"]')
    expect(accentEl).toHaveStyle({ '--card-accent-bg': 'var(--color-accent-9)' })
  })

  it('supports all accent positions', () => {
    const positions = ['left', 'top', 'right', 'bottom'] as const
    positions.forEach(pos => {
      const { container, unmount } = render(<Card accent={pos}>Content</Card>)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
      unmount()
    })
  })

  it('supports all accent colors', () => {
    const colors = ['default', 'secondary', 'error', 'success', 'warning', 'info'] as const
    colors.forEach(color => {
      const { container, unmount } = render(<Card accent="left" accentColor={color}>Content</Card>)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
      unmount()
    })
  })

  describe('color', () => {
    it('defaults to no color border class', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild).not.toHaveClass('border-accent-7')
      expect(container.firstChild).not.toHaveClass('border-error-7')
    })

    it('applies accent border color', () => {
      const { container } = render(<Card color="accent">Content</Card>)
      expect(container.firstChild).toHaveClass('border-accent-7')
    })

    it('applies error border color', () => {
      const { container } = render(<Card color="error">Content</Card>)
      expect(container.firstChild).toHaveClass('border-error-7')
    })

    it('applies success border color', () => {
      const { container } = render(<Card color="success">Content</Card>)
      expect(container.firstChild).toHaveClass('border-success-7')
    })

    it('applies warning border color', () => {
      const { container } = render(<Card color="warning">Content</Card>)
      expect(container.firstChild).toHaveClass('border-warning-7')
    })

    it('applies info border color', () => {
      const { container } = render(<Card color="info">Content</Card>)
      expect(container.firstChild).toHaveClass('border-info-7')
    })

    it('neutral applies no extra border class', () => {
      const { container } = render(<Card color="neutral">Content</Card>)
      expect(container.firstChild).not.toHaveClass('border-accent-7')
      expect(container.firstChild).not.toHaveClass('border-error-7')
    })
  })

  describe('size', () => {
    it('defaults to md padding on sub-components', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      const header = screen.getByText('Header').closest('div')!
      const content = screen.getByText('Body').closest('div')!
      const footer = screen.getByText('Footer').closest('div')!
      expect(header).toHaveClass('p-ds-06')
      expect(content).toHaveClass('p-ds-06')
      expect(footer).toHaveClass('p-ds-06')
    })

    it('applies sm padding to sub-components', () => {
      render(
        <Card size="sm">
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      const header = screen.getByText('Header').closest('div')!
      const content = screen.getByText('Body').closest('div')!
      const footer = screen.getByText('Footer').closest('div')!
      expect(header).toHaveClass('p-ds-05')
      expect(content).toHaveClass('p-ds-05')
      expect(footer).toHaveClass('p-ds-05')
    })

    it('applies lg padding to sub-components', () => {
      render(
        <Card size="lg">
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      const header = screen.getByText('Header').closest('div')!
      const content = screen.getByText('Body').closest('div')!
      const footer = screen.getByText('Footer').closest('div')!
      expect(header).toHaveClass('p-ds-07')
      expect(content).toHaveClass('p-ds-07')
      expect(footer).toHaveClass('p-ds-07')
    })
  })
})
