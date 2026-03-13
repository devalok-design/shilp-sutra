import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ConversationTab } from '../conversation-tab'
import type { Comment } from '../conversation-tab'

// Mock RichTextEditor/Viewer to avoid tiptap in tests
vi.mock('@/composed/rich-text-editor', () => ({
  RichTextEditor: ({ placeholder }: { placeholder: string }) => (
    <textarea data-testid="rich-editor" placeholder={placeholder} />
  ),
  RichTextViewer: ({ content }: { content: string }) => (
    <div data-testid="rich-viewer">{content}</div>
  ),
}))

const mockComment: Comment = {
  id: 'c1',
  taskId: 't1',
  authorType: 'INTERNAL',
  authorId: 'u1',
  content: 'Looks good!',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  internalAuthor: { id: 'u1', name: 'Alice', image: null },
}

describe('ConversationTab', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ConversationTab
        comments={[mockComment]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ConversationTab
        comments={[mockComment]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders author name', () => {
    render(
      <ConversationTab
        comments={[mockComment]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders comment content', () => {
    render(
      <ConversationTab
        comments={[mockComment]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(screen.getByText('Looks good!')).toBeInTheDocument()
  })

  it('renders empty state when no comments', () => {
    render(
      <ConversationTab
        comments={[]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(screen.getByText('No comments yet')).toBeInTheDocument()
  })

  it('renders client visibility warning for EVERYONE tasks', () => {
    render(
      <ConversationTab
        comments={[]}
        taskVisibility="EVERYONE"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(
      screen.getByText(/This task is visible to clients/),
    ).toBeInTheDocument()
  })

  it('renders Comment button', () => {
    render(
      <ConversationTab
        comments={[]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(screen.getByText('Comment')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <ConversationTab
        ref={ref}
        className="custom"
        comments={[]}
        taskVisibility="INTERNAL"
        onPostComment={vi.fn()}
        richText={false}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
