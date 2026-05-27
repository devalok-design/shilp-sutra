/**
 * Generate the CSS snippet a consumer pastes after running the Themer.
 *
 * Emits `:root` + `.dark` overrides for the OKLCH accent ramp, plus
 * archetype-derived role tokens (radius/spacing/border/shadow). Works
 * on shilp-sutra 0.39+ without needing v0.40's `[data-archetype]` blocks
 * because everything is written as direct token overrides.
 */

import {
  type ArchetypeName,
  type DensityName,
  type ShapeName,
  mergeArchetype,
} from './archetype-presets'
import { generateRamp, deriveAccentFg } from './ramp-generator'
import { type ThemerState } from './themer-state'

export function generateThemerCss(state: ThemerState): string {
  const archetype: ArchetypeName = state.archetype ?? 'devalok'
  const density: DensityName | undefined = state.density
  const shape: ShapeName | undefined = state.shape
  const hue = state.hue ?? 340
  const chroma = state.chroma ?? 0.19

  const role = mergeArchetype(archetype, density, shape)
  const ramp = generateRamp(hue, chroma)

  const lightRamp = ramp.light.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const darkRamp = ramp.dark.map((s) => `  --color-accent-${s.step}: ${s.value};`).join('\n')
  const lightFg = deriveAccentFg(ramp.light[8].value)
  const darkFg = deriveAccentFg(ramp.dark[8].value)

  const header = [
    `/* shilp-sutra Themer output`,
    ` * archetype: ${archetype}`,
    density ? ` * density:   ${density}` : null,
    shape ? ` * shape:     ${shape}` : null,
    state.motion ? ` * motion:    ${state.motion}` : null,
    ` * accent:    hue ${Math.round(hue)}° / chroma ${chroma.toFixed(3)}`,
    ` *`,
    ` * Paste into your global stylesheet, AFTER the shilp-sutra import:`,
    ` *   @import "tailwindcss";`,
    ` *   @import "@devalok/shilp-sutra/css";`,
    ` *   /* this block here */`,
    ` */`,
  ]
    .filter(Boolean)
    .join('\n')

  return `${header}

:root {
  /* Role tokens — derived from archetype + density + shape */
  --radius-surface: ${role.rs}px;
  --radius-control: ${role.rc}px;
  --radius-control-inner: ${Math.max(role.rc - 2, 0)}px;

  /* Accent ramp (OKLCH, 12 steps) */
${lightRamp}
  --color-accent-fg: ${lightFg};
}

.dark {
${darkRamp}
  --color-accent-fg: ${darkFg};
}
`
}
