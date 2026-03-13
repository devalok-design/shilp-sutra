import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { RichTextEditor } from '../rich-text-editor'

describe('RichTextEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(<RichTextEditor onChange={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<RichTextEditor onChange={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('merges className', () => {
    const { container } = render(<RichTextEditor onChange={vi.fn()} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
