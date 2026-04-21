import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Link } from './link'

describeConformance('Link', (props) => <Link href="/a" {...props}>About</Link>)

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
    const btn = screen.getByRole('button', { name: 'Click' })
    expect(btn.tagName).toBe('BUTTON')
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
})
