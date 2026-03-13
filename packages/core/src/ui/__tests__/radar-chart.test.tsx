import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, beforeAll } from 'vitest'
import { RadarChart } from '../charts/radar-chart'

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

const data = [
  { axis: 'Speed', val: 80 },
  { axis: 'Power', val: 60 },
  { axis: 'Range', val: 70 },
]

describe('RadarChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RadarChart
        data={data}
        axes={['Speed', 'Power', 'Range']}
        series={[{ key: 'val', label: 'Stats' }]}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadarChart
        data={data}
        axes={['Speed', 'Power', 'Range']}
        series={[{ key: 'val', label: 'Stats' }]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <RadarChart
        ref={ref}
        data={data}
        axes={['Speed', 'Power', 'Range']}
        series={[{ key: 'val', label: 'Stats' }]}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges className', () => {
    const { container } = render(
      <RadarChart
        data={data}
        axes={['Speed', 'Power', 'Range']}
        series={[{ key: 'val', label: 'Stats' }]}
        className="custom"
      />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(
      <RadarChart
        data={data}
        axes={['Speed', 'Power', 'Range']}
        series={[{ key: 'val', label: 'Stats' }]}
        data-testid="rc"
      />,
    )
    expect(container.firstChild).toHaveAttribute('data-testid', 'rc')
  })
})
