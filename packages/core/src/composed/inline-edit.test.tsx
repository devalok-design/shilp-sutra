import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InlineEdit } from './inline-edit'

describe('InlineEdit', () => {
  it('renders the text value', () => {
    render(<InlineEdit value="Hello world" onSave={vi.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows placeholder styling when value is empty', () => {
    render(<InlineEdit value="" onSave={vi.fn()} placeholder="Add a title..." />)
    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveClass('italic')
    expect(textbox).toHaveClass('text-surface-fg-subtle')
  })

  it('renders as contentEditable textbox', () => {
    render(<InlineEdit value="Editable" onSave={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'true')
  })

  it('is not editable when readOnly', () => {
    render(<InlineEdit value="Read only" onSave={vi.fn()} readOnly />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Read only')).toBeInTheDocument()
  })

  it('is not editable when saving', () => {
    render(<InlineEdit value="Saving" onSave={vi.fn()} saving />)
    expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false')
  })

  it('applies custom textClassName', () => {
    render(<InlineEdit value="Styled" onSave={vi.fn()} textClassName="text-ds-lg font-bold" />)
    const el = screen.getByRole('textbox')
    expect(el).toHaveClass('text-ds-lg')
    expect(el).toHaveClass('font-bold')
  })

  it('forwards className to wrapper', () => {
    render(<InlineEdit value="Wrapped" onSave={vi.fn()} className="my-wrapper" />)
    expect(screen.getByRole('textbox').parentElement).toHaveClass('my-wrapper')
  })
})
