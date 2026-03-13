import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, beforeAll } from 'vitest'
import { ChartContainer } from '../charts/chart-container'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

describe('ChartContainer', () => {
  const renderFn = () => <svg data-testid="inner" />

  it('renders without crashing', () => {
    const { container } = render(
      <ChartContainer>{renderFn}</ChartContainer>,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChartContainer>{renderFn}</ChartContainer>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<ChartContainer ref={ref}>{renderFn}</ChartContainer>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(
      <ChartContainer className="custom">{renderFn}</ChartContainer>,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(
      <ChartContainer data-testid="cc">{renderFn}</ChartContainer>,
    )
    expect(container.firstChild).toHaveAttribute('data-testid', 'cc')
  })
})
