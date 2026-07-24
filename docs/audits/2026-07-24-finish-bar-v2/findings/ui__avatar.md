# ui/avatar — finish-bar audit

Finish: 3/5   Market: PARITY (vs Radix / MUI / Chakra Avatar)   Rebuild: polish

Source: `packages/core/src/ui/avatar.tsx` (composes `./dot`, `./skeleton`, `@primitives/react-avatar`, `springs` from `./lib/motion`). Prior baseline: `2026-07-01-ai-giveaway-polish` scored 3/5. The infinite online-pulse (baseline's top motion liability) is FIXED — status is now a static shared `Dot` with a contrast ring. But the ring-vocabulary leak, no-`asChild`, RTL hard-pins, stale docs, and unguarded mount motion all persist, and a new phantom-fade slipped in. Net still 3/5.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Radius role tokens only (`rounded-pill/-control/-none`) — clean, no radius-ds. No edge-soup, no accent rail, all semantic tokens. BUT numeric badge uses arbitrary `text-[10px] leading-[16px]` (off type ramp) + `font-bold` (rest of file is `font-semibold`); badge offsets `-right-1/-top-1/-right-0.5/-top-0.5/px-1` are Tailwind default scale, not ds cadence. |
| accessibility | gap | Strong core: status wrapper `role="img"`+`aria-label`, badge `role="status"`+label, axe-clean. BUT status/badge insets are physical (`right-0`, `-right-1`) not logical — wrong corner in RTL. No `forced-colors` consideration (badge/status legibility rides on `ring-surface-raised`). Non-interactive so no focus obligation. |
| api-composability | gap | `size`/`shape` canonical, `forwardRef`+`displayName` on all 4 parts, typed, `colorSeed` nice. BUT `ring` axis encodes app-domain names (`lead`/`admin`/`client`) in a `ui/` primitive instead of the semantic color taxonomy; `badge: number\|'dot'\|ReactNode` is a sentinel-string overload, not an `<AvatarBadge>` slot; no `asChild`/interactive on a canonically-clickable element. |
| docs-dx | gap | Doc has all sections but is materially stale: line 36 claims fallback text is `text-[9px]`/`text-ds-*`, source ships `text-body-xs`/`-body-sm`/`-body-md`/`-heading-xs`; gotcha line 50 "Online status dot pulses" is false now (dot is static). Source-vs-doc mismatch. |
| testing | ✓ | `describeConformance` + unit/RTL + `vitest-axe`; covers defaults, shape/size inheritance, deterministic color, all 4 statuses, badge number/cap/dot/custom/zero-hide, loading, ring. Missing reduced-motion / RTL / forced-colors assertions. |
| motion | ✗ | No `useReducedMotion`/`motion-safe` anywhere despite in-repo `withReducedMotion`. Badge `initial={{scale:0}}→scale:1` and AvatarImage `initial={{scale:0.96}}→{opacity:1,scale:1}` both fire on EVERY mount unguarded (30-avatar roster = wall of scale-ins). AvatarImage declares `opacity:1` in `animate` but omits `opacity:0` in `initial` → phantom fade (scales in already-opaque). |
| state-coverage | gap | image/fallback/status/badge/loading/ring all deliberately designed; loading skeleton + deterministic-initials empty are good. But zero interactive states — no hover/active/focus-visible, no way to make Avatar clickable. |
| content-resilience | gap | Badge caps `99+`, single-letter `tracking-wide`, font scales with size — good. RTL is the miss (physical insets don't mirror). Long initials would overflow but 1–2 chars is the norm. |
| theming-resilience | ✓ | Semantic tokens throughout (`accent-7`, `error-9`, `surface-raised`); shape via role tokens honors `[data-shape]`; survives accent swap; dark badge (`error-9` + `ring-surface-raised`) holds. Ring-offset hardcoded to `surface-raised` (documented gotcha). |
| system-cohesion | gap | Composes `Dot` + `Skeleton` primitives, uses `springs` presets + role radius + ds spacing — cohesive. Lone drift: `ring` domain vocabulary breaks the DS's `accent/success/warning/error/info` taxonomy. |
| craft | ✓ | Deterministic djb2 fallback color, size-scaled status dot, `withBorder` contrast ring on busy grounds, single-vs-multi-letter tracking, context-cascaded shape+font to fallback. Genuinely thoughtful unseen details. |
| perceived-perf | ✓ | Loading skeleton, fixed sizes (no CLS), fallback is instant. Mount scale-ins add negligible perceived delay. |
| market-benchmark | PARITY | Leads Radix (pure primitive — we add status/badge/ring/loading/fallback-color + an `AvatarGroup` in `composed/`). Lags MUI Badge on `anchorOrigin`/`overlap` placement control + RTL-aware badge; lags MUI/Chakra on badge mirroring. |
| cross-ds-adoption | gap | Concrete imports available (see below) — badge placement, load-status callback, group overflow polish. |

## Top gaps (prioritized)
- [P0] motion — Two default-on mount animations with no reduced-motion guard + AvatarImage phantom fade (`initial` omits `opacity:0`, so the declared opacity transition is a no-op; only scale runs). → Wrap both in `useReducedMotion()` (render static when preferred); either add `opacity:0` to AvatarImage `initial` to make the fade real, or drop the `opacity` target and keep only the scale honestly. Swap the per-mount scale for a load-triggered fade in rosters.
- [P1] api/cohesion — `ring: 'lead'|'admin'|'client'` leaks app-domain roles into a `ui/` primitive. → Rename to the semantic color taxonomy (`ring?: 'accent'|'warning'|'info'|…`) with the role→color map living in a `composed/` wrapper; stage `lead/admin/client` as deprecated aliases (rename = breaking).
- [P1] docs-dx — Doc fallback-text table and the "status dot pulses" gotcha both contradict source. → Regenerate against source: `text-body-xs/-body-sm/-body-md/-heading-xs`; delete the pulse gotcha.
- [P1] a11y/content — Status + badge use physical `right`/`-right` insets → wrong corner in RTL. → Switch to logical insets (`end-0`, `-end-1`, `-top-1` is fine vertically) so they mirror.
- [P2] visual — Numeric badge `text-[10px] leading-[16px] font-bold`. → Use a type token (`text-ds-2xs` or smallest defined) + `font-semibold` to match the file.
- [P2] api — `badge` sentinel-string union + no `asChild`. → Offer an `<AvatarBadge placement>` slot (mirror `<CardAction>`) and thread `asChild` via Slot so Avatar can *be* the profile link, coordinating the focus-visible ring to the shape.

## What it does well
- Fixed the baseline's worst liability: online status no longer pulses infinitely — it's a static `Dot` with `withBorder` contrast ring and proper `role="img"`+`aria-label`.
- Deterministic djb2 fallback color from `colorSeed`/initials — stable across renders, solid `bg-*-3`/`text-*-11` pairs, no gradient slop.
- Context-cascaded shape + font size to `AvatarFallback` (no re-specifying), size-scaled status dot, single-letter tracking — real craft.
- Correctly composes vendored Radix + shared `Dot`/`Skeleton` rather than re-rolling image/fallback/skeleton logic.
- Radius role tokens only — no `rounded-ds-*`/`rounded-full` release-gate blocker.

## Cross-DS adoption ideas
- MUI `Badge` — `anchorOrigin` + `overlap="circular"` give consumers placement control; our badge is hard-pinned top-right. Add a `placement` on an `<AvatarBadge>` slot and make it RTL-aware (logical insets).
- Radix Avatar — `onLoadingStatusChange`/`delayMs` expose real load state; our `loading` is a manual boolean. Surface the primitive's load status so the skeleton can auto-clear on image load instead of consumer-managed.
- Chakra/Ant AvatarGroup — we have `composed/avatar-group`; steal their `max` + "+N surplus" overflow chip and stacked ring-offset overlap polish if not already present.

## Rebuild note
Polish, not rebuild — the structure (Radix + Dot + Skeleton composition, context cascade, CVA axes) is sound and best-in-class-adjacent. In-place fixes: (1) reduced-motion sweep + fix the AvatarImage phantom fade [P0]; (2) rename `ring` to semantic colors with deprecated aliases + relocate role map to `composed/` [P1]; (3) regenerate the stale doc [P1]; (4) logical insets for RTL [P1]; (5) tokenize the badge label + add an `<AvatarBadge>` slot and `asChild` [P2]. No API-breaking teardown required beyond the staged `ring` rename.
