import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { ContentCard } from './content-card'

describe('ContentCard', () => {
  it('renders children', () => {
    render(<ContentCard><p>Card content</p></ContentCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders headerTitle', () => {
    render(<ContentCard headerTitle="My Card"><p>Body</p></ContentCard>)
    expect(screen.getByText('My Card')).toBeInTheDocument()
  })

  it('renders headerActions', () => {
    render(
      <ContentCard headerActions={<button>Edit</button>}>
        <p>Body</p>
      </ContentCard>,
    )
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(
      <ContentCard footer={<span>Footer text</span>}>
        <p>Body</p>
      </ContentCard>,
    )
    expect(screen.getByText('Footer text')).toBeInTheDocument()
  })

  it('renders custom header over headerTitle', () => {
    render(
      <ContentCard
        header={<div>Custom Header</div>}
        headerTitle="Should not render"
      >
        <p>Body</p>
      </ContentCard>,
    )
    expect(screen.getByText('Custom Header')).toBeInTheDocument()
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <ContentCard className="my-card"><p>Body</p></ContentCard>,
    )
    expect(container.firstElementChild).toHaveClass('my-card')
  })
})
