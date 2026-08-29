import { describe, expect, it } from 'vitest'

import { getPinnedCellStyle } from '../data-table-context'

/**
 * `getPinnedCellStyle` had three defects with one root cause: it knew a
 * column's identity but nothing about its geometry.
 *
 * Stubs stand in for a TanStack column — the helper only needs `getStart` and
 * `getAfter`, and using the real table here would test TanStack rather than us.
 */
const col = (start: number, after: number) => ({
  getStart: () => start,
  getAfter: () => after,
})

describe('getPinnedCellStyle', () => {
  describe('offsets are cumulative', () => {
    // The bug: `leftIndex` was computed and then discarded, and every pinned
    // column returned `left: 0`. Two left-pinned columns stacked on top of
    // each other, which reads as one column with the wrong contents.
    it('gives each left-pinned column its own offset', () => {
      const pinning = { left: ['a', 'b'], right: [] }
      const a = getPinnedCellStyle('a', pinning, col(0, 0))
      const b = getPinnedCellStyle('b', pinning, col(120, 0))

      expect(a.style.left).toBe(0)
      expect(b.style.left).toBe(120)
      expect(a.style.left).not.toBe(b.style.left)
    })

    it('gives each right-pinned column its own offset', () => {
      const pinning = { left: [], right: ['y', 'z'] }
      const y = getPinnedCellStyle('y', pinning, col(0, 80))
      const z = getPinnedCellStyle('z', pinning, col(0, 0))

      expect(y.style.right).toBe(80)
      expect(z.style.right).toBe(0)
    })

    // The `column` argument is optional so the signature stayed compatible,
    // but omitting it is exactly the old broken behaviour. Pinning that down
    // means a caller that forgets it fails here rather than in someone's UI.
    it('collapses to a single edge when the column is not passed', () => {
      const pinning = { left: ['a', 'b'], right: [] }
      expect(getPinnedCellStyle('a', pinning).style.left).toBe(0)
      expect(getPinnedCellStyle('b', pinning).style.left).toBe(0)
    })
  })

  describe('the cell shows the row state instead of repainting it', () => {
    // The cell must stay opaque — occluding scrolled content is its whole job —
    // but `bg-surface-panel` alone meant a selected row's pinned cell stayed
    // panel-coloured and a striped row's showed a white notch.
    const pinned = getPinnedCellStyle('a', { left: ['a'], right: [] }, col(0, 0))

    it('keeps an opaque base', () => {
      expect(pinned.className).toContain('bg-surface-panel')
      expect(pinned.className).toContain('sticky')
    })

    it('follows the row into hover and selection', () => {
      expect(pinned.className).toContain('group-hover/row:bg-surface-panel-hover')
      expect(pinned.className).toContain('group-data-[state=selected]/row:bg-accent-4')
    })

    // Striping lives on the table, where the parity selector is, and reaches
    // the cell through this attribute.
    it('marks itself so the table stripe rule can reach it', () => {
      expect(pinned['data-pinned']).toBe('left')
      expect(getPinnedCellStyle('z', { left: [], right: ['z'] }, col(0, 0))['data-pinned']).toBe('right')
      expect(getPinnedCellStyle('n', { left: [], right: [] })['data-pinned']).toBeUndefined()
    })
  })

  describe('the pinned boundary has an edge', () => {
    // Unscrolled, a pinned column was indistinguishable from a normal one;
    // scrolled, content slid under it with no seam.
    it('puts the seam on the last left-pinned column only', () => {
      const pinning = { left: ['a', 'b'], right: [] }
      expect(getPinnedCellStyle('a', pinning, col(0, 0)).className).not.toContain('border-r')
      expect(getPinnedCellStyle('b', pinning, col(120, 0)).className).toContain('border-r')
    })

    it('puts the seam on the first right-pinned column only', () => {
      const pinning = { left: [], right: ['y', 'z'] }
      expect(getPinnedCellStyle('y', pinning, col(0, 80)).className).toContain('border-l')
      expect(getPinnedCellStyle('z', pinning, col(0, 0)).className).not.toContain('border-l')
    })
  })

  it('returns nothing for an unpinned column', () => {
    const r = getPinnedCellStyle('free', { left: ['a'], right: ['z'] }, col(0, 0))
    expect(r.className).toBe('')
    expect(r.style).toEqual({})
  })
})
