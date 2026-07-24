# ui/color-swatch — finish-bar audit
Finish: 3/5   Market: LAGS(React Aria ColorSwatch)   Rebuild: polish

A small, clean decorative primitive that turns interactive-but-broken the moment
you opt into `copyable`. In its default `role="presentation"` mode it is honest,
token-clean, and cohesive. The `copyable` branch (`color-swatch.tsx:90-111`)
renders a real `<button>` with **no focus-visible ring**, a **sub-44px touch
target** (12–24px), a **swallowed clipboard rejection** (no `.catch`, no
`navigator.clipboard` guard), no press feedback, and no `onCopy` escape hatch —
and the shipped doc actively claims the component is "display-only / not
interactive" while omitting `copyable` and `checkerboard` entirely. Source is
truth; the doc misdescribes it.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rails / gradient / glow / emoji. Uses radius role tokens (`rounded-pill`/`rounded-none`/`rounded-control-inner`) — no `rounded-ds-*`. But the "Copied!" toast re-rolls magic numbers: `text-[10px]` and `px-1.5 py-0.5` (`color-swatch.tsx:105`) instead of `text-ds-xs` / `px-ds-*`. |
| accessibility | ✗ | `copyable` `<button>` has NO `focus-visible` ring (the DS `focus-ring` util exists, unused) and a sub-44px target (`sm`=12px, `lg`=24px). `aria-label` and `role="status"` on the toast are correct — but a keyboard user gets no focus indicator on a real interactive control (WCAG 2.4.7). Default (presentation) mode is fine. |
| api-composability | gap | `forwardRef`+`displayName` ✓, `color` as documented free CSS string ✓, `size`/`shape` on-taxonomy. But `copyable` has no `onCopy?(color)` callback — consumers can't hook success/analytics or override the inline toast. Props typed as span attrs then cast to button attrs (`:99`), so button-only attrs aren't surfaced. |
| docs-dx | ✗ | Doc (`docs/components/ui/color-swatch.md`) lists only `color/size/shape/ring` — omits `copyable` and `checkerboard`; line 27 says "ColorSwatch is display-only", line 32 "not interactive". Source ships an interactive clipboard button. Doc header claims "Server-safe: Yes" yet the file is `'use client'` with `useState`/`useEffect`/clipboard. Also declares "no `onCopy`" implicitly by omission. |
| testing | gap | `describeConformance` + RTL for color/shape/ring/size. But the risky interactive path is untested: no `copyable` click/copy test, no `checkerboard` test, no `vitest-axe` play test. Coverage sits exactly where the bugs aren't. |
| motion | gap | No motion anywhere. Default decorative = correct (no-motion is right). But `copyable` press has no feedback (`active:scale`/`whileTap`) and the "Copied!" badge hard mounts/unmounts with no fade/translate. Minor, opt-in path only. |
| state-coverage | ✗ | `copyable` clipboard call (`:69-74`) has no `.catch` and no `navigator.clipboard` presence guard — rejection swallowed (insecure context / denied permission → silent no-op or unhandled rejection). No hover/active/focus/disabled states designed for the button. Empty/error not surfaced. |
| content-resilience | ✓ | Fixed-size swatch, arbitrary CSS color string. `checkerboard` cleanly handles transparent/alpha colors via layered conic-gradient. No text-overflow surface. |
| theming-resilience | ✓ | `color` intentionally inline (user runtime value). `ring` → `--shadow-ring-sm` (surface-border, adapts). checkerboard → `--color-neutral-5` (light/dark ramp). Toast → `surface-overlay`/`surface-fg` (theme-aware). Survives accent swap; honors `[data-shape]` via role tokens. |
| system-cohesion | gap | Shares DS radius/shadow/surface vocabulary. Drift is the toast: raw `text-[10px]`/`px-1.5 py-0.5` and NOT using the shared `focus-ring` util that every other interactive element uses. |
| craft | gap | Nice: `cursor-pointer` affordance, unmount timer cleanup (`:46`), `ring` for light colors, checkerboard for transparency. Undercut by the missing focus ring on the interactive branch. |
| perceived-performance | ✓ | Instant "Copied!" feedback; absolute-positioned toast → no layout shift; no skeleton needed for a leaf. |
| market-benchmark | gap | React Aria Components `ColorSwatch` is the best-in-class peer: fully a11y (auto human-readable color name), alpha-aware checkerboard. We LEAD on `copyable` + built-in `ring`, but LAG on interactive a11y and auto color-naming. |
| cross-ds-adoption | gap | See ideas below — auto accessible color-name label, `onCopy` callback, focus/touch hardening. |

## Top gaps (prioritized)
- [P0] accessibility — `copyable` `<button>` has no `focus-visible` ring + sub-44px target → add `focus-visible:focus-ring` and a hit-area expansion (`touch-target` util or `before:absolute before:-inset-*`) so the click target ≥44px without inflating the visual swatch.
- [P1] state-coverage — clipboard rejection swallowed, `navigator.clipboard` unguarded → guard `if (!navigator.clipboard) return`, add `.catch` (don't flip `copied` on failure), surface via optional `onCopy(success)`.
- [P1] docs-dx — doc contradicts source (`copyable`/`checkerboard` undocumented; "not interactive" false; "Server-safe: Yes" vs `'use client'`) → add both props, remove the false display-only claims, correct the server-safe flag, add `Copyable`/`Checkerboard` stories (publish-gate adjacent).
- [P2] api-composability — no `onCopy?(color)` callback → add for analytics/toast hooks.
- [P2] visual-integrity/cohesion — magic numbers in toast (`text-[10px]`, `px-1.5 py-0.5`) → `text-ds-xs`, `px-ds-02 py-ds-01`.
- [P2] motion — no press feedback / no toast enter-exit → `active:scale-[0.97]` + a reduced-motion-guarded fade on the badge.

## What it does well
- Genuinely clean visuals: no accent rails, gradient text, glow/glass/blob, emoji, or pill-spam. Radius vocabulary is correct role tokens — zero `rounded-ds-*`/`rounded-full`.
- Theme-aware throughout (ring, checkerboard, toast all use adaptive tokens); `color` correctly left as a free runtime CSS string.
- `checkerboard` layered-conic pattern for transparent/alpha colors is a real, thoughtful touch most DS swatches skip.
- Unmount `clearTimeout` cleanup and `cursor-pointer` affordance show care in the details.

## Cross-DS adoption ideas
- **React Aria ColorSwatch** auto-derives a human-readable `aria-label` from the color value (e.g. "dark vibrant blue") — we accept only a raw string; even in decorative mode a title/label option would help. For `copyable`, we hardcode `Copy color ${color}` (the raw hex) — a named-color mapping would read far better to screen readers.
- **React Aria / Spectrum** treat their color components as fully keyboard-and-focus complete by construction; adopting their "interactive ⇒ focus-ring + 44px target always" invariant would have prevented this component's a11y gap.
- **Radix/Base UI** copy-to-clipboard patterns expose a controlled `onCopy` + copied-state callback rather than an internal-only flag — worth importing for `copyable`.

## Rebuild note
Polish, not rebuild — structure is sound for a leaf primitive. Scope: (1) harden the `copyable` branch — `focus-visible:focus-ring`, 44px hit area, `navigator.clipboard` guard + `.catch`, optional `onCopy`, press feedback + reduced-motion; (2) token hygiene in the toast; (3) fix the doc contradiction (props table, "not interactive" claims, server-safe flag) and add `Copyable`/`Checkerboard` stories + an axe test. No API break — all additive; the `size`/`shape`/`color`/`ring` surface stays as-is.
