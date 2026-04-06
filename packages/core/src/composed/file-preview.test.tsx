import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the heavy lazy-loaded deps to avoid loading react-zoom-pan-pinch and react-pdf in tests
vi.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({ children }: { children: (controls: Record<string, () => void>) => React.ReactNode }) =>
    children({ zoomIn: vi.fn(), zoomOut: vi.fn(), resetTransform: vi.fn(), centerView: vi.fn() }),
  TransformComponent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('react-pdf', () => ({
  Document: ({ children, loading }: { children: React.ReactNode; loading: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Page: ({ pageNumber }: { pageNumber: number }) => <div>Page {pageNumber}</div>,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' }, version: '0.0.0' },
}))

import * as React from 'react'
import { FilePreview } from './file-preview'

describe('FilePreview', () => {
  it('renders file name and size when provided', () => {
    render(
      <FilePreview url="test.png" fileName="photo.png" fileSize="2.4 MB" />,
    )
    expect(screen.getByText('photo.png')).toBeInTheDocument()
    expect(screen.getByText('2.4 MB')).toBeInTheDocument()
  })

  it('renders download link', () => {
    render(<FilePreview url="test.png" />)
    const link = screen.getByText('Download')
    expect(link.closest('a')).toHaveAttribute('href', 'test.png')
  })

  it('auto-detects image type from URL extension', async () => {
    const { container } = render(<FilePreview url="photo.jpg" />)
    // Wait for the lazy-loaded ImagePreview to resolve and render the <img>
    // (alt="" makes it presentational, so getByRole('img') won't find it)
    await waitFor(() => {
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'photo.jpg')
    })
  })

  it('renders with explicit type prop', () => {
    const { container } = render(
      <FilePreview url="https://example.com/file" type="video" />,
    )
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <FilePreview url="test.png" className="my-preview" />,
    )
    expect(container.firstElementChild).toHaveClass('my-preview')
  })
})
