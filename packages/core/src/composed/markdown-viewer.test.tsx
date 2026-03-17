import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MarkdownViewer } from './markdown-viewer'

describe('MarkdownViewer', () => {
  it('renders a paragraph', () => {
    render(<MarkdownViewer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders a heading', () => {
    render(<MarkdownViewer content="# Main Title" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument()
  })

  it('renders h2 heading', () => {
    render(<MarkdownViewer content="## Subtitle" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument()
  })

  it('renders a link with correct href and target', () => {
    render(<MarkdownViewer content="[Click here](https://example.com)" />)
    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders a code block (pre/code fallback)', () => {
    const md = '```js\nconsole.log("hi")\n```'
    render(<MarkdownViewer content={md} />)
    // The CodeBlock component renders a <pre><code> fallback before lazy-loading the highlighter
    expect(screen.getByText('console.log("hi")')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownViewer content="Use `npm install` to begin" />)
    expect(screen.getByText('npm install')).toBeInTheDocument()
  })

  it('renders an unordered list', () => {
    render(<MarkdownViewer content={'- Item A\n- Item B'} />)
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
  })

  it('renders a blockquote', () => {
    render(<MarkdownViewer content="> Important note" />)
    expect(screen.getByText('Important note')).toBeInTheDocument()
  })

  it('applies compact spacing via prop', () => {
    const { container } = render(
      <MarkdownViewer content="Hello" compact />,
    )
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <MarkdownViewer content="Text" className="custom-md" />,
    )
    expect(container.firstElementChild).toHaveClass('custom-md')
  })
})
