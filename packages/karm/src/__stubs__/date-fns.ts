/**
 * Vite-level stub for date-fns.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * date-fns barrel (~600 modules). Only exports used in karm are stubbed.
 */

export function format(date: Date | number, formatStr: string): string {
  const d = new Date(date)
  // Extract quoted literals first, replace with placeholders
  const literals: string[] = []
  let fmt = formatStr.replace(/'([^']*)'/g, (_m, lit) => {
    literals.push(lit)
    return `\x00${literals.length - 1}\x00`
  })

  // Timezone offset: ±HH:MM
  const tzOffset = d.getTimezoneOffset()
  const tzSign = tzOffset <= 0 ? '+' : '-'
  const tzH = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0')
  const tzM = String(Math.abs(tzOffset) % 60).padStart(2, '0')

  // Replace tokens (longest first to avoid partial matches)
  fmt = fmt
    .replace('yyyy', String(d.getFullYear()))
    .replace('yy', String(d.getFullYear()).slice(-2))
    .replace('MMMM', d.toLocaleString('en', { month: 'long' }))
    .replace('MMM', d.toLocaleString('en', { month: 'short' }))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('dd', String(d.getDate()).padStart(2, '0'))
    .replace(/\bd\b/, String(d.getDate()))
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'))
    .replace('ss', String(d.getSeconds()).padStart(2, '0'))
    .replace('xxx', `${tzSign}${tzH}:${tzM}`)
    .replace('xx', `${tzSign}${tzH}${tzM}`)
    .replace('x', `${tzSign}${tzH}`)
    .replace('EEEE', d.toLocaleString('en', { weekday: 'long' }))
    .replace('EEE', d.toLocaleString('en', { weekday: 'short' }))

  // Restore quoted literals
  fmt = fmt.replace(/\x00(\d+)\x00/g, (_m, idx) => literals[parseInt(idx)])
  return fmt
}

export function isSameDay(a: Date | number, b: Date | number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

export function isBefore(date: Date | number, dateToCompare: Date | number): boolean {
  return new Date(date).getTime() < new Date(dateToCompare).getTime()
}

export function isAfter(date: Date | number, dateToCompare: Date | number): boolean {
  return new Date(date).getTime() > new Date(dateToCompare).getTime()
}

export function startOfDay(date: Date | number): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date | number): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date: Date | number): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfMonth(date: Date | number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

export function addDays(date: Date | number, amount: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

export function subDays(date: Date | number, amount: number): Date {
  return addDays(date, -amount)
}

export function addMonths(date: Date | number, amount: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + amount)
  return d
}

export function subMonths(date: Date | number, amount: number): Date {
  return addMonths(date, -amount)
}

export function differenceInDays(a: Date | number, b: Date | number): number {
  const ms = new Date(a).getTime() - new Date(b).getTime()
  return Math.round(ms / 86400000)
}

export function isWithinInterval(
  date: Date | number,
  interval: { start: Date | number; end: Date | number },
): boolean {
  const t = new Date(date).getTime()
  return t >= new Date(interval.start).getTime() && t <= new Date(interval.end).getTime()
}

export function eachDayOfInterval(interval: { start: Date | number; end: Date | number }): Date[] {
  const days: Date[] = []
  const current = startOfDay(interval.start)
  const end = startOfDay(interval.end)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function startOfWeek(date: Date | number, options?: { weekStartsOn?: number }): Date {
  const d = new Date(date)
  const day = d.getDay()
  const startOn = options?.weekStartsOn ?? 0
  const diff = (day - startOn + 7) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getDaysInMonth(date: Date | number): number {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function isEqual(a: Date | number, b: Date | number): boolean {
  return new Date(a).getTime() === new Date(b).getTime()
}

export function getDay(date: Date | number): number {
  return new Date(date).getDay()
}

export function parseISO(dateString: string): Date {
  return new Date(dateString)
}

export function isValid(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}
