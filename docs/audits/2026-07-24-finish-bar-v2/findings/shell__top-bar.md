# shell/top-bar — finish-bar audit
Finish: 3/5   Market: PARITY (Carbon UI Shell / Linear / Vercel app headers)   Rebuild: polish

TopBar is a genuinely composition-first app header — zone slots (`Left`/`Center`/`Right`/`Section`), auto grid↔flex based on `Center` presence, `forwardRef`+`displayName` on every part, correct chrome-tier surface, `asChild` on the Radix triggers, and semantic tokens throughout. It carries no hard slop tells (no accent rail, gradient text, glow/glass, emoji-as-icon). Since the 2026-07-01 baseline (also 3/5) the root surface was correctly moved to the new `bg-surface-chrome` tier — but the icon-button border **regressed** from the valid `border-surface-border-strong` to `border-card-strong`, a dead class that renders no border at all. Most prior P1/P2s remain open: `TopBar.IconButton` re-rolls the canonical `IconButton` primitive, `UserMenuItem` is a data-driven config with a stringly `color`, motion has no reduced-motion guard, and badge/dot sizes are raw px.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✗ | `border border-card-strong` (top-bar.tsx:209) is a DEAD class — only `@utility border-card` exists (utilities.css:342); no `--color-card-strong`/`border-card-strong`. Icon buttons ship with **no border** (regression from `border-surface-border-strong` at 2026-07-01). Plus magic px: `w-[200px]` (293), `h-[18px] min-w-[18px] text-[10px]` (359), `h-[8px] w-[8px]` (363). Radius clean (rounded-pill/-overlay-lg role tokens, no rounded-ds-*/full). |
| accessibility | gap | Operable + labeled (aria-label from tooltip, type="button", icon aria-hidden, axe-clean test, keyboard-reachable menu) so NOT a P0/WCAG-A fail. But below our bar: 36px hit area (`h/w-ds-sm-plus`=36px, semantic.css:336) vs the DS `touch-target` 44px util (unused); `TopBar.IconButton` has **no focus-visible ring** (relies on UA outline) while UserMenu hand-rolls raw `focus-visible:ring-*` instead of the `focus-ring` utility → inconsistent focus affordance. |
| api-composability | gap | Strong compound API + refs. But `UserMenuItem.color?: string` (54) is the exact stringly-color anti-pattern, resolved via ad-hoc `colorMap` that silently falls back to muted on invalid input. UserMenu is data-driven (`userMenuItems[]`) inside a component documented as "composition, NOT data-driven"; Profile/`/profile`, color-mode toggle, logout are hardcoded/non-overridable. No item `render`/`node` escape hatch. |
| docs-dx | gap | Doc drift: states root `bg-surface-2` and IconButton `bg-surface-3/hover:bg-surface-4` (md:15,20) — source uses `bg-surface-chrome` + `bg-surface-raised-hover/-active`. Doc types `icon: ReactNode` (md:43,58); source is `IconInput`. Otherwise thorough (Props/Example/Composability/Gotchas). |
| testing | ✓ | RTL + vitest-axe; covers title, usermenu name/email, iconbutton click, navigate/onClick precedence, badges (count+dot), grid vs flex, section gap, multi-button. No describeConformance (compound), no disabled/reduced-motion/RTL coverage. |
| motion | gap | CSS-only, appropriate for chrome; custom easing + short duration (`duration-fast-01 ease-productive-standard`), transform/color HW-friendly. But `active:scale-90` is a heavy press (0.90 vs ~0.97 house) with **no `motion-reduce:` guard**; one-off timing vs the shared motion tokens Button uses. No `slide-no-fade` (no framer entrance here). |
| state-coverage | gap | hover ✓, active ✓, disabled on UserMenuItem ✓ (opacity-action-disabled + pointer-events-none), empty ✓ (NoUser story). But `TopBar.IconButton` has no disabled styling (a disabled search button still looks active) and no focus-visible; no loading state. |
| content-resilience | gap | Email middle-truncation via `TruncatedText` is a nice touch. But UserMenu is fixed `w-[200px]` and menu-item labels have no truncation (long labels overflow); many-actions has no overflow/collapse strategy (relies on manual `hidden md:flex`); `ml-auto`/px are physical not logical → RTL not first-class. |
| theming-resilience | ✓ | Semantic tokens throughout; survives accent-9 swap (focus ring), honors `[data-shape]` via radius role tokens, `bg-surface-chrome` adapts light↔dark (neutral-1/neutral-2). No elevation-inversion trap. (The missing border is a dead-class bug, captured under visual-integrity, not a theming failure.) |
| system-cohesion | gap | Re-rolls a button surface/hover/press/focus vocabulary despite a canonical `IconButton` primitive existing (ui/icon-button.tsx) — the StatCard/Card drift anti-pattern. `border-card-strong` is consistent with 10+ siblings (command-bar, command-palette, code, data-table-*, notification-center, skeletons, schedule-view) but consistently dead. Focus ring diverges from the system `focus-ring` utility. |
| craft | gap | cursor-pointer on avatar/items, email truncation, press feedback all felt. Undercut by the invisible-border bug and un-tokenized badge sizing (`text-[10px]`, `h-[18px]`). |
| perceived-performance | ✓ | Instant CSS feedback, no async, no layout shift; Avatar fallback initial renders immediately when no image. |
| market-benchmark | gap | PARITY. Composition architecture is competitive with Carbon UI Shell / Radix-style headers and cleaner than shadcn (which has no official header). Lags best-in-class app headers on: no skip-to-content link, no responsive action-overflow/kebab, sub-44 touch, inconsistent focus, no Cmd+K/breadcrumb-in-header affordance out of the box. |
| cross-ds-adoption | n/a | See ideas below. |

