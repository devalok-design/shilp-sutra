import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { TextBlock } from '../../blocks/text'

describe('TextBlock', () => {
  it('renders plain text content', () => {
    render(<TextBlock data={{ content: 'Hello world' }} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders bold markdown', () => {
    render(<TextBlock data={{ content: '**bold text**' }} />)
    const strong = screen.getByText('bold text')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders links with href', () => {
    render(
      <TextBlock data={{ content: '[Click here](https://example.com)' }} />,
    )
    const link = screen.getByRole('link', { name: 'Click here' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('renders inline code', () => {
    render(<TextBlock data={{ content: 'Use `npm install` to install' }} />)
    const code = screen.getByText('npm install')
    expect(code.tagName).toBe('CODE')
  })

  it('applies low-confidence wash + chip (no rail)', () => {
    render(<TextBlock data={{ content: 'Uncertain answer' }} confidence="low" />)
    const wrapper = document.querySelector('[data-confidence="low"]') as HTMLElement
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.className).toContain('bg-warning-2')
    expect(wrapper.className).not.toContain('border-l-2')
    expect(screen.getByText('Low confidence')).toBeInTheDocument()
  })

  it('does not apply low-confidence styling for high confidence', () => {
    render(<TextBlock data={{ content: 'Sure answer' }} confidence="high" />)
    expect(document.querySelector('[data-confidence="low"]')).toBeNull()
    expect(screen.queryByText('Low confidence')).not.toBeInTheDocument()
  })
})
