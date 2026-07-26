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

  it('does NOT list a bundled dep as a peer when it stays out of our types (frimousse, @emoji-mart/data)', () => {
    // emoji-picker bundles frimousse + @emoji-mart/data (lazy chunk), and
    // neither is named in any emitted .d.ts → nothing for a consumer to
    // install, so no gated peer. This is the 2026-07-10 dogfood invariant:
    // a phantom install instruction for a dep we already ship.
    expect(map['emoji-picker']).toBeUndefined()
    const rte = map['rich-text-editor'] ?? []
    expect(rte.some((p) => p.startsWith('@emoji-mart/') || p === 'frimousse')).toBe(false)
  })

  it('DOES list a bundled dep as a peer when our published types name it (@tiptap)', () => {
    // Refines the rule above (0.55.0). "Bundled" settles the RUNTIME question
    // only. Rollup inlines TipTap's JS, but TypeScript's declaration emitter
    // does not inline third-party types — `import { Editor } from
    // '@tiptap/react'` survives into rich-text-editor.d.ts as a bare
    // specifier. Undeclared, that is TS2307 for every consumer who
    // type-checks declarations; 0.54.0 shipped 7 such files.
    //
    // So these are declared as OPTIONAL, TYPES-ONLY peers. Asserting the
    // positive here stops a future "it's bundled, drop the peer" cleanup from
    // silently reintroducing the unresolvable import.
    const rte = map['rich-text-editor'] ?? []
    expect(rte).toContain('@tiptap/react')
  })

  it('pulls in the type-peers OF a types-only peer (@tiptap/react → @tiptap/pm)', () => {
    // @tiptap/pm is never imported by us. TipTap's own .d.ts imports
    // '@tiptap/pm/state' and declares @tiptap/pm as ITS peer, so a consumer
    // told only to install @tiptap/react still gets six TS2307 errors from
    // inside TipTap. Not derivable from our imports — it lives in the peer's
    // declarations — hence TYPES_ONLY_COMPANIONS. Found by the pnpm
    // strict-install harness; npm's hoisting hid it completely.
    const rte = map['rich-text-editor'] ?? []
    expect(rte).toContain('@tiptap/pm')
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