## Top gaps (prioritized)
- [P0] visual-integrity — `border border-card-strong` is a dead class; icon buttons render with no border (regression from valid `border-surface-border-strong`). → Change to `border-card` (the real utility) or `border-surface-border-strong`, and fix the same class across the ~11 sibling files.
- [P1] system-cohesion / a11y — `TopBar.IconButton` re-rolls the canonical `IconButton`. → Compose `IconButton` (`variant="ghost"/"soft"`, circular, `size="sm"`) + tooltip wrapper; inherits focus-ring, disabled, loading, press, reduced-motion in one move (resolves 4 gaps).
- [P1] accessibility — 36px hit area + no focus-visible ring on IconButton. → Apply `touch-target` (44px) and the `focus-ring` utility; switch UserMenu off raw `ring-*` to `focus-ring` too.
- [P1] api-composability — stringly `color?: string`. → Narrow to `'neutral' | 'success' | 'warning' | 'error' | 'info'` (ship as-is is non-breaking widen→narrow check: current is `string`, narrowing IS breaking — stage a deprecated overload or keep `string` accepted).
- [P2] api-composability — UserMenu is data-driven config; no arbitrary-node/submenu path. → Add `DropdownMenuItem` children or an item `render`/`node`, keep `userMenuItems` as convenience.
- [P2] motion — `active:scale-90` ungated + too strong. → `motion-reduce:active:scale-100` and align to ~0.97 / shared tokens (or inherit via IconButton).
- [P2] content-resilience — no action overflow, fixed-width menu, physical props. → Overflow-to-kebab below breakpoint; logical properties for RTL; truncate long menu labels.
- [P2] docs-dx — doc says surface-2/3/4 + `icon: ReactNode`. → Update to `bg-surface-chrome`/`surface-raised-*` and `icon: IconInput`.
- [P2] visual/craft — raw px badge/dot. → Compose `Badge` (count) + `Dot` primitive, or bind to `--spacing-ds-*`.

## What it does well
- True composition skeleton: zone slots + auto grid↔flex + responsive `Title`; `forwardRef`/`displayName` and correct element-specific ref types on every part.
- Correct chrome-tier surface (`bg-surface-chrome`) — properly updated to the 0.49 chrome tier since the last audit.
- No slop tells; clean semantic tokens; radius role tokens only (no radius-ds ship-blocker).
- Thoughtful details: email middle-truncation via `TruncatedText`, avatar fallback, press feedback, tooltip-derived `aria-label`.
- Solid test + axe coverage of the composition matrix.

## Cross-DS adoption ideas
- **Carbon UI Shell Header** ships a skip-to-content link + `HeaderMenuButton` that collapses nav into a mobile menu — we have neither; the header landmark should offer a skip link.
- **Linear / Vercel headers** wire a Cmd+K command palette and breadcrumb-in-header as first-class affordances; TopBar leaves search as a manual IconButton — a `TopBar.Search`/`TopBar.Breadcrumb` slot would raise the finish.
- **GitHub / Vercel** collapse overflow actions into a "more" (kebab) menu below a breakpoint instead of `hidden md:flex` per button — an overflow-aware `TopBar.Section` would remove the manual responsive burden.
- **Radix/Base** expose `asChild` on interactive parts — adding it to `TopBar.IconButton` (and `TopBar.Title` for `<h1>`/link-wrapped titles) would let consumers compose router links without className hacks.

## Rebuild note
**Polish, not rebuild** — the composition architecture is sound; every gap is an in-place fix. Priority order: (1) fix the dead `border-card-strong` P0 (one-token swap, but sweep all ~11 sibling files since it's systemic), (2) reroute `TopBar.IconButton` through the canonical `IconButton` primitive — this single change collapses the focus-ring, touch-target, disabled/loading, motion-guard, and border-drift gaps at once, (3) narrow `UserMenuItem.color` + add a composition escape hatch, (4) reconcile the doc. No structural/API-breaking change is required beyond the (staged) `color` narrowing.
