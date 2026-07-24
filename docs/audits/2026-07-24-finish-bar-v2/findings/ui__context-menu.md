# ui/context-menu — finish-bar audit
Finish: 3/5   Market: LAGS(Radix / own DropdownMenu twin)   Rebuild: polish

A thin, well-behaved wrapper over the vendored Radix `react-context-menu` primitive.
Inherits Radix's excellent a11y and keyboard model for free, uses DS role tokens
throughout (no slop tells), and has correct differentiated motion (spring for scale,
tween for opacity, entrance + exit). The problem is it is the **less-finished twin of
`dropdown-menu.tsx`**: the two menus are built from the same primitive but have drifted,
and ContextMenu is missing the item-level polish Dropdown already ships — icon gap, SVG
auto-sizing, long-label truncation, and hover/active color transition. That drift is the
core finding, and it produces a real content-overflow defect on long labels.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Role tokens clean (`rounded-control`/`rounded-overlay`, `bg-surface-overlay`, `shadow-floating` single-edge, ds spacing). No slop tells. One arbitrary `min-w-[8rem]` (SubContent, l.115) — matches Dropdown but off-cadence. |
| accessibility | ✓ | Radix primitive: correct menu ARIA, roving tabindex, arrows/Home/End/type-ahead, `dir` support, long-press→right-click on touch. axe-clean test present. disabled → `pointer-events-none` + `opacity-action-disabled`. Focus highlight IS the roving indicator (menu-correct). Minor: item height (`py-ds-02b`) below 44px touch-target; no explicit forced-colors. |
| api-composability | gap | Thin pass-through, `forwardRef` + displayName on all rendered parts, `Content`/`Item` prop types exported, Sub controlled+uncontrolled correct. But `inset` boolean is a manual `pl-ds-07` crutch (shadcn carry-over) not a structural leading slot; no shared class module with Dropdown → drift; no truncate/svg slot so an icon+label item behaves differently from the identical DropdownMenuItem. |
| docs-dx | gap | Doc accurate but compound list omits `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal` (all exported/used). No Props/Types tables. Good gotchas (trigger has no affordance, touch long-press, z-popover). |
| testing | gap | Unit + RTL + vitest-axe; covers open/select/checkbox/radio/sub/disabled/shortcut/label. No `describeConformance`, no keyboard-nav or RTL test, no disabled/states story. |
| motion | gap | `springs.snappy` (stiff 500 / damp 30 → bounce-free) + `tweens.fade` opacity — differentiated, HW-accel (scale+opacity), interruptible, entrance+exit via AnimatePresence+forceMount. Gaps: no in-component reduced-motion guard (`withReducedMotion` unused; relies on consumer `<MotionProvider>`); scales from center 0.95, not origin-aware from the pointer/corner. |
| state-coverage | gap | disabled deliberate. But Item has ONLY `focus:bg-surface-raised` — no `hover:`, no `active:`/pressed, no `transition-colors`, unlike Dropdown's `hover:bg + active:bg-surface-raised-hover + transition-colors duration-fast-01`. (Radix routes hover→focus so mouse-hover is functionally tinted, but there's no distinct pressed state or color easing.) empty/loading N/A. |
| content-resilience | ✗ | No `min-w-0 truncate` child wrapper (Dropdown l.133/271 has it) → a long label overflows the panel. No `[&_svg]` sizing so an item icon renders un-normalized. Sub-trigger `IconChevronRight` (l.89) does not mirror glyph under RTL (Radix flips positioning via `dir`, not the chevron itself). |
| theming-resilience | ✓ | Semantic surface/accent tokens + role radius → survives accent-9 swap and `[data-shape]`. Panel is `surface-overlay` (elevated, not a sunken recess) → no dark-mode elevation-inversion risk. |
| system-cohesion | ✗ | Shares spring/radius/spacing/focus vocabulary with siblings BUT has drifted from its own twin DropdownMenu: divergent item class strings (no `gap-ds-03`, no `[&_svg]` block, no truncate, no hover/active/transition). Two menus from one primitive that behave differently = "voices not in tune." |
| craft | gap | `cursor-default` + `select-none` correct for a menu. Indicator rows (`h-ico-sm w-ico-sm`, absolute left-ds-03) tidy. Missing the sibling's `shrink-0` svg guard and color-transition micro-polish. |
| perceived-performance | ✓ | Instant open on right-click; fast interruptible spring; portal + forceMount; no layout shift. |
| market-benchmark | LAGS | Behaviorally at Radix parity (it IS Radix). But vs the best-in-class menu (Radix/Base UI/shadcn reference) AND our own DropdownMenu, it lags on content resilience (truncate), item transitions, and origin-aware animation. |
| cross-DS-adoption | gap | See ideas below — origin-aware transform, item transitions, virtualization all absent. |

