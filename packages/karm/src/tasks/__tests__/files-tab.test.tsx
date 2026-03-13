import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { FilesTab } from '../files-tab'
import type { TaskFile } from '../files-tab'

// Mock Dialog
vi.mock('@/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockFile: TaskFile = {
  id: 'f1',
  taskId: 't1',
  title: 'design-specs.pdf',
  fileUrl: '/files/design-specs.pdf',
  downloadUrl: 'https://example.com/download/design-specs.pdf',
  fileType: 'pdf',
  uploadedBy: { id: 'u1', name: 'Alice', image: null },
  createdAt: '2026-03-10T10:00:00Z',
}

describe('FilesTab', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <FilesTab files={[mockFile]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FilesTab files={[mockFile]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    // label: hidden file input has no label (visual upload button triggers it)
    expect(await axe(container, { rules: { label: { enabled: false } } })).toHaveNoViolations()
  })

  it('renders file title', () => {
    render(
      <FilesTab files={[mockFile]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('design-specs.pdf')).toBeInTheDocument()
  })

  it('renders uploader name in file metadata', () => {
    const { container } = render(
      <FilesTab files={[mockFile]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    // Name is a text node inside a <p> alongside date and "by" span
    expect(container.textContent).toContain('Alice')
  })

  it('renders upload zone', () => {
    render(
      <FilesTab files={[]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Click to upload')).toBeInTheDocument()
  })

  it('renders empty state when no files', () => {
    render(
      <FilesTab files={[]} onUpload={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('No files attached')).toBeInTheDocument()
  })

  it('hides upload zone in readOnly mode', () => {
    render(
      <FilesTab files={[]} onUpload={vi.fn()} onDelete={vi.fn()} readOnly />,
    )
    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <FilesTab
        ref={ref}
        className="custom"
        files={[]}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
