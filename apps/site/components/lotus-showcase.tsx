'use client'

import * as React from 'react'

import { LotusBloom } from '@/components/lotus-bloom'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * LotusShowcase — a field of lotuses filling the immersive backdrop.
 *
 * Composition rationale:
 *   - One anchor lotus centred + larger than the rest, so the eye has a
 *     focal point. Eight smaller lotuses fan out symmetrically around it.
 *   - Sizes scale with distance from focal point (closer = larger), and
 *     opacity drops with distance — gives the field perceived depth.
 *   - Bloom delays cascade outward in a wave from the centre; the field
 *     opens like a ripple rather than a uniform sheet.
 *   - Rotation per lotus is randomised within ±35° so the petals don't
 *     look like a tiled pattern.
 *   - All lotuses live in a single `absolute inset-0` container; the
 *     showcase text floats above at z-10.
 */

interface Position {
  x: string   // CSS percentage of container width
  y: string   // CSS percentage of container height
  size: number
  delay: number
  rotation: number
  opacity: number
}

// 11 lotuses fanned around the perimeter, leaving the centre clear for
// the title. Hand-tuned, not procedural — the eye picks individual blooms
// instead of a repeating pattern.
const FIELD: Position[] = [
  // Big anchors at the four "corners" — each in a slightly different
  // size + rotation so they don't read as a frame.
  { x: '14%',  y: '24%', size: 320, delay:   0,  rotation:  18, opacity: 0.95 },
  { x: '86%',  y: '22%', size: 290, delay: 120,  rotation: -14, opacity: 0.95 },
  { x: '12%',  y: '78%', size: 280, delay: 380,  rotation:  32, opacity: 0.9  },
  { x: '88%',  y: '76%', size: 300, delay: 480,  rotation: -26, opacity: 0.9  },
  // Mid-edge supporting blooms — smaller, slightly distant feel.
  { x: '38%',  y: '92%', size: 170, delay: 700,  rotation:  -8, opacity: 0.75 },
  { x: '62%',  y: '92%', size: 180, delay: 760,  rotation:  12, opacity: 0.75 },
  { x: '48%',  y: '8%',  size: 150, delay: 540,  rotation:  22, opacity: 0.7  },
  // Far-edge "distance" blooms — smallest + lowest opacity for depth.
  { x: '3%',   y: '50%', size: 110, delay: 900,  rotation:   6, opacity: 0.55 },
  { x: '97%',  y: '50%', size: 120, delay: 980,  rotation:  -9, opacity: 0.55 },
  { x: '28%',  y: '52%', size: 95,  delay: 820,  rotation:  18, opacity: 0.5  },
  { x: '72%',  y: '52%', size: 100, delay: 880,  rotation: -22, opacity: 0.5  },
]

export function LotusShowcase() {
  return (
    <div className="relative isolate overflow-hidden rounded-ds-lg border border-surface-border bg-surface-base h-[80vh] min-h-[44rem]">
      {/* Each lotus is wrapped in an absolute centring div so positioning
          and bloom intrinsic geometry stay decoupled. */}
      {FIELD.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <LotusBloom
            size={p.size}
            delay={p.delay}
            rotation={p.rotation}
            opacity={p.opacity}
          />
        </div>
      ))}

      {/* Centred copy sits above the field at z-10. The anchor lotus glows
          around it; the rest fan out. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-ds-03 px-ds-08 text-center">
        <Text variant="label-md" className="text-surface-fg-subtle drop-shadow-sm">
          A field of lotuses
        </Text>
        <h2 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] text-surface-fg max-w-2xl text-balance drop-shadow-md">
          Pink at the tip,
          <br />
          <span className="text-accent-11">white at the base.</span>
        </h2>
        <Text variant="body-md" className="text-surface-fg-muted max-w-md drop-shadow-sm">
          Eight outer petals, six inner — radial bloom anchored at each
          petal&apos;s base, with a cascading delay that opens the field in a
          wave. Brand colour follows you live.
        </Text>
      </div>
    </div>
  )
}
