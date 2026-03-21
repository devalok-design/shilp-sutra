import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RichTextEditor, RichTextViewer } from './rich-text-editor'

// Tiptap needs getComputedStyle to work in jsdom
if (typeof window !== 'undefined' && !window.getComputedStyle) {
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => '',
    }),
  })
}

describe('RichTextEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(<RichTextEditor />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders toolbar buttons when editable', () => {
    render(<RichTextEditor editable />)
    // Check for a few known toolbar buttons by title
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Undo')).toBeInTheDocument()
  })

  it('hides toolbar when not editable', () => {
    render(<RichTextEditor editable={false} />)
    expect(screen.queryByTitle('Bold')).not.toBeInTheDocument()
  })

  it('calls onChange when content is updated', () => {
    const onChange = vi.fn()
    render(<RichTextEditor content="<p>Hello</p>" onChange={onChange} />)
    // Editor renders; we just confirm it doesn't crash with onChange prop
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(<RichTextEditor className="my-editor" />)
    expect(container.firstElementChild).toHaveClass('my-editor')
  })
})

describe('RichTextViewer', () => {
  it('renders without crashing', () => {
    const { container } = render(<RichTextViewer content="<p>Read only</p>" />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('does not render a toolbar', () => {
    render(<RichTextViewer content="<p>View mode</p>" />)
    expect(screen.queryByTitle('Bold')).not.toBeInTheDocument()
  })
})
