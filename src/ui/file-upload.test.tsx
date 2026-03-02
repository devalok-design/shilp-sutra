import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { FileUpload } from './file-upload'

const createFile = (name: string, size: number, type: string) =>
  new File(['x'.repeat(size)], name, { type })

describe('FileUpload', () => {
  it('renders default drop zone with label text', () => {
    render(<FileUpload onFiles={vi.fn()} />)
    expect(
      screen.getByText('Drop files here or click to browse'),
    ).toBeInTheDocument()
  })

  it('renders custom label and sublabel', () => {
    render(
      <FileUpload
        onFiles={vi.fn()}
        label="Upload your resume"
        sublabel="PDF only, max 5MB"
      />,
    )
    expect(screen.getByText('Upload your resume')).toBeInTheDocument()
    expect(screen.getByText('PDF only, max 5MB')).toBeInTheDocument()
  })

  it('has a hidden file input element', () => {
    render(<FileUpload onFiles={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).not.toBeVisible()
  })

  it('calls onFiles when files are selected via input', async () => {
    const onFiles = vi.fn()
    const user = userEvent.setup()
    render(<FileUpload onFiles={onFiles} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createFile('photo.png', 1024, 'image/png')

    await user.upload(input, file)

    expect(onFiles).toHaveBeenCalledWith([file])
  })

  it('validates file size — rejects oversized files and shows error', async () => {
    const onFiles = vi.fn()
    const user = userEvent.setup()
    // maxSize of 500 bytes
    render(<FileUpload onFiles={onFiles} maxSize={500} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const oversizedFile = createFile('big.pdf', 1000, 'application/pdf')

    await user.upload(input, oversizedFile)

    expect(onFiles).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('validates file type — rejects wrong types when accept is set', async () => {
    const onFiles = vi.fn()
    const user = userEvent.setup()
    render(<FileUpload onFiles={onFiles} accept="image/*" />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const wrongTypeFile = createFile('doc.pdf', 100, 'application/pdf')

    await user.upload(input, wrongTypeFile)

    expect(onFiles).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows error prop text via role="alert"', () => {
    render(<FileUpload onFiles={vi.fn()} error="Upload failed" />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Upload failed')
  })

  it('shows progress bar when uploading', () => {
    render(<FileUpload onFiles={vi.fn()} uploading progress={45} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '45')
  })

  it('renders compact mode as button without drop zone text', () => {
    render(<FileUpload onFiles={vi.fn()} compact />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(
      screen.queryByText('Drop files here or click to browse'),
    ).not.toBeInTheDocument()
  })

  it('supports multiple attribute on hidden input', () => {
    render(<FileUpload onFiles={vi.fn()} multiple />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('multiple')
  })

  it('sets accept attribute on hidden input', () => {
    render(<FileUpload onFiles={vi.fn()} accept=".pdf,.doc" />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', '.pdf,.doc')
  })

  it('renders disabled state', () => {
    render(<FileUpload onFiles={vi.fn()} disabled />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('applies drag-active styling on dragover', () => {
    const { container } = render(<FileUpload onFiles={vi.fn()} />)
    const dropZone = container.firstElementChild as HTMLElement

    fireEvent.dragEnter(dropZone, {
      dataTransfer: { types: ['Files'] },
    })

    // The component should add a visual indicator class on drag-active
    expect(dropZone.getAttribute('data-drag-active')).toBe('true')
  })

  it('forwards ref (HTMLDivElement)', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <FileUpload
        ref={ref as React.Ref<HTMLDivElement>}
        onFiles={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('applies custom className', () => {
    const { container } = render(
      <FileUpload onFiles={vi.fn()} className="my-upload-class" />,
    )
    expect(container.firstElementChild).toHaveClass('my-upload-class')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <FileUpload onFiles={vi.fn()} label="Upload documents" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
