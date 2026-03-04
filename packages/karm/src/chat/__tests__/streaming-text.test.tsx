import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { StreamingText } from '../streaming-text'

describe('StreamingText', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <StreamingText text="Hello, this is streaming content." />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders plain text content', () => {
    render(<StreamingText text="Simple text message" />)
    expect(screen.getByText('Simple text message')).toBeInTheDocument()
  })

  it('renders markdown bold text', () => {
    render(<StreamingText text="This is **bold** text" />)
    expect(screen.getByText('bold')).toBeInTheDocument()
  })

  it('renders cursor indicator', () => {
    const { container } = render(<StreamingText text="Typing..." />)
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeInTheDocument()
  })
})
