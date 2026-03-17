import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { InlineEdit } from './inline-edit'

describe('InlineEdit', () => {
  it('renders the text value in idle mode', () => {
    render(<InlineEdit value="Hello world" onSave={vi.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows placeholder when value is empty', () => {
    render(<InlineEdit value="" onSave={vi.fn()} placeholder="Click to edit" />)
    expect(screen.getByText('Click to edit')).toBeInTheDocument()
  })

  it('renders the value as a button role in read mode', () => {
    render(<InlineEdit value="Editable" onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Editable' })).toBeInTheDocument()
  })

  it('switches to input on click', async () => {
    const user = userEvent.setup()
    render(<InlineEdit value="Edit me" onSave={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Edit me' }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Edit me')
  })

  it('saves on Enter key', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineEdit value="Old" onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Old' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'New{Enter}')
    expect(onSave).toHaveBeenCalledWith('New')
  })

  it('cancels on Escape key without calling onSave', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineEdit value="Original" onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Original' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Changed')
    await user.keyboard('{Escape}')
    // Should revert to read mode showing original value
    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('does not call onSave when value is unchanged', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineEdit value="Same" onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Same' }))
    await user.keyboard('{Enter}')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('does not enter edit mode when readOnly', async () => {
    const user = userEvent.setup()
    render(<InlineEdit value="Read only" onSave={vi.fn()} readOnly />)
    await user.click(screen.getByText('Read only'))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
