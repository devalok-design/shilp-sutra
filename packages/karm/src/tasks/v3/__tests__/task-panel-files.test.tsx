import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask, TaskFile, UploadingFile } from '../task-panel-types'
import { TaskPanelFiles } from '../task-panel-files'

// ---------------------------------------------------------------------------
// Mock TaskPanelFilePreview — it uses Dialog + FilePreview which are heavy
// ---------------------------------------------------------------------------

vi.mock('../task-panel-file-preview', () => ({
  TaskPanelFilePreview: () => null,
}))

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockFiles: TaskFile[] = [
  {
    id: 'f1',
    name: 'mockup.png',
    fileUrl: 'https://example.com/mockup.png',
    downloadUrl: '#',
    fileType: 'png',
    size: 256000,
    source: 'upload',
    uploadedBy: { id: 'u1', name: 'Test User', image: null },
    createdAt: new Date().toISOString(),
    isClientVisible: true,
  },
  {
    id: 'f2',
    name: 'brief.pdf',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'pdf',
    size: 1024000,
    source: 'upload',
    uploadedBy: { id: 'u1', name: 'Test User', image: null },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f3',
    name: 'internal.docx',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'docx',
    size: 84000,
    source: 'upload',
    uploadedBy: { id: 'u1', name: 'Test User', image: null },
    createdAt: new Date().toISOString(),
    isClientVisible: false,
  },
  {
    id: 'f4',
    name: 'design.fig',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'fig',
    size: 2400000,
    source: 'figma',
    embedUrl: 'https://figma.com/file/test',
    uploadedBy: { id: 'u2', name: 'Other User', image: null },
    createdAt: new Date().toISOString(),
    status: 'final',
  },
]

const mockTask: TaskPanelTask = {
  id: '1',
  taskId: 'KRM-847',
  title: 'Fix login bug',
  description: '',
  status: 'in-progress',
  statusOptions: [{ id: 'in-progress', name: 'In Progress' }],
  priority: 'HIGH',
  assignees: [],
  leads: [],
  members: [],
  dueDate: null,
  labels: [],
  visibility: 'INTERNAL',
  createdAt: '2026-03-21T00:00:00Z',
  updatedAt: '2026-03-21T00:00:00Z',
  subtasks: [],
  isInReview: false,
  files: mockFiles,
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderWithProvider(
  props?: Partial<Omit<TaskPanelProviderProps, 'children'>>,
) {
  return render(
    <TaskPanelProvider
      task={mockTask}
      mode="side"
      clientMode={false}
      currentUserId="user-1"
      timeline={[]}
      {...props}
    >
      <TaskPanelFiles />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelFiles', () => {
  it('renders file names', () => {
    renderWithProvider()
    expect(screen.getByText('mockup.png')).toBeInTheDocument()
    expect(screen.getByText('brief.pdf')).toBeInTheDocument()
    expect(screen.getByText('internal.docx')).toBeInTheDocument()
    expect(screen.getByText('design.fig')).toBeInTheDocument()
  })

  it('image files render thumbnail img element', () => {
    renderWithProvider()
    const img = screen.getByAltText('mockup.png')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://example.com/mockup.png')
  })

  it('staff sees upload and attach link buttons', () => {
    renderWithProvider()
    // There are two buttons matching /upload/i — the action-bar "Upload" and
    // the bottom "+ Upload files" drop target. Check at least one exists.
    const uploadButtons = screen.getAllByRole('button', { name: /upload/i })
    expect(uploadButtons.length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByRole('button', { name: /attach link/i }),
    ).toBeInTheDocument()
  })

  it('VIEW_ONLY sees no upload button', () => {
    renderWithProvider({ clientMode: 'VIEW_ONLY' })
    expect(
      screen.queryByRole('button', { name: /upload/i }),
    ).not.toBeInTheDocument()
  })

  it('COLLABORATOR sees upload button', () => {
    renderWithProvider({ clientMode: 'COLLABORATOR' })
    const uploadButtons = screen.getAllByRole('button', { name: /upload/i })
    expect(uploadButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('client mode filters out non-visible files', () => {
    renderWithProvider({ clientMode: 'VIEW_ONLY' })
    // internal.docx has isClientVisible: false — should not appear
    expect(screen.queryByText('internal.docx')).not.toBeInTheDocument()
    // mockup.png has isClientVisible: true — should appear
    expect(screen.getByText('mockup.png')).toBeInTheDocument()
  })

  it('final badge renders for final files', () => {
    renderWithProvider()
    // design.fig has status: 'final'
    expect(screen.getByText('Final')).toBeInTheDocument()
  })

  it('upload progress renders uploading file name', () => {
    const uploading: UploadingFile[] = [
      { id: 'up1', name: 'uploading-file.zip', progress: 42 },
    ]
    renderWithProvider({ uploadingFiles: uploading })
    expect(screen.getByText('uploading-file.zip')).toBeInTheDocument()
  })
})
