# composed/avatar-group — finish-bar audit
Finish: 2/5   Market: LAGS (Vercel/Geist Avatar.Group)   Rebuild: polish

_Prior baseline (2026-07-01): 2/5. Re-verified against current source — some fixes landed (per-component doc now exists; `hover:scale-105` removed; `transform` dropped from the spotlight transition), but the two P0s that pinned the score — no reduced-motion guard and no focus-visible ring on the focusable group — are unchanged._

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells (no accent rail/gradient/emoji/glow); radius uses role token `rounded-pill` throughout — clean. But magic numbers (`text-[9px]` :105, raw-px `overlapPxMap` 8/10/12/16/20 :129, off-namespace `h-1 w-1`…`h-3 w-3` dot sizes :113), a dead indicator ternary (both `lead` and `admin` → `bg-accent-9`, :222-223), and two overlapping top-right decoration systems (group `indicator` vs Avatar `badge`). |
| accessibility | ✗ | **P0.** Group is `tabIndex={0}` `role="group"` (:153-155) with **no focus-visible ring** — focusing it only shifts avatars (WCAG 2.4.7 fail). Per-avatar `TooltipTrigger asChild` wraps a **non-focusable `<div>`** (:237) → member names are hover-only, unreachable by keyboard/AT. Indicator dot conveys role with no SR text. No `touch-target` util (xs/sm avatars < 44px). No roving tabindex / arrow nav. |
| api-composability | gap | `forwardRef` + `displayName` present; `ReactNode` on `indicator`/`renderAvatar`. But: `onOverflowClick` is DOM-ish, no `expanded`/`onExpandedChange` controlled model; `renderAvatar` render-prop where an `AvatarGroup.Item` slot / `asChild` belongs; domain roles (`lead`/`admin`/`client`) baked into a DS primitive's API off the canonical color axis; loose `Record<string,string>` maps (:24,:103,:113) defeat the `AvatarRing`/`AvatarSize` unions; local `avatarSizeVariants` CVA (:30-46) duplicates `avatarVariants` instead of composing `<Avatar>`. |
| docs-dx | gap | Doc now exists with Props/Types/Defaults/Example/Composability/Gotchas. But doc changelog (:59) says `lead`=warning / `admin`=accent dot and story copy says "small yellow dot" — source paints both `bg-accent-9` (contradiction + dead branch). |
| testing | gap | `describeConformance` + overflow/indicator/border/ring/renderAvatar coverage — solid. Missing: `vitest-axe` play test, keyboard/tooltip interaction assertion, reduced-motion. |
| motion | ✗ | **P0.** No `useReducedMotion`/`motion-reduce` anywhere — signature hover/focus spread is inline `style.transform` invisible to MotionConfig; indicator `springs.snappy` (:218) unguarded. Off-token `duration-300 ease-out` ×3 (:147,:261,:276) — 300ms not a `--duration-*` value, `ease-out` is the framework default not a DS easing. Inconsistency: avatar wrappers only `transition-opacity` so the translateX spread **snaps instantly**, while the `+N` badge (`transition-[transform,opacity]` :276) animates smoothly. |
| state-coverage | gap | Hover/spotlight/z-stack designed. But no empty guard (`users=[]` → empty focusable group labelled "0 team members"), no `max<=0` clamp, no group-level loading, and (see a11y) no focus-visible state. |
| content-resilience | gap | Overflow `+N` with name list in tooltip — good. But `-ml-*` physical margins + `translateX` are not RTL-aware (logical props / mirrored direction absent; `expandDirection` is manual); `aria-label` "N team members" is hardcoded English (not i18n-able). |
| theming-resilience | gap | Semantic tokens (accent/warning/info/success) survive an accent-9 swap; pills honor shape intent. But `groupRingMap` hardcodes `ring-offset-surface-raised` (:25-27) regardless of the `borderColor` prop — with `borderColor="surface-base"` the ring offset references the wrong surface → seam. |
| system-cohesion | gap | Shares `springs`, `rounded-pill`, semantic tokens with siblings. Drifts on: duplicate size CVA vs canonical `avatarVariants`; off-token 300ms/ease-out vs siblings' duration/easing tokens; **missing reduced-motion while skeleton/spinner/charts carry it** — the outlier. |
| craft | gap | Nice touches: deterministic `colorSeed` fallback, z-index stacking, spotlight dim of non-hovered peers, `expandDirection` for right-aligned rows. Undercut by the transform snap, ring-offset mismatch, and dead ternary. |
| perceived-performance | ✓ | Instant feedback; transform-based spread = no layout shift/CLS; `AvatarImage` handles its own load-in. No jank under load. |
| market-benchmark | LAGS | Feature-rich vs MUI/Geist (hover-expand, per-user rings, indicators, overflow tooltip). But **lags Vercel/Geist + Radix on the fundamentals**: keyboard-reachable member names, focus-visible, and reduced-motion — table stakes those peers ship. |
| cross-ds-adoption | gap | See ideas below — `total`/`renderSurplus`, keyboard-accessible member popover, delayed-fallback. |

