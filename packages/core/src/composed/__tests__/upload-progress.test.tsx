import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { UploadProgress } from '../upload-progress'
import type { UploadFile } from '../upload-progress'

const sampleFiles: UploadFile[] = [
  {
    id: '1',
    name: 'document.pdf',
    size: 1024 * 1024,
    progress: 50,
    status: 'uploading',
  },
  {
    id: '2',
    name: 'photo.jpg',
    size: 2048,
    progress: 100,
    status: 'complete',
  },
]

describe('UploadProgress', () => {
  it('renders file names', () => {
    render(<UploadProgress files={sampleFiles} />)
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<UploadProgress files={sampleFiles} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders nothing when no files', () => {
    const { container } = render(<UploadProgress files={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('merges className', () => {
    const { container } = render(<UploadProgress files={sampleFiles} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<UploadProgress files={sampleFiles} data-testid="up" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'up')
  })
})
