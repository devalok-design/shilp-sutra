import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Link } from './link'

describe('Link', () => {
  it('renders as <a> by default', () => {
    render(<Link href="/about">About</Link>)
    const el = screen.getByRole('link', { name: 'About' })
    expect(el.tagName).toBe('A')
  })

  it('passes href through', () => {
    render(<Link href="https://example.com">Example</Link>)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })

  it('renders as Slot with asChild', () => {
    render(
      <Link asChild>
        <button type="button">Click</button>
      </Link>,
    )
    // Slot merges Link's props onto the child — the child is a <button>
    const btn = screen.getByRole('button', { name: 'Click' })
    expect(btn.tagName).toBe('BUTTON')
    // Link's styling classes should be merged onto the child
    expect(btn.className).toContain('text-accent-11')
  })

  it('inline (default) renders with display: inline', () => {
    render(<Link href="/a">Inline</Link>)
    const el = screen.getByRole('link')
    expect(el.className).toContain('inline')
    expect(el.className).not.toContain('block')
  })

  it('inline={false} renders with display: block', () => {
    render(<Link href="/a" inline={false}>Block</Link>)
    const el = screen.getByRole('link')
    expect(el.className).toContain('block')
  })

  it('focus ring has ring-offset-2', () => {
    render(<Link href="/a">Focus</Link>)
    const el = screen.getByRole('link')
    expect(el.className).toContain('ring-offset-2')
  })

  it('merges custom className', () => {
    render(<Link href="/a" className="custom-link">Styled</Link>)
    const el = screen.getByRole('link')
    expect(el).toHaveClass('custom-link')
    // Should still have base classes
    expect(el.className).toContain('text-accent-11')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLAnchorElement | null }
    render(<Link ref={ref as React.Ref<HTMLAnchorElement>} href="/a">Ref</Link>)
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('passes through additional HTML attributes', () => {
    render(<Link href="/a" target="_blank" rel="noopener noreferrer">External</Link>)
    const el = screen.getByRole('link')
    expect(el).toHaveAttribute('target', '_blank')
    expect(el).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Link href="/about">About us</Link>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
