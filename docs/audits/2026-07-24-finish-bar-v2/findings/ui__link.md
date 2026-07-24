# ui/link — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

A genuinely lean, well-built styled primitive: real `<a>`, `asChild` via Slot, `forwardRef` + `displayName`, focus-visible ring with offset rounded to a role token, token-bound duration/easing, and a nice no-reflow underline-reveal (animates `text-decoration-color`, not the presence of `underline`, so hover causes no layout shift). No slop, no magic numbers, no radius-ds. The gaps are finish-bar gaps, not defects: it still bypasses the DS's dedicated `--color-link*` tokens (drift + a never-wired `:visited`), the inline default relies on color alone (underline only on hover), and there's no external-link affordance.

Source verified: `packages/core/src/ui/link.tsx` (35 lines). Radius uses `rounded-control-inner` (valid role token, `semantic.css:391`), motion uses `duration-fast-01` (70ms) + `ease-productive-standard` (both real tokens). **Baseline correction:** the 2026-07-01 P1 forced-colors hole is now largely closed — `semantic.css:762-763` maps `--color-accent-11/12: LinkText` in the `forced-colors` block (it mapped to `CanvasText` when the baseline was written), so a non-hovered link now renders `LinkText`, not indistinguishable body text.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No edge-soup/gradient/glow/emoji/pill-spam. Radius role token (`rounded-control-inner`) on the focus ring only. `underline-offset-2` is a standard utility, not arbitrary. No spacing (inline element) so cadence N/A. |
| accessibility | gap | Real `<a>`, `focus-visible:ring-2` + `ring-offset-2` + `outline-hidden` fallback, keyboard-native. But inline default is `decoration-transparent` → color-only differentiation from body text until hover (WCAG 1.4.1 / G183 borderline — passes only if accent-11 has 3:1 vs body text + the hover underline/focus ring counts as the added cue). No external `rel`/"opens in new tab" affordance. Forced-colors now OK. |
| api-composability | ✓ | `forwardRef<HTMLAnchorElement>`, `displayName`, `asChild`/Slot, exported `LinkProps` extends `AnchorHTMLAttributes`, no `any`. Lean 2-prop surface. Minor: `inline?'inline':'block'` still stamps display onto the Slot child under `asChild`, which can override the child's own display. |
| docs-dx | ✓ | `docs/components/ui/link.md` has Props/Defaults/Example/Composability/Gotchas and matches source. Minor: no focus-visible/visited story; stories lack an axe play test. |
| testing | ✓ | `describeConformance` + asChild + inline/block + href passthrough + role assertions. Minor: no explicit `vitest-axe` case in the file (conformance may cover). |
| motion | ✓ | 70ms transition on `color,text-decoration-color,opacity` with a custom productive cubic-bezier; `active:opacity-80` press feedback; animates cheap props only (no layout). Minor: no `motion-reduce:transition-none` guard (mild — a 70ms color fade, not movement). |
| state-coverage | gap | hover (`text-accent-12` + underline reveal), active (`opacity-80`), focus-visible all designed. No disabled/`aria-disabled` pattern, no `:visited` (the `--color-link-visited` purple-11 token exists but is never wired), no external state. |
| content-resilience | ✓ | Inline wraps naturally in flowing text; long text/i18n expansion fine; RTL-safe (no directional offsets; `underline-offset` is symmetric). |
| theming-resilience | ✓ | Accent scale survives a brand accent-9 swap; `rounded-control-inner` honors `[data-shape]` presets; works light/dark. Caveat folded into cohesion: re-tuning link color via `--color-link` won't reach this component. |
| system-cohesion | gap | Uses DS duration/ease/radius/focus-ring language consistent with siblings — BUT bypasses the purpose-built `--color-link` / `--color-link-hover` / `--color-link-visited` vocabulary (`semantic.css:260-262`) in favor of the raw `accent-11/12` it aliases. Single-source-of-truth drift. |
| craft | ✓ | Underline-reveal via `decoration-transparent → hover:decoration-current` (zero reflow), `underline-offset-2` optical breathing room, focus ring rounded to `control-inner`, native pointer cursor. Quietly correct. |
| perceived-performance | ✓ | Instant feedback; no CLS (decoration color animates, underline box is always present); no jank. |
| market-benchmark | — | PARITY vs MUI Link / GitHub Primer Link / Chakra Link. We match on focus/asChild/tokens; lag on (a) Primer/MUI defaulting inline links to a persistent underline, (b) MUI's `underline="always|hover|none"` prop, (c) external-link icon + auto-`rel` + sr-only "(opens in new tab)". |
| cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] accessibility — inline default (`decoration-transparent`) differentiates links from body text by color alone until hover → add a persistent underline for inline links (or an `underline="always|hover|none"` prop defaulting to `always` when `inline`), so color isn't the sole cue.
- [P2] system-cohesion — repoint `text-accent-11`/`hover:text-accent-12` → `text-link`/`hover:text-link-hover` (identical value today, restores single source of truth) and optionally wire `visited:text-link-visited`.
- [P2] state-coverage — add opt-in `external` (or `target="_blank"` detection) → auto `rel="noopener noreferrer"` + trailing ↗ icon + sr-only "(opens in new tab)"; consider a disabled/`aria-disabled` pattern.
- [P2] motion — add `motion-reduce:transition-none` (or confirm + document a global reduced-motion base rule).
- [P3] api-composability — skip the `inline?'inline':'block'` class when `asChild` is true so a polymorphic child keeps its own display.
- [P3] docs-dx — add a focus-visible + visited/external story and an axe play test.

## What it does well
- No-reflow hover underline (`decoration-transparent → decoration-current`) — reveals the underline without the layout shift of toggling `underline`. Genuine craft.
- Correct primitive shape: real `<a>`, `asChild`/Slot polymorphism for framework routers, `forwardRef` + `displayName`, lean typed prop surface.
- Fully token-bound motion/radius/focus; cohesive with sibling components' focus-ring and easing language.
- Radius role token only — no `rounded-ds-*`/`rounded-full` release-gate blocker.

## Cross-DS adoption ideas
- **MUI Link** exposes `underline="always" | "hover" | "none"` — import this as the clean way to serve both persistent-underline inline links (a11y default) and underline-on-hover standalone links from one prop.
- **GitHub Primer Link** defaults inline links to underlined and standalone links to not — an `inline` prop that ADDS underline (inverse of ours) is the accessibility-correct default for text-flow links.
- **Primer/Chakra external links** auto-inject a trailing ↗ icon, `rel="noopener noreferrer"`, and an sr-only "(opens in new tab)" when `target="_blank"` — we leave all of this to the consumer, who routinely forgets the `rel` security attr.

## Rebuild note
Polish, not rebuild. The structure (thin styled `<a>` + Slot) is correct and shippable at 4/5. In-place fixes only: (1) persistent underline for inline links to remove color-only differentiation, (2) repoint to `--color-link` tokens + wire `:visited`, (3) opt-in `external` affordance, (4) `motion-reduce` guard, (5) gate the display class behind `!asChild`. No API break — all additive or behind new opt-in props.
