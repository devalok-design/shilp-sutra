'use client'

import { LotusBloom } from '@/components/lotus-bloom'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * LotusShowcase — three lotuses arranged across an immersive panel.
 *
 * Composition rationale:
 *  - Triangular layout (upper-left · mid-right · lower-left) frames the
 *    centred copy without crowding it. Eye walks the three blooms in a Z.
 *  - Sizes descend (0.36 / 0.30 / 0.24) so the lotuses don't look cloned
 *    and the eye picks an order naturally.
 *  - Delays cascade (0 / 350 / 700 ms) — the blooms open in sequence,
 *    not in unison. Fast enough that all three are open within ~4 s of
 *    page load.
 *  - Rotation per bloom (0° / 28° / -14°) adds variety so the lotuses
 *    don't read as identical twins.
 */
export function LotusShowcase() {
  return (
    <div className="relative isolate overflow-hidden rounded-ds-lg border border-surface-border bg-surface-base h-[42rem]">
      {/* Upper-left, largest, opens first */}
      <LotusBloom x={0.18} y={0.28} size={0.36} delay={0}   rotation={0} />
      {/* Mid-right, medium */}
      <LotusBloom x={0.84} y={0.6}  size={0.3}  delay={350} rotation={28} />
      {/* Lower-left, smallest, anchors the triangle below the copy */}
      <LotusBloom x={0.32} y={0.82} size={0.24} delay={700} rotation={-14} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-ds-03 px-ds-08 text-center">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Three blooms, one ramp
        </Text>
        <h2 className="text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] text-surface-fg max-w-2xl text-balance">
          The lotus,
          <br />
          <span className="text-accent-11">made of light.</span>
        </h2>
        <Text variant="body-md" className="text-surface-fg-muted max-w-md">
          Each bloom is a single WebGL mesh masked into a circle. The colour
          ramp follows the live Devalok accent — white at the centre, pink
          at the edge, the way the flower carries it in nature.
        </Text>
      </div>
    </div>
  )
}