## Top gaps (prioritized)
- [P1] content-resilience — no `min-w-0 truncate` wrapper → long labels overflow; no `[&_svg]` sizing → un-normalized item icons. Fix: port Dropdown's `<span className="min-w-0 truncate">` child wrapper + `[&_svg]` block.
- [P1] system-cohesion — item/sub-trigger classes duplicated-and-drifted from DropdownMenu. Fix: extract one shared `lib/menu-classes.ts` (`menuItemClasses`, `menuSubTriggerClasses`, indicator-row) imported by both; auto-fixes gap/svg/truncate/hover/active in one move.
- [P2] state-coverage — Item lacks `hover:`/`active:`/`transition-colors`. Fix: mirror Dropdown's `hover:bg-surface-raised active:bg-surface-raised-hover transition-colors duration-fast-01`.
- [P2] motion — no in-component reduced-motion guard. Fix: read `useMotion().reducedMotion` (as `ai/blocks/*` do) and short-circuit to instant, or document MotionProvider as required. Mirror family-wide.
- [P2] docs-dx — add `ContextMenuShortcut`/`Group`/`Portal` to the compound tree in the doc.
- [P2] visual-integrity — `min-w-[8rem]` arbitrary value; consider a `min-w` sizing token (family-wide with Dropdown).
- [P3] api — `inset` boolean → track family-wide refactor to a structural leading-icon column.
- [P3] testing — add a Disabled/States story + an RTL sub-trigger check; consider `describeConformance`.

## What it does well
- Composes the Radix primitive directly — inherits gold-standard keyboard/ARIA/touch (long-press→context) at zero maintenance cost; doesn't re-roll anything.
- Clean token discipline: role radius (`rounded-control`/`rounded-overlay`), `surface-overlay` panel, `shadow-floating` single-edge (no border → no edge-soup), ds spacing.
- Correct differentiated motion: spring for scale + tween for opacity, entrance AND exit, bounce-free, transform/opacity only.
- Proper controlled + uncontrolled `ContextMenuSub`; `forwardRef` + displayName on every rendered part; typed prop exports.

## Cross-DS adoption ideas
- **Radix/Base UI origin-aware transform:** Radix exposes `--radix-context-menu-content-transform-origin`; a context menu should scale from the pointer/corner it opened at, not from center. We scale from center 0.95 — wire the transform-origin var into the `motion.div` for a more physical open.
- **shadcn reference menu** ships per-item `transition-colors` and `focus:`/`open:` easing — our ContextMenu items snap with no easing; adopt (already in our own Dropdown).
- **Base UI / Ark long-list handling:** virtualized menu content + `max-height` with scroll for many items; we have neither (a 30-item context menu would run off-screen).
- **Structural leading-icon slot** (Radix examples, Linear menus): a shared icon column instead of the `inset` pl-crutch, so alignment is structural across item/checkbox/radio.

## Rebuild note
**Polish, not rebuild.** The structure (Radix pass-through) is right. The entire gap set collapses into one refactor: extract a shared `lib/menu-classes.ts` consumed by both ContextMenu and DropdownMenu — that single change lands truncation, SVG sizing, the icon gap, and hover/active transitions, and permanently kills the twin-drift. Then add a reduced-motion guard and origin-aware transform-origin across the menu family, and patch the doc's part inventory. No structural change, no API break; all additive.
