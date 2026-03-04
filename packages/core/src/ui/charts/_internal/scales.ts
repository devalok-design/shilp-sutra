import { scaleBand, scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'

export function createLinearScale(domain: [number, number], range: [number, number]) {
  return scaleLinear().domain(domain).range(range).nice()
}

export function createBandScale(domain: string[], range: [number, number], padding = 0.2) {
  return scaleBand().domain(domain).range(range).padding(padding)
}

export function createTimeScale(domain: [Date, Date], range: [number, number]) {
  return scaleTime().domain(domain).range(range).nice()
}

export function createOrdinalScale(domain: string[], colors: string[]) {
  return scaleOrdinal<string>().domain(domain).range(colors)
}
