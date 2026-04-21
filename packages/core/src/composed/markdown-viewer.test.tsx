import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { MarkdownViewer } from './markdown-viewer'

describeConformance(
  'MarkdownViewer',
  (props) => <MarkdownViewer content="Hello" {...props} />,
)

describe('MarkdownViewer', () => {
  // ── Basic rendering ───────────────────────────────────────────────────
  it('renders markdown text as HTML paragraph', () => {
    render(<MarkdownViewer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders empty content without crashing', () => {
    const { container } = render(<MarkdownViewer content="" />)
    // Root wrapper still renders, but no child text nodes
    expect(container.firstElementChild).toBeInTheDocument()
    expect(container.firstElementChild!.textContent).toBe('')
  })

  // ── Headings ──────────────────────────────────────────────────────────
  it('renders h1 heading with correct tag', () => {
    render(<MarkdownViewer content="# Main Title" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument()
  })

  it('renders h2 heading with correct tag', () => {
    render(<MarkdownViewer content="## Subtitle" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument()
  })

  it('renders h3 heading with correct tag', () => {
    render(<MarkdownViewer content="### Section" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Section' })).toBeInTheDocument()
  })

  it('headings get slug-based ids', () => {
    render(<MarkdownViewer content="# My Title" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveAttribute('id', 'my-title')
  })

  it('headings contain anchor links', () => {
    render(<MarkdownViewer content="# Anchor Test" />)
    const heading = screen.getByRole('heading', { level: 1 })
    const anchor = heading.querySelector('a')
    expect(anchor).toBeInTheDocument()
    expect(anchor).toHaveAttribute('href', '#anchor-test')
    expect(anchor).toHaveAttribute('aria-hidden', 'true')
  })

  // ── Links ─────────────────────────────────────────────────────────────
  it('renders links with target="_blank" and rel by default', () => {
    render(<MarkdownViewer content="[Click here](https://example.com)" />)
    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('respects custom linkTarget prop', () => {
    render(
      <MarkdownViewer
        content="[Link](https://example.com)"
        linkTarget="_self"
      />,
    )
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toHaveAttribute('target', '_self')
    // rel should not be set for non-_blank targets
    expect(link).not.toHaveAttribute('rel')
  })

  // ── Code ──────────────────────────────────────────────────────────────
  it('renders fenced code block with fallback pre/code', () => {
    const md = '```js\nconsole.log("hi")\n```'
    render(<MarkdownViewer content={md} />)
    expect(screen.getByText('console.log("hi")')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownViewer content="Use `npm install` to begin" />)
    const code = screen.getByText('npm install')
    expect(code.tagName).toBe('CODE')
  })

  // ── Lists ─────────────────────────────────────────────────────────────
  it('renders an unordered list', () => {
    render(<MarkdownViewer content={'- Item A\n- Item B'} />)
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
  })

  it('renders an ordered list', () => {
    render(<MarkdownViewer content={'1. First\n2. Second'} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  // ── Blockquote ────────────────────────────────────────────────────────
  it('renders a blockquote', () => {
    render(<MarkdownViewer content="> Important note" />)
    expect(screen.getByText('Important note')).toBeInTheDocument()
  })

  // ── Compact mode ──────────────────────────────────────────────────────
  it('compact mode applies tighter heading size', () => {
    const { container } = render(
      <MarkdownViewer content="# Compact Heading" compact />,
    )
    const heading = screen.getByRole('heading', { level: 1 })
    // compact h1 gets text-ds-md instead of text-ds-lg
    expect(heading.className).toContain('text-ds-md')
    expect(heading.className).not.toContain('text-ds-lg')
    // Root should still render
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('non-compact mode applies larger heading size', () => {
    render(<MarkdownViewer content="# Large Heading" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.className).toContain('text-ds-lg')
  })

  // ── className merging ─────────────────────────────────────────────────
  it('merges custom className onto root', () => {
    const { container } = render(
      <MarkdownViewer content="Text" className="custom-md" />,
    )
    expect(container.firstElementChild).toHaveClass('custom-md')
  })

  // ── Accessibility ─────────────────────────────────────────────────────
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MarkdownViewer content="# Hello\n\nA paragraph with a [link](https://example.com).\n\n- List item" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
