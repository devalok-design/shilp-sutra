import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorDisplay } from '../error-boundary'

describe('ErrorDisplay', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders the default error title when given a generic error', () => {
    const { getByText } = render(
      <ErrorDisplay error={new Error('Something broke')} />,
    )
    expect(getByText('Something went wrong')).toBeTruthy()
  })

  it('displays the error message from an Error instance', () => {
    const { getByText } = render(
      <ErrorDisplay error={new Error('Connection lost')} />,
    )
    expect(getByText('Connection lost')).toBeTruthy()
  })

  it('displays the error message from a string error', () => {
    const { getByText } = render(
      <ErrorDisplay error="Network timeout" />,
    )
    expect(getByText('Network timeout')).toBeTruthy()
  })

  it('displays the error message from an object with data.message', () => {
    const { getByText } = render(
      <ErrorDisplay error={{ data: { message: 'Rate limited' } }} />,
    )
    expect(getByText('Rate limited')).toBeTruthy()
  })

  it('shows 404 title for status 404', () => {
    const { getByText } = render(
      <ErrorDisplay error={{ status: 404 }} />,
    )
    expect(getByText('Page not found')).toBeTruthy()
    expect(getByText('Error 404')).toBeTruthy()
  })

  it('shows 403 title for status 403', () => {
    const { getByText } = render(
      <ErrorDisplay error={{ status: 403 }} />,
    )
    expect(getByText('Access denied')).toBeTruthy()
    expect(getByText('Error 403')).toBeTruthy()
  })

  it('shows 500 title for status 500', () => {
    const { getByText } = render(
      <ErrorDisplay error={{ status: 500 }} />,
    )
    expect(getByText('Server error')).toBeTruthy()
    expect(getByText('Error 500')).toBeTruthy()
  })

  it('renders Try Again button when onReset is provided', () => {
    const { getByText } = render(
      <ErrorDisplay error={new Error('fail')} onReset={() => {}} />,
    )
    expect(getByText('Try Again')).toBeTruthy()
  })

  it('does not render Try Again button when onReset is not provided', () => {
    const { queryByText } = render(
      <ErrorDisplay error={new Error('fail')} />,
    )
    expect(queryByText('Try Again')).toBeNull()
  })

  it('calls onReset when Try Again button is clicked', () => {
    const onReset = vi.fn()
    const { getByText } = render(
      <ErrorDisplay error={new Error('fail')} onReset={onReset} />,
    )
    fireEvent.click(getByText('Try Again'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('shows stack trace in development mode', () => {
    // Set NODE_ENV to development
    const origProcess = globalThis.process
    globalThis.process = { ...origProcess, env: { ...origProcess.env, NODE_ENV: 'development' } } as typeof process

    const error = new Error('Dev error')
    error.stack = 'Error: Dev error\n    at Test.tsx:10'
    const { getByText } = render(
      <ErrorDisplay error={error} />,
    )
    expect(getByText('Stack Trace (development only)')).toBeTruthy()

    globalThis.process = origProcess
  })

  it('does not show stack trace in production mode', () => {
    const origProcess = globalThis.process
    globalThis.process = { ...origProcess, env: { ...origProcess.env, NODE_ENV: 'production' } } as typeof process

    const error = new Error('Prod error')
    error.stack = 'Error: Prod error\n    at Test.tsx:10'
    const { queryByText } = render(
      <ErrorDisplay error={error} />,
    )
    expect(queryByText('Stack Trace (development only)')).toBeNull()

    globalThis.process = origProcess
  })

  it('forwards ref to the outer div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<ErrorDisplay ref={ref} error={new Error('test')} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
