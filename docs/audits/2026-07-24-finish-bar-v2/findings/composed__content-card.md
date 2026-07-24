# composed/content-card — finish-bar audit
Finish: 2/5   Market: LAGS (our own Card / shadcn Card)   Rebuild: polish (delete next major — no structural investment)

> **Context:** `ContentCard` is `@deprecated` (content-card.tsx:58–63), slated for removal next major in favor of `Card` + slots. It still ships in the tarball today, so its tells are live. Source is essentially unchanged since the 2026-07-01 baseline (also 2/5) — score held. One **regression since baseline**: a per-component doc now exists and it is **factually wrong** — it claims the component wraps `ui/Card`; the source imports only `cn` and hand-rolls its own CVA. Peer benchmark is our own `Card`, the exemplar this component drifts from. No systemic finish-bar tells present (no `border-card-strong`, no `slide-no-fade`, no `rounded-ds-*`/`rounded-full`, no `p-[..]`/`h-[..]` magic numbers).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `rounded-surface` role token ✓, no accent-rail/gradient/glow/emoji/pill-spam ✓, variants are elevation-XOR-border (no edge-soup) ✓, `bg-surface-raised` is the correct card tier ✓. Nits: padding uses `ds-04`/`ds-05b`/`ds-06` — all valid tokens (ds-05b=20px confirmed in semantic.css) but off the preferred ds-03/05/07 cadence; `will-change-[box-shadow]` (:8) is set permanently on every card. |
| accessibility | gap | `describeConformance` gives baseline axe/ref/className. Passive container → no touch-target/roving-tabindex needed. Only real issue: `headerTitle` hardcodes `<h3>` (:100), baking a document-outline level with no override (the `header` escape hatch is the only workaround). |
| api-composability | ✗ | Headline failure. Re-rolls surface/radius/shadow/hover-lift (:7–31) instead of composing `<Card>` (F5); bespoke region props `header`/`headerTitle`/`headerActions`/`footer` where `CardHeader`/`CardTitle`/`CardAction`/`CardFooter` slots belong (F1); implicit, type-unenforced precedence — `header ?? (...)` silently beats `headerTitle` (:97, tested at test:42, F4); non-canonical `padding` axis + hand-rolled `getPadding`/`getContentPadding` switches (:33–47) instead of `size` (G3); `headerTitle: string` should be `ReactNode`. `forwardRef`+`displayName`+typed props are clean, but the composition model is exactly what Card/StatCard were built to kill. |
| docs-dx | ✗ | content-card.md is **inaccurate**: "wraps ui/Card" (md:29) and "the underlying Card size cascade propagates" (md:32) — both false; source hand-rolls its own CVA and never touches Card. Source is truth; the doc teaches a false mental model that ships in the tarball. Deprecation banner + migration map present ✓, but `@deprecated` JSDoc ships no runtime dev-warn (JS consumers get no signal). |
| testing | gap | `describeConformance` + 5 focused unit tests (children/headerTitle/headerActions/footer/precedence) ✓. No axe `play` test, no interaction/state coverage beyond render. Adequate for a deprecated container. |
| motion | gap | Token-based CSS hover transition (`duration-fast-02 ease-productive-standard`, :8) ✓ — reasonable, no `ease-in`. No entrance motion. No `motion-reduce:` guard (low severity: it animates color/shadow, not transform). Permanent `will-change` = minor perf smell. Diverges from Card's framer `whileHover` (reduced-motion aware via MotionConfig). |
| state-coverage | gap | Hover deliberately designed on all 3 variants ✓. Passive container so disabled/loading/empty/error are largely N/A, but none are handled and there's no truncation/empty affordance. The hover-lift implies an interactivity the component never delivers. |
| content-resilience | gap | Header is `justify-between` (title + actions) with no truncation strategy — a long `headerTitle` beside actions can collide. Physical `px-`/`py-`/`border-b`/`border-t` rather than logical properties (minor RTL cost). Children are arbitrary ReactNode ✓. |
| theming-resilience | ✓ | Role radius token survives `[data-shape]` presets; semantic surface/border tokens survive an accent-9 swap; `surface-raised` has an explicit dark override and `shadow-raised` carries a 1px ring, so the default card keeps a defined edge on near-black. No dark-mode vanish. Genuinely the best-behaved axis. |
| system-cohesion | ✗ | A parallel, drift-prone copy of `Card`. Card `default` is flat/bordered/tonal (`border border-card`); ContentCard `default` is shadowed and hover-lifts unconditionally (`shadow-raised hover:shadow-raised-hover`, no border). Different border vocab (`surface-border`/`-border-strong` here vs Card's `border-card`), different elevation, different padding model (`padding` axis vs `size`). Two "cards" in one system that look and behave differently — voices out of tune. |
| craft | gap | Transition covers color/bg/border/shadow smoothly ✓, tidy divider borders. But `default` hover-lifts on every card with no `cursor-pointer` and no click affordance (false interactivity cue), and `will-change` is never cleaned up. |
| perceived-perf | ✓ | Static, server-safe, no fetch, no CLS, instant. Only nit: permanent `will-change` keeps a compositor layer alive per card (unbounded on a card list). |
| market-benchmark | ✗ | LAGS. Peers (shadcn Card, Radix, our own Card) all use pure slot composition. ContentCard's region-prop + implicit-precedence model is the pattern the industry moved off of; our own `Card` already implements the winning model and this lags it directly. |
| cross-ds-adoption | ✓ | Ideas captured below (informational axis, not pass/fail). |

## Top gaps (prioritized)
- **[P0] api-composability / system-cohesion** — re-rolls Card's surface/radius/shadow/hover and exposes fixed region props instead of slots → the resolution is the existing deprecation: **delete next major, migrate consumers to `Card` + `CardHeader`/`CardTitle`/`CardAction`/`CardContent`/`CardFooter`**. Do not structurally rebuild a component slated for deletion.
- **[P1] docs-dx** — content-card.md falsely claims it wraps `ui/Card` and that a "Card size cascade propagates." → Correct the doc to describe the standalone CVA the source actually implements, or reduce it to a migration stub. It ships in the tarball and misleads today.
- **[P1] visual/DX — stories teach anti-patterns** — stories hardcode raw hex (`#D33163`, `#22c55e`, `#fff`) and raw px throughout. → Swap for DS components (`Button`, `Badge`) + token vars so the canonical examples stop teaching palette-as-brand.
- **[P2] motion/craft** — unconditional hover-lift with no `cursor`/click affordance (false interactivity) + permanent `will-change`. → If kept interim, gate the lift behind an `interactive` intent like Card does.
- **[P2] accessibility** — hardcoded `<h3>` for `headerTitle`. → Accept a heading-level prop, or resolve via `CardTitle` on migration.
- **[P2] docs** — `@deprecated` JSDoc has no runtime dev-warn. → Add a once-guarded `console.warn` so JS consumers get the signal.

## What it does well
- Uses only semantic tokens in the **component** source (`surface-*`, `surface-border*`, `rounded-surface`, `text-body-lg`) — no raw hex/px in the shipped component (the hex lives only in the stories).
- Clean typed API surface: `forwardRef` + `displayName`, `VariantProps`, no `any`, no `React.FC`, no stringly-typed color.
- Variants are correctly elevation-XOR-border — no double-edge/edge-soup.
- Server-safe (`// @server-safe`) and correctly documented as such.
- Theming-resilient: role radius token + semantic surfaces survive shape/accent/dark swaps.
- Free of the systemic finish-bar tells (no `border-card-strong`, no `slide-no-fade`, no `rounded-ds-*`, no magic numbers).
- Honest self-deprecation with a concrete migration map in the doc header.

## Cross-DS adoption ideas
- **shadcn / Radix Card** — full slot composition (`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`) with no region props. We already have this in `Card`; the adoption move is to *retire* the region-prop model, not import it.
- **shadcn `CardDescription`** — a dedicated muted-subtitle slot; ContentCard has none (consumers cram it into children). Worth ensuring `Card` exposes one for migrants.
- **MUI `CardActionArea` / Linear** — a first-class "the whole card is clickable" affordance (ripple/focus/role, hover-lift only when interactive). ContentCard's unconditional lift implies this but delivers none of it; `Card` should offer an explicit `interactive`/`asChild`-link mode.
- **Radix / Base UI `asChild`** — let a card render as `<section>`/`<article>` for document semantics without an extra wrapper. Neither ContentCard nor Card has this today.

## Rebuild note
**Polish, not rebuild — and no structural investment.** This component is `@deprecated`, and its structural sins (F5/F1/F4/G3 + system-cohesion) are exactly why. The correct resolution is to **finish the deprecation and delete it next major**, migrating consumers to `Card` + slots; a structural rebuild-in-place would be wasted effort on a component being removed (reimplementing it as a thin `Card` wrapper is strictly more work than pointing consumers at `Card`). The only interim work worth doing while it still ships: (1) correct the inaccurate doc, (2) de-hex the stories so they stop teaching palette-as-brand, and optionally (3) add a runtime deprecation warn. Those are cheap in-place fixes. The finish score stays capped at 2/5 because the two ✗ composability/cohesion axes are unfixable without either deletion or a full reimplementation over `Card`.
