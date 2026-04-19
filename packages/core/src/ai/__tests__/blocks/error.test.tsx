import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { ErrorBlock } from '../../blocks/error'

describe('ErrorBlock', () => {
  it('renders with role="alert"', () => {
    render(
      <ErrorBlock
        data={{ title: 'Error', message: 'Something went wrong' }}
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays the title', () => {
    render(
      <ErrorBlock
        data={{ title: 'Save failed', message: 'Could not save changes' }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Save failed')
  })

  it('displays the message', () => {
    render(
      <ErrorBlock
        data={{ title: 'Error', message: 'Network timeout occurred' }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Network timeout occurred',
    )
  })

  it('renders suggestion when provided', () => {
    render(
      <ErrorBlock
        data={{
          title: 'Error',
          message: 'Failed to load',
          suggestion: 'Try refreshing the page',
        }}
      />,
    )
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument()
  })

  it('does not render suggestion when absent', () => {
    render(
      <ErrorBlock
        data={{ title: 'Error', message: 'Something broke' }}
      />,
    )
    expect(screen.queryByText('Try refreshing the page')).not.toBeInTheDocument()
  })

  it('applies low-confidence border styling', () => {
    const { container } = render(
      <ErrorBlock
        data={{ title: 'Error', message: 'Maybe wrong' }}
        confidence="low"
      />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border-l-2')
    expect(wrapper.className).toContain('border-warning-7')
  })

  it('renders error-colored alert', () => {
    const { container } = render(
      <ErrorBlock
        data={{ title: 'Error', message: 'Bad request' }}
      />,
    )
    const alert = container.querySelector('[role="alert"]') as HTMLElement
    expect(alert.className).toContain('bg-error-3')
  })
})
