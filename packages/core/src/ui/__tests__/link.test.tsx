import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Link } from '../link'

describe('Link', () => {
  it('renders as an anchor element', () => {
    render(<Link href="https://example.com">Example</Link>)
    const link = screen.getByRole('link', { name: 'Example' })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
  })

  it('accepts href attribute', () => {
    render(<Link href="/about">About</Link>)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLAnchorElement | null }
    render(<Link ref={ref as React.Ref<HTMLAnchorElement>} href="/">Home</Link>)
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('applies inline display by default', () => {
    render(<Link href="/">Inline</Link>)
    expect(screen.getByRole('link')).toHaveClass('inline')
  })

  it('applies block display when inline={false}', () => {
    render(<Link href="/" inline={false}>Block</Link>)
    expect(screen.getByRole('link')).toHaveClass('block')
  })

  it('merges custom className', () => {
    render(<Link href="/" className="my-link">Styled</Link>)
    expect(screen.getByRole('link')).toHaveClass('my-link')
  })
})
