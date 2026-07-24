# composed/empty-state — finish-bar audit
Finish: 3/5   Market: PARITY (slightly behind Primer Blankslate on composability)   Rebuild: polish

Prior baseline (2026-07-01) was also 3/5. Since then two real wins landed: the infinite decorative icon bob (P1/M1) is gone, and the `bg-surface-raised rounded-overlay-lg` icon chip that vanished on cards (P2/G1) is gone — the icon container is now a plain transparent box. But the motion rework replaced the bob with a **dead no-op animation**, and four earlier gaps (magic-number width, hardcoded `<h3>`, stale doc type, placeholder story) are still open.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean: no accent rail, no edge-soup (root is a transparent centered flex, no bg/border/shadow — correct for a content block, not a card), solid semantic fg tokens, brand chakra glyph fallback + Tabler icons, no `rounded-ds-*`/`rounded-full`. One arbitrary value: `max-w-[280px]` (l.87). Spacing uses tokens but reaches off the 3-tier cadence (ds-02/04/10 alongside 05/07). |
| a11y | gap | Title heading is hardcoded `<h3>` (l.92) — no `titleAs`/`aria-level`, so a page-level empty screen and a widget-embedded one both emit `h3`, an outline hazard. SVG fallback is `aria-hidden`. Contrast fine, no interactive root. Not a P0 (a visible title always renders) but the fixed level is a real gap. |
| api-composability | gap | `forwardRef` + `displayName`, `icon: IconInput` (typed, normalized via `normalizeIcon`), sensible compact/iconSize defaults. Gaps: `action` is a single `ReactNode` and the doc punts multi-action back to the consumer's hand-rolled flex row; no `EmptyStateActions`/secondary-action slot; no `titleAs`/`asChild`. Correctly does NOT re-roll a surface. |
| docs-dx | gap | Doc prop table still lists the pre-0.41 type `ReactNode \| ComponentType` instead of `IconInput`. Doc + JSDoc claim a "Framer Motion entrance animation" that does not actually run (see motion). MCP-manifest otherwise parity. |
| testing | ✓ | `describeConformance` + RTL: title, description-absent, action, JSX icon, component-ref icon, Tabler forwardRef icon, className merge, and full iconSize→px matrix (sm/md/lg/compact/explicit-beats-compact/ReactNode-as-is). Strong. |
| motion | ✗ | **Dead motion.** The text wrapper is `motion.div` with `initial={false} animate={{opacity:1}} transition={{delay:0.2,...tweens.fade}}` (l.86-90). `initial={false}` makes Framer mount at the `animate` value with **no animation** — the delay+fade never runs. So the component pays the full cost of framer-motion (breaks server-safety, forces the peer + a client/hydration boundary for an otherwise static block) for zero visible motion. Either implement a real reduced-motion-guarded entrance or drop framer and restore server-safe. |
| state-coverage | ✓ | It IS an empty state; covers its own variants deliberately — title-only, +description, +action, compact, three icon sizes, default brand glyph. Root is non-interactive so hover/active/focus correctly N/A. |
| content-resilience | ✓ | `max-w-[280px]` caps and wraps long descriptions; centered `text-center` wraps cleanly; direction-agnostic (`flex-col`, `gap-*`, `mt-*` block-axis) so RTL-safe. i18n length expands by wrapping. |
| theming-resilience | ✓ | Pure semantic tokens (`text-surface-fg`, `-subtle`); no accent, so an accent-9 swap is a no-op; no radius so `[data-shape]` presets can't break it; light↔dark inverts via fg tokens; the old dark-mode chip-collision bug is gone (no bg painted). |
| system-cohesion | ✓ | Composes shared primitives: `IconProvider`, `normalizeIcon`, `IconInput`, ds spacing tokens, `text-body-*` composite utilities. Only wart: siblings (StatCard/Card) use *real* entrance motion while this one carries a dead `tweens.fade`. |
| craft | gap | Nice: brand chakra fallback glyph, auto iconSize-by-compact, aria-hidden fallback. Undercut by the hand-tuned `max-w-[280px]` magic number and the zombie motion wrapper. |
| perceived-perf | gap | Renders instantly, no CLS. But it drags in framer-motion (non-server-safe, extra client boundary + hydration) for a static block that no longer animates — architectural cost for zero gain. |
| market-benchmark | gap | vs Primer Blankslate / Carbon / Atlassian EmptyState: we match on icon + title + description + single action and beat them on a branded default glyph + polymorphic icon normalization; we lag on heading-level control, primary+secondary action slots, and optional border/spacious variants. Net PARITY, slightly behind Primer. |
| cross-ds | ✓ | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] motion — `motion.div` with `initial={false}` never animates; framer-motion pulled in for nothing, forcing non-server-safe + a client boundary → either add a real `useReducedMotion`-guarded fade/scale-in entrance (matching StatCard's icon-chip mount) OR remove framer entirely and restore `// @server-safe`.
- [P1] a11y — hardcoded `<h3>` title → add `titleAs`/`headingLevel` prop (default `h3`) or `role="heading"` + configurable `aria-level`, so it slots into any outline depth without skipped levels.
- [P2] visual-integrity — `max-w-[280px]` arbitrary value → move to a named token / `max-w-*` scale step or expose as a documented prop (magic-number tell, unchanged since baseline).
- [P2] docs-dx — doc prop table says `ReactNode | ComponentType`; source is `IconInput` → correct the type and drop the "Framer Motion entrance animation" claim (it no longer runs).
- [P2] api-composability — single `action` node with doc punting multi-action to a hand-rolled flex → lay out `action` children with the DS footer gap (`flex items-center justify-center gap-ds-03`) or add an `EmptyStateActions` slot mirroring `CardFooter`.
- [P2] stories — every story action is a raw `<button style={{background:'#D33163',...}}>`; `NoDocuments` renders the literal placeholder label `IconUpload` (l.117) → replace with DS `<Button>` (primary + `variant="soft"` secondary) and a real upload icon/label.

## What it does well
- Correct architectural instinct: a transparent centered flex content block, NOT a card surface — no edge-soup, no accent rail, no gradient/glow/pill tells.
- Branded default: the Devalok chakra glyph as the fallback icon (aria-hidden), a legit brand default rather than a generic placeholder.
- Clean, fully-typed icon API — `IconInput` accepting JSX, component refs, and Tabler forwardRef icons, all normalized and px-sized through `IconProvider`; strong test matrix proving it.
- Theming-bulletproof: semantic-token-only, no accent/radius to break under brand or shape-preset swaps; the baseline dark-mode chip-collision bug is resolved.

## Cross-DS adoption ideas
- **GitHub Primer `Blankslate`** exposes `primaryAction` + `secondaryAction` slots and `narrow`/`spacious`/`border` props — we could add a secondary-action slot (or an `EmptyStateActions` sub-component) and an optional `border`/card-wrapped variant for standalone-page empty screens.
- **Atlassian `EmptyState`** takes an `imageUrl`/illustration and a `headingLevel` prop — adopt the configurable heading level (fixes our P1 a11y gap) and consider an optional illustration slot above the icon for richer marketing-grade empties.
- **Carbon** ships explicit size tokens for its empty states rather than a hardcoded measure — reinforces tokenizing `max-w-[280px]`.

## Rebuild note
Polish, not rebuild — the structure is sound (transparent flex block composing shared primitives; no surface/radius/CVA drift). Two P1 in-place fixes carry most of the value: (1) resolve the framer zombie — either a real reduced-motion-guarded entrance or drop framer and re-mark server-safe; (2) make the heading level configurable. Then tokenize the max-width, fix the stale doc type + the `IconUpload` placeholder story, and optionally add a secondary-action slot. No structural change to the component's shape or API taxonomy is warranted.
