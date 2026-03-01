import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
  isWithinInterval,
} from 'date-fns'

// ============================================================
// Pure date-range utility functions
// Extracted from edit-break.tsx for reusability and testability.
// ============================================================

/**
 * Check whether `dateStr` falls within [startStr, endStr] (inclusive).
 */
export function isDateInRange(
  dateStr: string,
  startStr: string,
  endStr: string,
): boolean {
  const date = parseISO(dateStr)
  const start = parseISO(startStr)
  const end = parseISO(endStr)
  return isWithinInterval(date, { start, end })
}

/**
 * True when the first date is the same day as or before the second date.
 */
export function isDateSameOrBefore(
  dateStr1: string,
  dateStr2: string,
): boolean {
  const d1 = parseISO(dateStr1)
  const d2 = parseISO(dateStr2)
  return isBefore(d1, d2) || isEqual(d1, d2)
}

/**
 * True when the first date is the same day as or after the second date.
 */
export function isDateSameOrAfter(
  dateStr1: string,
  dateStr2: string,
): boolean {
  const d1 = parseISO(dateStr1)
  const d2 = parseISO(dateStr2)
  return isAfter(d1, d2) || isEqual(d1, d2)
}

/**
 * True when the first date is strictly after the second date.
 */
export function isDateAfter(dateStr1: string, dateStr2: string): boolean {
  return isAfter(parseISO(dateStr1), parseISO(dateStr2))
}

/**
 * Check whether a new date range overlaps with any existing range,
 * excluding the range identified by `excludeId`.
 */
export function checkDateOverlap(
  newStartDate: string,
  newEndDate: string,
  existingRanges: Array<{ id: string; startDate: string; endDate: string }>,
  excludeId: string,
): boolean {
  return existingRanges.some((range) => {
    const brStart = format(new Date(range.startDate), 'yyyy-MM-dd')
    const brEnd = format(new Date(range.endDate), 'yyyy-MM-dd')

    const startOverlap = isDateInRange(newStartDate, brStart, brEnd)
    const endOverlap = isDateInRange(newEndDate, brStart, brEnd)
    const enclosingOverlap =
      isDateSameOrBefore(newStartDate, brStart) &&
      isDateSameOrAfter(newEndDate, brEnd)

    return (
      range.id !== excludeId && (startOverlap || endOverlap || enclosingOverlap)
    )
  })
}

/**
 * Check whether a specific date falls inside any existing break range,
 * excluding the range identified by `excludeId`.
 */
export function isBreakDay(
  dateStr: string,
  existingRanges: Array<{ id: string; startDate: string; endDate: string }>,
  excludeId: string,
): boolean {
  return existingRanges.some((range) => {
    const brStart = format(new Date(range.startDate), 'yyyy-MM-dd')
    const brEnd = format(new Date(range.endDate), 'yyyy-MM-dd')
    return range.id !== excludeId && isDateInRange(dateStr, brStart, brEnd)
  })
}
