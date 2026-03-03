import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { ErrorDisplay } from '../error-boundary'

describe('ErrorDisplay', () => {
  it('should have no accessibility violations with a generic error', async () => {
    const { container } = render(
      <ErrorDisplay error={new Error('Something broke')} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with a 404 error', async () => {
    const { container } = render(
      <ErrorDisplay error={{ status: 404 }} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with a 403 error', async () => {
    const { container } = render(
      <ErrorDisplay error={{ status: 403 }} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with a 500 error', async () => {
    const { container } = render(
      <ErrorDisplay error={{ status: 500 }} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with onReset callback', async () => {
    const { container } = render(
      <ErrorDisplay
        error={new Error('Connection lost')}
        onReset={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with string error', async () => {
    const { container } = render(
      <ErrorDisplay error="Network timeout" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
