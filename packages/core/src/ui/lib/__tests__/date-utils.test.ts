import { afterEach,describe, expect, it, vi } from 'vitest'

import { formatRelativeTime } from '../date-utils'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function fakeNow(iso: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
  }

  // ── "Just now" ────────────────────────────────────────────────────────
  it('returns "Just now" for dates less than 1 minute ago', () => {
    fakeNow('2026-04-12T12:00:30Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('Just now')
  })

  it('returns "Just now" for dates 0 seconds ago', () => {
    fakeNow('2026-04-12T12:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('Just now')
  })

  // ── Minutes ───────────────────────────────────────────────────────────
  it('returns "1m ago" for 1 minute ago', () => {
    fakeNow('2026-04-12T12:01:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('1m ago')
  })

  it('returns "30m ago" for 30 minutes ago', () => {
    fakeNow('2026-04-12T12:30:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('30m ago')
  })

  it('returns "59m ago" for 59 minutes ago', () => {
    fakeNow('2026-04-12T12:59:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('59m ago')
  })

  // ── Hours ─────────────────────────────────────────────────────────────
  it('returns "1h ago" for 1 hour ago', () => {
    fakeNow('2026-04-12T13:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('1h ago')
  })

  it('returns "23h ago" for 23 hours ago', () => {
    fakeNow('2026-04-12T11:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-11T12:00:00Z'))).toBe('23h ago')
  })

  // ── Days ──────────────────────────────────────────────────────────────
  it('returns "1d ago" for 1 day ago', () => {
    fakeNow('2026-04-12T12:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-11T12:00:00Z'))).toBe('1d ago')
  })

  it('returns "6d ago" for 6 days ago', () => {
    fakeNow('2026-04-12T12:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-06T12:00:00Z'))).toBe('6d ago')
  })

  // ── Full date for 7+ days ─────────────────────────────────────────────
  it('returns formatted date for 7 days ago', () => {
    fakeNow('2026-04-12T12:00:00Z')
    const result = formatRelativeTime(new Date('2026-04-05T12:00:00Z'))
    // en-IN format: "5 Apr" or "Apr 5" depending on locale impl
    expect(result).toMatch(/Apr/)
    expect(result).toMatch(/5/)
  })

  it('returns formatted date for much older dates', () => {
    fakeNow('2026-04-12T12:00:00Z')
    const result = formatRelativeTime(new Date('2025-12-25T12:00:00Z'))
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/25/)
  })

  // ── ISO string input ──────────────────────────────────────────────────
  it('handles ISO string input', () => {
    fakeNow('2026-04-12T12:05:00Z')
    expect(formatRelativeTime('2026-04-12T12:00:00Z')).toBe('5m ago')
  })

  it('handles Date object input', () => {
    fakeNow('2026-04-12T12:05:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('5m ago')
  })

  // ── Edge cases ────────────────────────────────────────────────────────
  it('handles future dates (negative diff) as "Just now"', () => {
    fakeNow('2026-04-12T12:00:00Z')
    // Future date: diffMs is negative, diffMin is negative → < 1 → "Just now"
    expect(formatRelativeTime(new Date('2026-04-12T13:00:00Z'))).toBe('Just now')
  })

  it('handles boundary: exactly 60 minutes becomes 1h', () => {
    fakeNow('2026-04-12T13:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('1h ago')
  })

  it('handles boundary: exactly 24 hours becomes 1d', () => {
    fakeNow('2026-04-13T12:00:00Z')
    expect(formatRelativeTime(new Date('2026-04-12T12:00:00Z'))).toBe('1d ago')
  })
})
