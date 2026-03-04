import type { ChartColor } from './types'

const CHART_COLORS: ChartColor[] = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'chart-6',
  'chart-7',
  'chart-8',
]

/** Get CSS variable reference for a chart color token */
export function getChartColor(color: ChartColor): string {
  return `var(--${color})`
}

/** Get an array of chart color CSS variable references, cycling if needed */
export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    getChartColor(CHART_COLORS[i % CHART_COLORS.length]),
  )
}

/** Resolve a color prop — if it's a ChartColor token name, convert to var(); otherwise pass through */
export function resolveColor(color: string | ChartColor | undefined, index: number = 0): string {
  if (!color) return getChartColor(CHART_COLORS[index % CHART_COLORS.length])
  if ((CHART_COLORS as string[]).includes(color)) return getChartColor(color as ChartColor)
  return color // pass through raw CSS color
}
