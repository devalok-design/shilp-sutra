export interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export const DEFAULT_MARGIN: ChartMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
}

export interface DataPoint {
  [key: string]: string | number | Date
}

export interface Series {
  key: string
  label: string
  color?: string
}

export type ChartColor =
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'chart-6'
  | 'chart-7'
  | 'chart-8'
