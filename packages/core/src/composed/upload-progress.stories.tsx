import type { Meta, StoryObj } from '@storybook/react'
import { UploadProgress, type UploadFile } from './upload-progress'

const meta: Meta<typeof UploadProgress> = {
  title: 'Composed/UploadProgress',
  component: UploadProgress,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof UploadProgress>

/* ---------------------------------------------------------------------------
 * Sample data
 * ------------------------------------------------------------------------ */

const mixedFiles: UploadFile[] = [
  {
    id: '1',
    name: 'requirements.pdf',
    size: 2_450_000,
    status: 'pending',
  },
  {
    id: '2',
    name: 'design-mockup.fig',
    size: 8_300_000,
    progress: 45,
    status: 'uploading',
  },
  {
    id: '3',
    name: 'analytics-export.csv',
    size: 1_200_000,
    status: 'processing',
  },
  {
    id: '4',
    name: 'meeting-notes.docx',
    size: 340_000,
    progress: 100,
    status: 'complete',
  },
]

const errorFiles: UploadFile[] = [
  {
    id: '1',
    name: 'budget-report.xlsx',
    size: 5_600_000,
    progress: 100,
    status: 'complete',
  },
  {
    id: '2',
    name: 'presentation.pptx',
    size: 12_400_000,
    progress: 67,
    status: 'error',
    error: 'Network timeout — please retry',
  },
  {
    id: '3',
    name: 'contracts.zip',
    size: 45_000_000,
    progress: 12,
    status: 'error',
    error: 'File exceeds 25 MB limit',
  },
  {
    id: '4',
    name: 'invoice.pdf',
    size: 890_000,
    progress: 100,
    status: 'complete',
  },
]

const allComplete: UploadFile[] = [
  {
    id: '1',
    name: 'sprint-retro.md',
    size: 24_000,
    progress: 100,
    status: 'complete',
  },
  {
    id: '2',
    name: 'api-spec.yaml',
    size: 180_000,
    progress: 100,
    status: 'complete',
  },
  {
    id: '3',
    name: 'test-results.json',
    size: 56_000,
    progress: 100,
    status: 'complete',
  },
]

const imageFiles: UploadFile[] = [
  {
    id: '1',
    name: 'hero-banner.png',
    size: 3_200_000,
    progress: 78,
    status: 'uploading',
    previewUrl: 'https://picsum.photos/seed/hero/80/80',
  },
  {
    id: '2',
    name: 'team-photo.jpg',
    size: 1_800_000,
    progress: 100,
    status: 'complete',
    previewUrl: 'https://picsum.photos/seed/team/80/80',
  },
  {
    id: '3',
    name: 'logo.svg',
    size: 12_000,
    status: 'processing',
  },
  {
    id: '4',
    name: 'screenshot.webp',
    size: 950_000,
    status: 'pending',
  },
]

/* ---------------------------------------------------------------------------
 * Stories
 * ------------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    files: mixedFiles,
    onRemove: (id) => console.log('Remove:', id),
    onRetry: (id) => console.log('Retry:', id),
  },
}

export const WithErrors: Story = {
  args: {
    files: errorFiles,
    onRemove: (id) => console.log('Remove:', id),
    onRetry: (id) => console.log('Retry:', id),
  },
}

export const Compact: Story = {
  args: {
    files: mixedFiles,
    variant: 'compact',
    onRemove: (id) => console.log('Remove:', id),
    onRetry: (id) => console.log('Retry:', id),
  },
}

export const SingleFile: Story = {
  args: {
    files: [
      {
        id: '1',
        name: 'quarterly-report.pdf',
        size: 4_200_000,
        progress: 62,
        status: 'uploading',
      },
    ],
    onRemove: (id) => console.log('Remove:', id),
  },
}

export const AllComplete: Story = {
  args: {
    files: allComplete,
    onRemove: (id) => console.log('Remove:', id),
  },
}

export const ImageUploads: Story = {
  args: {
    files: imageFiles,
    onRemove: (id) => console.log('Remove:', id),
    onRetry: (id) => console.log('Retry:', id),
  },
}
