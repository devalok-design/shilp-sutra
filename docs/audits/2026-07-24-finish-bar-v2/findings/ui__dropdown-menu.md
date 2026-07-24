# ui/dropdown-menu — finish-bar audit

Finish: 4/5   Market: PARITY (Radix DropdownMenu)   Rebuild: polish

Compound overlay wrapping the vendored Radix DropdownMenu primitive, restyled with DS tokens and given a framer-motion scale+fade entrance. Structurally strong: all parts are slot-based, `asChild`-friendly, controlled+uncontrolled bridged via `useControllableOpen`. The gaps are finish-level, not structural — and are the SAME gaps the 2026-07-01 baseline flagged, still unfixed at source.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Clean surface language (bg-surface-overlay + shadow-floating = single edge, no edge-soup; rounded-overlay/rounded-control role tokens; semantic error-11 for destructive). BUT two magic numbers: `min-w-[8rem]` (Content + SubContent) and `h-2 w-2` radio dot — off DS spacing/size cadence. |
| accessibility | gap | Correct menu ARIA pattern, roving tabindex, typeahead, focus trap, Esc/Enter all via Radix — axe-clean open+closed. Gaps: `outline-hidden` leaves focus as background-tint only (risk in `forced-colors`, no fallback outline); no `touch-target` util on items (py-ds-02b is compact for touch); `IconChevronRight` on SubTrigger has no RTL mirroring assertion. |
| api-composability | ✓ | Fully part-based compound; `asChild` on Trigger/Content/SubContent; controlled `open` + uncontrolled `defaultOpen` bridged cleanly (no double-source-of-truth); forwardRef+displayName on all interactive parts; ReactNode children; type exports. One nit: root + Sub typed as `React.FC` (bakes implicit children) while every sibling uses forwardRef — cosmetic, not breaking. |
| docs-dx | gap | Doc compound list, keyboard model, asChild + shortcut guidance all match source. But "Defaults: none" and zero mention of the animated overlay surface (shadow-floating / surface-overlay) or the reduced-motion dependency. Changelog stops at v0.22.0. |
| testing | gap | axe closed+open, Enter-opens, Escape-closes. Missing: interaction coverage for checkbox toggle / radio select / submenu open, and no describeConformance. |
| motion | gap | Scale+fade entrance HAS opacity:0 (no slide-no-fade tell). BUT `springs.snappy` (stiffness 500) overshoots scale on a high-frequency utility overlay — reads slightly bouncy vs the crisp open expected; and NO `useReducedMotion` guard, so it animates regardless of OS setting unless the consumer mounts MotionProvider (framer default reducedMotion="never"). Studio already ships `withReducedMotion()`/`useReducedMotion` used by sheet/spinner — this opts out. |
| state-coverage | gap | hover/focus/active/disabled/checked/selected/open/closed all deliberately styled + storied. Missing: loading/pending item state (menus host async actions), and no empty-menu story. |
| content-resilience | ✓ | `min-w-0 truncate` on SubTrigger + RadioItem labels; portal + Radix collision-aware positioning; long labels degrade gracefully. RTL supported by Radix DirectionProvider but chevron mirroring is undemonstrated (see a11y). |
| theming-resilience | ✓ | All color via semantic tokens (surface-overlay/raised/border/fg, error-11), survives accent-9 swap; role-radius honors [data-shape]; overlay tier reads correctly in both themes (no sunken recess to invert — safe from the segmented dark-track class of bug). |
| system-cohesion | ✓ | Shares DS radius roles, surface tiers, shared springs/tweens from lib/motion, ease-productive-standard + duration-fast-01 hover transitions, useControllableOpen with siblings. Feels like one system. |
| craft | ✓ | select-none, cursor-default (menu convention), inset prop for aligned label/item indentation, ItemIndicator absolute-positioned check/radio, shortcut auto-pushed with ml-auto. Quiet details handled. |
| perceived-performance | ✓ | Instant hover/focus color shift (70ms tween on transform/opacity only, HW-accel); AnimatePresence exit; portal-mounted so no layout shift on the trigger. |
| market-benchmark | ✓ (PARITY) | It IS Radix + DS tokens + a motion layer. Matches Radix on the a11y/keyboard/positioning core. Slightly behind Radix-idiomatic setups only on the reduced-motion guard (self-inflicted by adding animation) and behind Base UI Menu on a couple of newer affordances (below). |
| cross-ds-adoption | gap | Concrete importable patterns exist — see below. |

## Top gaps (prioritized)
- [P1] motion — no `useReducedMotion` guard on Content/SubContent → animates against OS setting in a bare app. Fix: gate `transition` to `{ duration: 0 }` when reduced, mirroring sheet.tsx.
- [P1] accessibility — `outline-hidden` + background-only focus has no `forced-colors:` outline fallback → focused item can vanish in Windows High Contrast. Fix: add `forced-colors:focus:outline forced-colors:focus:outline-2` on Item/SubTrigger/Checkbox/Radio.
- [P2] motion — `springs.snappy` overshoots scale on a frequent action menu. Fix: consider a tween or tighter-damped spring for the panel scale.
- [P2] state-coverage/testing — no interaction tests for checkbox/radio/submenu, no loading-item story. Fix: add play tests + a pending-item story.
- [P2] accessibility — no RTL story; SubTrigger chevron not asserted to mirror. Fix: RTL story + confirm `ml-auto` + chevron flip.
- [P3] visual-integrity — magic numbers `min-w-[8rem]` (×2) and `h-2 w-2` radio dot. Fix: map to spacing/size tokens.
- [P3] api — drop `React.FC` on root + Sub for family consistency.
- [P3] docs — note the overlay surface + reduced-motion dependency; update "Defaults: none".

## What it does well
- Textbook compound: every part slot-based, `asChild` polymorphism, no bespoke corner-props.
- Controlled/uncontrolled bridged correctly with no double-source-of-truth; onOpenChange fired.
- Single edge treatment (shadow-floating, no border) — zero edge-soup.
- All semantic tokens, role-radius, shared springs — high system cohesion.
- Overflow-safe labels (`min-w-0 truncate`), inset alignment, ItemIndicator craft.

## Cross-DS adoption ideas
- Base UI Menu ships a first-class `disabled`/`closeOnClick={false}` per-item contract and typed `render` prop polymorphism — our per-item control relies on `event.preventDefault()` convention (documented, but less discoverable).
- Radix/Base UI expose an explicit `loop` prop for keyboard wrap-around at list ends; we inherit Radix's default but don't surface it — worth documenting.
- cmdk/Command-style typeahead is present via Radix, but neither our stories nor docs demonstrate it — a "type to jump" story would sell an existing strength.
- Base UI's menu supports a built-in `sideOffset`/`alignOffset` + arrow element; we expose sideOffset (default 4) but no arrow — consider an optional pointer for menus anchored far from their trigger.

## Rebuild note
Polish, not rebuild. The primitive foundation (vendored Radix) and composition are correct and best-in-class; nothing structural to redo. Scope: (1) add a local `useReducedMotion` guard to both panels; (2) add `forced-colors:` focus outline fallback across item types; (3) tokenize the two magic numbers; (4) reconsider the entrance spring for this high-frequency surface; (5) add interaction/RTL/loading stories + tests; (6) drop `React.FC` and expand the doc. All in-place edits — an afternoon, not a rebuild.
