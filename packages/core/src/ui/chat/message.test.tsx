import { IconEdit, IconMoodSmile,IconTrash } from '@tabler/icons-react'
import { fireEvent,render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Message } from './message'

describe('Message', () => {
  // ── Root / flat variant ──────────────────────────────────────────────
  it('flat variant renders flex row with children', () => {
    const { container } = render(
      <Message>
        <Message.Avatar fallback="JD" />
        <Message.Content>
          <Message.Body>Hello world</Message.Body>
        </Message.Content>
      </Message>,
    )
    // The root motion.div should have flex + gap-ds-04 classes
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('flex')
    expect(root).toHaveClass('gap-ds-04')
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  // ── Bubble variant ───────────────────────────────────────────────────
  it('bubble variant with placement="end" has justify-end', () => {
    const { container } = render(
      <Message variant="bubble" placement="end">
        <Message.Body>Bubble text</Message.Body>
      </Message>,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('justify-end')
    expect(screen.getByText('Bubble text')).toBeInTheDocument()
  })

  it('bubble variant with placement="start" has justify-start', () => {
    const { container } = render(
      <Message variant="bubble" placement="start">
        <Message.Body>Start text</Message.Body>
      </Message>,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('justify-start')
  })

  // ── grouped ──────────────────────────────────────────────────────────
  it('grouped=true: Avatar renders spacer div', () => {
    const { container } = render(
      <Message grouped>
        <Message.Avatar fallback="JD" />
        <Message.Content>
          <Message.Body>Grouped msg</Message.Body>
        </Message.Content>
      </Message>,
    )
    // Avatar should be an invisible spacer (w-6 for md, no img)
    const spacer = container.querySelector('.w-6.shrink-0') as HTMLElement
    expect(spacer).toBeInTheDocument()
    // It should not contain an img element
    expect(spacer?.querySelector('img')).toBeNull()
  })

  it('grouped=true: Author renders nothing', () => {
    render(
      <Message grouped>
        <Message.Avatar fallback="JD" />
        <Message.Content>
          <Message.Author name="John" />
          <Message.Body>Grouped msg</Message.Body>
        </Message.Content>
      </Message>,
    )
    expect(screen.queryByText('John')).not.toBeInTheDocument()
  })

  // ── deleted ──────────────────────────────────────────────────────────
  it('deleted=true renders "This message was deleted" with trash icon', () => {
    const { container } = render(<Message deleted />)
    const deletedText = screen.getByText('This message was deleted')
    expect(deletedText).toBeInTheDocument()
    // The deleted placeholder should contain a trash icon SVG
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('deleted=true uses custom deletedText', () => {
    render(<Message deleted deletedText="Removed by admin" />)
    expect(screen.getByText('Removed by admin')).toBeInTheDocument()
  })

  // ── highlight ────────────────────────────────────────────────────────
  it('highlight="mention" exposes a data hook but no rail/tint on the row', () => {
    const { container } = render(
      <Message highlight="mention">
        <Message.Body>@you</Message.Body>
      </Message>,
    )
    const root = container.firstChild as HTMLElement
    // Mention is carried by the in-content @token, not a row rail/tint (AI tell removed).
    expect(root).toHaveAttribute('data-highlight', 'mention')
    expect(root).not.toHaveClass('border-l-accent-9')
    expect(root).not.toHaveClass('bg-accent-2')
  })

  it('styles in-content @mention tokens in the rendered message (see #99)', () => {
    // The `.mention` token styling must be present in the read-only Message —
    // it previously lived only on the editor, so mentions rendered flat.
    const { container } = render(
      <Message>
        <Message.Body>
          Hey <span className="mention">@you</span>
        </Message.Body>
      </Message>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('[&_.mention]:bg-accent-2')
    expect(root.className).toContain('[&_.mention]:text-accent-11')
    expect(container.querySelector('.mention')).not.toBeNull()
  })

  it('highlight="internal" has warning bg class', () => {
    const { container } = render(
      <Message highlight="internal">
        <Message.Body>Internal note</Message.Body>
      </Message>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('bg-warning-2/50')
  })

  // ── Author ───────────────────────────────────────────────────────────
  it('Author renders name and formatted timestamp', () => {
    render(
      <Message>
        <Message.Content>
          <Message.Author
            name="Alice"
            formattedTimestamp="2:30 PM"
          />
        </Message.Content>
      </Message>,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('2:30 PM')).toBeInTheDocument()
  })

  it('Author renders badge', () => {
    render(
      <Message>
        <Message.Content>
          <Message.Author
            name="Bob"
            badge={<span data-testid="badge">Admin</span>}
          />
        </Message.Content>
      </Message>,
    )
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  // ── EditableBody ─────────────────────────────────────────────────────
  it('EditableBody: clicking activates edit mode when canEdit', () => {
    const onSave = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.EditableBody
            content="Original text"
            onSave={onSave}
            canEdit
          />
        </Message.Content>
      </Message>,
    )
    expect(screen.getByText('Original text')).toBeInTheDocument()

    // Click to start editing
    fireEvent.click(screen.getByText('Original text'))

    // Should now show a textarea
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe('Original text')
  })

  it('EditableBody: Enter saves', () => {
    const onSave = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.EditableBody
            content="Original"
            onSave={onSave}
            canEdit
          />
        </Message.Content>
      </Message>,
    )

    fireEvent.click(screen.getByText('Original'))
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Updated' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(onSave).toHaveBeenCalledWith('Updated')
  })

  it('EditableBody: Escape cancels', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.EditableBody
            content="Original"
            onSave={onSave}
            onCancel={onCancel}
            canEdit
          />
        </Message.Content>
      </Message>,
    )

    fireEvent.click(screen.getByText('Original'))
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Changed' } })
    fireEvent.keyDown(textarea, { key: 'Escape' })

    expect(onSave).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    // Should exit edit mode and show original
    expect(screen.getByText('Original')).toBeInTheDocument()
  })

  it('EditableBody: does not enter edit mode when canEdit is false', () => {
    const onSave = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.EditableBody
            content="Read only"
            onSave={onSave}
          />
        </Message.Content>
      </Message>,
    )
    fireEvent.click(screen.getByText('Read only'))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  // ── Reactions ────────────────────────────────────────────────────────
  it('Reactions: renders emoji pills', () => {
    const onReact = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.Reactions
            reactions={[
              { emoji: '👍', count: 3, reacted: true },
              { emoji: '❤️', count: 1, reacted: false },
            ]}
            onReact={onReact}
          />
        </Message.Content>
      </Message>,
    )
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('❤️')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('Reactions: click calls onReact', () => {
    const onReact = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.Reactions
            reactions={[{ emoji: '🎉', count: 2, reacted: false }]}
            onReact={onReact}
          />
        </Message.Content>
      </Message>,
    )
    fireEvent.click(screen.getByText('🎉').closest('button')!)
    expect(onReact).toHaveBeenCalledWith('🎉')
  })

  it('Reactions: reacted pill has accent ring class', () => {
    const onReact = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.Reactions
            reactions={[{ emoji: '👍', count: 1, reacted: true }]}
            onReact={onReact}
          />
        </Message.Content>
      </Message>,
    )
    const btn = screen.getByText('👍').closest('button')!
    expect(btn).toHaveClass('ring-accent-6')
    // step 4: an unreacted chip is surface-panel-hover, which sits above
    // accent-3 in dark — the reacted chip was the dimmest thing in the row.
    expect(btn).toHaveClass('bg-accent-4')
  })

  // ── Actions ──────────────────────────────────────────────────────────
  it('Actions: has opacity-0 class', () => {
    const { container } = render(
      <Message>
        <Message.Content>
          <Message.Body>Test</Message.Body>
          <Message.Actions>
            <Message.Action
              icon={IconEdit}
              label="Edit"
              onClick={vi.fn()}
            />
          </Message.Actions>
        </Message.Content>
      </Message>,
    )
    // The actions toolbar should have opacity-0
    const toolbar = container.querySelector('.opacity-0') as HTMLElement
    expect(toolbar).toBeInTheDocument()
    expect(toolbar).toHaveClass('group-hover/message:opacity-100')
  })

  // ── Action ───────────────────────────────────────────────────────────
  it('Action with variant="danger" has error color class', () => {
    render(
      <Message>
        <Message.Content>
          <Message.Actions>
            <Message.Action
              icon={IconTrash}
              label="Delete"
              onClick={vi.fn()}
              variant="danger"
            />
          </Message.Actions>
        </Message.Content>
      </Message>,
    )
    const btn = screen.getByLabelText('Delete')
    expect(btn).toHaveClass('hover:text-error-11')
  })

  it('Action with default variant has subtle color class', () => {
    render(
      <Message>
        <Message.Content>
          <Message.Actions>
            <Message.Action
              icon={IconEdit}
              label="Edit"
              onClick={vi.fn()}
            />
          </Message.Actions>
        </Message.Content>
      </Message>,
    )
    const btn = screen.getByLabelText('Edit')
    expect(btn).toHaveClass('text-surface-fg-subtle')
    expect(btn).toHaveClass('hover:text-surface-fg')
  })

  it('Action calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <Message>
        <Message.Content>
          <Message.Actions>
            <Message.Action
              icon={IconEdit}
              label="Edit"
              onClick={onClick}
            />
          </Message.Actions>
        </Message.Content>
      </Message>,
    )
    fireEvent.click(screen.getByLabelText('Edit'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  // ── Avatar sizes ─────────────────────────────────────────────────────
  it('Avatar size="sm" renders w-5 spacer when grouped', () => {
    const { container } = render(
      <Message grouped>
        <Message.Avatar size="sm" fallback="X" />
        <Message.Content>
          <Message.Body>Small avatar grouped</Message.Body>
        </Message.Content>
      </Message>,
    )
    const spacer = container.querySelector('.w-5.shrink-0') as HTMLElement
    expect(spacer).toBeInTheDocument()
  })
})
