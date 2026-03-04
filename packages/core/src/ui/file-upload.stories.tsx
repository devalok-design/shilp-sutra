import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { FileUpload } from './file-upload'

const meta: Meta<typeof FileUpload> = {
  title: 'UI/Form Controls/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="p-8 max-w-lg"><Story /></div>],
  args: {
    onFiles: (files) => console.log('Files selected:', files),
  },
}
export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dropZone = canvas.getByRole('button')
    await expect(dropZone).toBeVisible()
    await expect(canvas.getByText('Drop files here or click to browse')).toBeVisible()
    await expect(canvas.getByText('Max file size: 10.0 MB')).toBeVisible()
  },
}

export const Compact: Story = {
  args: {
    compact: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /attach files/i })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  },
}

export const WithProgress: Story = {
  args: {
    uploading: true,
    progress: 65,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const progressbar = canvas.getByRole('progressbar')
    await expect(progressbar).toBeVisible()
    await expect(progressbar).toHaveAttribute('aria-valuenow', '65')
  },
}

export const WithError: Story = {
  args: {
    error: 'File type not supported. Please upload a PDF or DOCX file.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toHaveTextContent('File type not supported')
  },
}

export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    label: 'Upload an image',
    sublabel: 'PNG, JPG, GIF up to 5 MB',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Upload an image')).toBeVisible()
    await expect(canvas.getByText('PNG, JPG, GIF up to 5 MB')).toBeVisible()
  },
}

export const MultipleFiles: Story = {
  args: {
    multiple: true,
    label: 'Drop files here or click to browse',
    sublabel: 'Select multiple files at once',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Select multiple files at once')).toBeVisible()
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dropZone = canvas.getByRole('button')
    await expect(dropZone).toHaveAttribute('aria-disabled', 'true')
  },
}

export const CustomLabels: Story = {
  args: {
    accept: '.pdf,.docx',
    maxSize: 25 * 1024 * 1024,
    label: 'Upload Statement of Work',
    sublabel: 'PDF or DOCX, up to 25 MB',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Upload Statement of Work')).toBeVisible()
    await expect(canvas.getByText('PDF or DOCX, up to 25 MB')).toBeVisible()
  },
}
