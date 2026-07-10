// @vitest-environment node
import { describe, expect, it } from 'vitest'

// @ts-expect-error — .mjs build script, no type declarations (intentional).
import { derivePeerMap } from '../../scripts/derive-peer-map.mjs'

/**
 * Locks the source-derived optional-peer map. Each assertion pins a real
 * component→peer fact AND guards a bug found while building the deriver
 * (2026-07-10 dogfood):
 *   - CRLF `\r` blocked the vite.config external parser (dropped 4 externals)
 *   - a naive `//` stripper ate the `//` inside regex literals like `/^@tanstack\//`
 *   - `_internal/` was skipped, missing charts/_internal/axes.tsx → d3-axis
 */
describe('derivePeerMap', () => {
  const { map } = derivePeerMap() as { map: Record<string, string[]> }

  it('captures statically-imported peers (sonner via Toaster)', () => {
    expect(map['toaster']).toEqual(['sonner'])
    expect(map['toast']).toEqual(['sonner'])
  })

  it('captures a static import missed under CRLF (remark-gfm) plus the lazy react-syntax-highlighter', () => {
    // If the CRLF/comment-in-regex parser bug regresses, react-syntax-highlighter
    // (a lazy import behind an external whose config line has a trailing comment)
    // silently drops out.
    expect(map['markdown-viewer']).toEqual(
      expect.arrayContaining(['react-markdown', 'react-syntax-highlighter', 'remark-gfm']),
    )
  })

  it('captures lazy React.lazy(() => import()) peers (@emoji-mart)', () => {
    expect(map['emoji-picker']).toEqual(
      expect.arrayContaining(['@emoji-mart/data', '@emoji-mart/react']),
    )
    expect(map['rich-text-editor']).toContain('@emoji-mart/react')
  })

  it('does NOT list bundled deps as peers (@tiptap is in dist, not external)', () => {
    const rte = map['rich-text-editor'] ?? []
    expect(rte.some((p) => p.startsWith('@tiptap/'))).toBe(false)
  })

  it('scans _internal/ subdirs (charts/_internal/axes.tsx → d3-axis)', () => {
    expect(map['charts']).toEqual(expect.arrayContaining(['d3-axis', 'd3-scale', 'd3-selection', 'd3-shape']))
  })

  it('gates only consumer-facing subpath exports, not internal sub-components', () => {
    expect(map['data-table']).toBeDefined()
    // data-table-body is internal (no subpath export) — must not appear.
    expect(map['data-table-body']).toBeUndefined()
  })

  it('never lists a base-install / universal external as a component peer', () => {
    const base = ['react', 'react-dom', 'framer-motion', 'tailwindcss', '@tabler/icons-react']
    for (const peers of Object.values(map)) {
      for (const b of base) expect(peers).not.toContain(b)
    }
  })
})