## Top gaps (prioritized)
- [P0] accessibility — focusable group (`tabIndex=0`) has no focus-visible ring; per-avatar tooltips sit on non-focusable `<div>` triggers (names unreachable by keyboard/AT) → add `focus-ring` util to the container, and make each avatar wrapper a real focusable trigger (`<button>`/`tabIndex` + `asChild` on a focusable node) so tooltips work on keyboard.
- [P0] motion — no reduced-motion path on any animation → gate the spread/spotlight behind `useReducedMotion()` + `motion-reduce:transition-none`, and drive the spread with framer `animate={{ x }}` so MotionConfig governs it.
- [P1] motion/craft — spread snaps (avatars `transition-opacity` only) while `+N` badge animates → unify: transition transform on both (or animate both via framer), on `--duration-*` tokens + a DS easing, not `duration-300 ease-out`.
- [P1] visual/docs — dead indicator ternary (`lead` and `admin` both `bg-accent-9`) contradicts doc + story ("yellow"/warning) → give `admin` `bg-warning-9` (or fix copy) and kill the dead arm.
- [P1] api — dedupe `avatarSizeVariants` against canonical `avatarVariants`; tighten the three `Record<string,string>` maps to `Record<Exclude<AvatarRing,'none'>,string>` / `Record<AvatarSize,string>`.
- [P2] state — short-circuit empty `users` and clamp `max>=1`; the empty focusable "0 team members" group is a real edge bug.
- [P2] visual — replace `text-[9px]` with a `text-ds-2xs` token; derive `overlapPxMap` from the same spacing token as the `-ml-ds-*` overlap; move dot sizes off raw `h-1/h-2` onto ds spacing.
- [P2] theming — offset the ring against the active `borderColor` surface, not hardcoded `surface-raised`.

## What it does well
- Composes `ui/Avatar` for the displayed avatars (not re-rolled) with deterministic `colorSeed` fallback colors.
- Clean radius discipline — `rounded-pill` role token everywhere, zero `rounded-ds-*`/`rounded-full` (no release-gate blocker).
- Rich, well-documented feature surface: overflow `+N` with a name-list tooltip and optional `onOverflowClick` button, per-user role rings, animated indicator, `expandDirection`/`expandAmount`, `borderColor` surface-blend opt-in.
- Strong story + unit coverage (`describeConformance`, overflow, indicator variants, border, ring, renderAvatar).
- Transform-based spread = no CLS; overflow badge is a real `<button>` (aria-label) when clickable, `role="img"` otherwise.

## Cross-DS adoption ideas
- **MUI AvatarGroup** exposes `total` (known count independent of the array) and `renderSurplus` — we compute `+N` only from `users.length - max`; a `total` prop would let consumers show "+240" without passing 240 objects.
- **Vercel/Geist + Radix** make the whole stacked group keyboard-navigable and pair the surplus chip with a focusable member popover — we should make `onOverflowClick` open a real focusable member list (Popover/Sheet) and make each avatar a focusable tooltip trigger.
- **Radix Avatar** has a `delayMs` before showing the fallback (avoids the initials flash before an image paints) — worth threading through for image-heavy groups.
- **Ark/React-Aria** rosters expose the group as a labelled list of individually-named items to AT — replace the count-only `aria-label` with per-member accessible names.

## Rebuild note
Polish, not rebuild. The structure is sound — it composes `Avatar`, uses `forwardRef`, role-token radius, semantic tokens, and has real tests + docs. Everything blocking the score is in-place fixable: add a reduced-motion path and a focus-visible ring (the two P0s), make per-avatar tooltip triggers keyboard-focusable, unify the spread animation onto motion tokens, dedupe the shadow `avatarSizeVariants` CVA, fix the indicator color contradiction, tighten the loose `Record` maps, and guard the empty/`max<=0` edges. No structural teardown needed; a focused polish pass clears the a11y/motion P0s and lifts this to a 4.
