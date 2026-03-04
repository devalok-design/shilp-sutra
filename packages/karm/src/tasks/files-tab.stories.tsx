import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { FilesTab, type TaskFile } from './files-tab'

// ============================================================
// Mock Data
// ============================================================

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

const arjun = { id: 'user-1', name: 'Arjun Mehta', image: null }
const priya = { id: 'user-2', name: 'Priya Sharma', image: null }
const kavita = { id: 'user-3', name: 'Kavita Reddy', image: null }

const sampleFiles: TaskFile[] = [
  {
    id: 'file-1',
    taskId: 'task-1',
    title: 'wireframe-v3.pdf',
    fileUrl: 'https://example.com/files/wireframe-v3.pdf',
    downloadUrl: 'https://example.com/files/wireframe-v3.pdf?download=true',
    fileType: 'pdf',
    uploadedBy: priya,
    createdAt: daysAgo(3),
  },
  {
    id: 'file-2',
    taskId: 'task-1',
    title: 'homepage-hero-mockup.png',
    fileUrl: 'https://example.com/files/homepage-hero-mockup.png',
    downloadUrl: 'https://example.com/files/homepage-hero-mockup.png?download=true',
    fileType: 'png',
    uploadedBy: kavita,
    createdAt: daysAgo(2),
  },
  {
    id: 'file-3',
    taskId: 'task-1',
    title: 'api-integration-spec.docx',
    fileUrl: 'https://example.com/files/api-integration-spec.docx',
    downloadUrl: 'https://example.com/files/api-integration-spec.docx?download=true',
    fileType: 'docx',
    uploadedBy: arjun,
    createdAt: daysAgo(1),
  },
  {
    id: 'file-4',
    taskId: 'task-1',
    title: 'database-schema.sql',
    fileUrl: 'https://example.com/files/database-schema.sql',
    downloadUrl: 'https://example.com/files/database-schema.sql?download=true',
    fileType: 'sql',
    uploadedBy: arjun,
    createdAt: daysAgo(1),
  },
]

const mixedFileTypes: TaskFile[] = [
  {
    id: 'ft-1',
    taskId: 'task-2',
    title: 'screenshot.jpg',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'jpg',
    uploadedBy: arjun,
    createdAt: daysAgo(5),
  },
  {
    id: 'ft-2',
    taskId: 'task-2',
    title: 'report.pdf',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'pdf',
    uploadedBy: priya,
    createdAt: daysAgo(4),
  },
  {
    id: 'ft-3',
    taskId: 'task-2',
    title: 'component.tsx',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'tsx',
    uploadedBy: arjun,
    createdAt: daysAgo(3),
  },
  {
    id: 'ft-4',
    taskId: 'task-2',
    title: 'financials.xlsx',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'xlsx',
    uploadedBy: kavita,
    createdAt: daysAgo(2),
  },
  {
    id: 'ft-5',
    taskId: 'task-2',
    title: 'assets.zip',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'zip',
    uploadedBy: priya,
    createdAt: daysAgo(1),
  },
  {
    id: 'ft-6',
    taskId: 'task-2',
    title: 'favicon.svg',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'svg',
    uploadedBy: kavita,
    createdAt: daysAgo(1),
  },
  {
    id: 'ft-7',
    taskId: 'task-2',
    title: 'mystery-file.xyz',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'xyz',
    uploadedBy: arjun,
    createdAt: daysAgo(0),
  },
]

const noDownloadFile: TaskFile[] = [
  {
    id: 'nd-1',
    taskId: 'task-3',
    title: 'processing-report.csv',
    fileUrl: 'https://example.com/files/report.csv',
    fileType: 'csv',
    uploadedBy: priya,
    createdAt: daysAgo(1),
  },
]

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof FilesTab> = {
  title: 'Karm/Tasks/FilesTab',
  component: FilesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onUpload: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FilesTab>

// ============================================================
// Stories
// ============================================================

/** Default files list with upload zone and multiple file types */
export const Default: Story = {
  args: {
    files: sampleFiles,
  },
}

/** Empty state with upload zone when no files are attached */
export const Empty: Story = {
  args: {
    files: [],
  },
}

/** All file type icons: image, document, code, spreadsheet, archive, generic */
export const AllFileTypes: Story = {
  args: {
    files: mixedFileTypes,
  },
}

/** Upload in progress -- the upload button text changes to "Uploading..." */
export const Uploading: Story = {
  args: {
    files: sampleFiles.slice(0, 2),
    isUploading: true,
  },
}

/** Read-only mode hides upload zone and delete buttons (client portal view) */
export const ReadOnly: Story = {
  args: {
    files: sampleFiles,
    readOnly: true,
  },
}

/** File without a downloadUrl -- download button is hidden */
export const NoDownloadUrl: Story = {
  args: {
    files: noDownloadFile,
  },
}

/** Single file in the list */
export const SingleFile: Story = {
  args: {
    files: [sampleFiles[0]],
  },
}
