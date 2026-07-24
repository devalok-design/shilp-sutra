'use client'

import * as React from 'react'

import { AuroraBloom } from '@devalok/shilp-sutra-brand/aurora'
import { LotusBloom } from '@/components/lotus-bloom'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * LotusShowcase — full-bleed field of dynamic SVG lotuses over a subtle
 * WebGL aurora backdrop.
 *
 * Layering (back-to-front):
 *   1. AuroraBloom backdrop — full-bleed, very subtle, slow drift. Provides
 *      the atmospheric depth the SVG flowers sit ON. Without this layer the
 *      flowers float against a flat surface and the scene reads as a
 *      diagram rather than a setting.
 *   2. Eleven SVG lotuses — each with its own brand-tinted CSS halo,
 *      continuous spin + float + breathe, and per-petal bloom intro.
 *   3. Centred title block — z-10, sits above everything.
 */

interface Position {
  x: string
  y: string
  size: number
  delay: number
  rotation: number
  opacity: number
  halo?: number
}

// 11 lotuses fanned around the perimeter — corners get big anchors, mid
// edges get supporting blooms, far edges get small "distance" blooms with
// reduced opacity. Centre stays clear for the title block.
const FIELD: Position[] = [
  { x: '14%',  y: '24%', size: 320, delay:   0,  rotation:  18, opacity: 0.95, halo: 0.40 },
  { x: '86%',  y: '22%', size: 290, delay: 120,  rotation: -14, opacity: 0.95, halo: 0.40 },
  { x: '12%',  y: '78%', size: 280, delay: 380,  rotation:  32, opacity: 0.9,  halo: 0.38 },
  { x: '88%',  y: '76%', size: 300, delay: 480,  rotation: -26, opacity: 0.9,  halo: 0.38 },
  { x: '38%',  y: '92%', size: 170, delay: 700,  rotation:  -8, opacity: 0.78, halo: 0.32 },
  { x: '62%',  y: '92%', size: 180, delay: 760,  rotation:  12, opacity: 0.78, halo: 0.32 },
  { x: '48%',  y: '8%',  size: 150, delay: 540,  rotation:  22, opacity: 0.72, halo: 0.3  },
  { x: '3%',   y: '50%', size: 110, delay: 900,  rotation:   6, opacity: 0.6,  halo: 0.28 },
  { x: '97%',  y: '50%', size: 120, delay: 980,  rotation:  -9, opacity: 0.6,  halo: 0.28 },
  { x: '28%',  y: '52%', size: 95,  delay: 820,  rotation:  18, opacity: 0.55, halo: 0.25 },
  { x: '72%',  y: '52%', size: 100, delay: 880,  rotation: -22, opacity: 0.55, halo: 0.25 },
]

export function LotusShowcase() {
  return (
    <div className="relative isolate overflow-hidden rounded-surface border border-surface-border bg-surface-base h-[80vh] min-h-[44rem]">
      {/* Atmospheric aurora backdrop — soft + diffuse so the lotuses read
          ON the field, not get absorbed by it. The opacity wrapper drops
          the mesh saturation to mood-only; AuroraBloom doesn't expose an
          opacity prop so this is the cleanest knob. */}
      <div className="absolute inset-0" style={{ opacity: 0.4 }}>
        <AuroraBloom
          intensity="subtle"
          shape="halo"
          position="center"
          layers={2}
          speed={0.15}
          parallax="off"
          breathing={false}
        />
      </div>

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
            halo={p.halo}
          />
        </div>
      ))}

      {/* Centred copy. z-10 above the lotuses; drop-shadow keeps it
          readable when a lotus drifts behind. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-ds-03 px-ds-08 text-center">
        <Text variant="label-md" className="text-surface-fg-subtle drop-shadow-sm">
          A field of lotuses
        </Text>
        <h2 className="font-display text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] text-surface-fg max-w-2xl text-balance drop-shadow-md">
          Pink at the tip,
          <br />
          <span className="text-accent-11">white at the base.</span>
        </h2>
        <Text variant="body-md" className="text-surface-fg-muted max-w-md drop-shadow-sm">
          Each flower spins, floats, and breathes on its own clock. Eleven
          lotuses, none of them in sync, all of them following your brand.
        </Text>
      </div>
    </div>
  )
}
