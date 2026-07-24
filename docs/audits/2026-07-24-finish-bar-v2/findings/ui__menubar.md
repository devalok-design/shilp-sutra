# ui/menubar — finish-bar audit
Finish: 3/5   Market: LAGS(shadcn/Radix Menubar)   Rebuild: polish

Vendored-Radix horizontal app-menu compound (File/Edit/View). Zero raw visual slop
tells, well-tokenized, a11y-clean via Radix. But every gap the 2026-07-01 baseline
flagged is **still open in source** — the 0.49/0.50/0.52 waves never touched this file.
The problems are family-vocabulary drift from its own documented sibling (DropdownMenu),
a JS-spring sub-content that ignores reduced-motion, and dead/confused draft comments
shipped in source.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Surface layering correct (`bg-surface-overlay` panels, `shadow-raised`/`shadow-floating` single edge each — no edge-soup). Radius role tokens (`rounded-overlay`/`rounded-control`) — no `rounded-ds-*`/`rounded-full`. Tells: `min-w-[8rem]` (:138) + `min-w-[12rem]` (:180) arbitrary widths, and radio dot `h-2 w-2` hardcoded (:248) escaping the `ico-*` token system. |
| accessibility | ✓ | Real `role="menubar"`/`menuitem` via Radix, roving arrow nav between menus, `data-disabled` + `opacity-action-disabled`, `outline-hidden` paired with `focus:`/`focus-visible:` bg replacement, axe-clean test (:152). `forced-colors` relies on global (acceptable). Menu-item pattern doesn't require 44px targets. |
| api-composability | gap | Clean slot compound; `MenubarSub` implements controlled+uncontrolled correctly (:37-60). But `MenubarMenu` (:16-32) is a no-op passthrough wrapping 4 paragraphs of stream-of-consciousness draft comments — should be a bare primitive re-export. `MenubarMenu`/`MenubarSub` typed `React.FC` (rubric I). No hard breaks; `forwardRef`+`displayName` everywhere. |
| docs-dx | gap | Doc mostly matches source; `Changes` stale at v0.18.0 (framer/CSS motion behavior undocumented). Doc claims controlled-open `value`/`onValueChange` on Root — plausible (Radix) but muddied by the code's confused comments. |
| testing | gap | Unit + RTL + axe + checkbox-fires + disabled + shortcut + className-merge. No `describeConformance`; no radio-group, sub-menu, or `inset` coverage. |
| motion | ✗ | Two systems for one gesture: `MenubarContent` uses CSS `animate-popover-in/out` (:181); `MenubarSubContent` uses a framer `springs.snappy` scale-pop (:132-136) that is **NOT reduced-motion guarded** — the global CSS `prefers-reduced-motion` reset can't reach framer's JS spring, and `withReducedMotion` (lib/motion.ts:58) exists but is unused. Items + trigger use bare `transition-colors` with no `duration-*`/`ease-*` token (default UA timing). |
| state-coverage | gap | Items keyed on `focus:` only — no `hover:` and no `active:` pressed feedback (sibling DropdownMenu has both). Focus-follows-pointer makes mouse hover mostly work, but checkbox/radio rows and pressed states read flat. Disabled handled. |
| content-resilience | gap | `MenubarSubTrigger`/`MenubarRadioItem` truncate (`min-w-0 truncate`), but `MenubarItem` does NOT — long labels can overflow. `IconChevronRight` on SubTrigger (:112) has no RTL mirroring (`rtl:rotate-180`/logical icon) — points the wrong way in RTL. |
| theming-resilience | ✓ | All semantic tokens; survives accent-9 swap; role radius honors `[data-shape]`; `surface-overlay` defined light+dark (no elevation-inversion vanish — panels sit above page, not sunken). |
| system-cohesion | ✗ | Documented (doc:34) to share DropdownMenu's item vocabulary, yet drifts on exactly that: missing `hover:`/`active:` states, missing `duration-fast-01 ease-productive-standard` tokens, dual animation systems, `h-2 w-2` dot. Verified against dropdown-menu.tsx:221/237/261 — sibling has the full string, Menubar doesn't. Bespoke drift within a family that's meant to be uniform. |
| craft | gap | `cursor-default select-none` correct; partial truncation. Undercut by shipped draft comments (:16-32, :151-159), hardcoded radio dot, no RTL chevron. |
| perceived-perf | ✓ | Portal-rendered, transform/opacity-only animation (HW-accel), no layout shift, instant open on trigger. |
| market-benchmark | LAGS | vs Radix/shadcn Menubar: a11y + keyboard at parity (it IS vendored Radix), but shadcn's menubar gives items `hover:` bg and drives every surface through one unified `data-[state]` CSS animation. We lack item hover and split into CSS+framer. Behind on finish, not capability. |
| cross-DS-adoption | gap | See ideas below. |

## Top gaps (prioritized)
- [P0] motion — framer `MenubarSubContent` scale-pop ignores `prefers-reduced-motion` (JS spring, CSS reset can't reach it) → guard with framer `useReducedMotion()` + `withReducedMotion`, OR (preferred) convert SubContent to the same CSS `animate-popover-in/out` path as Content — fixes the reduced-motion miss AND the dual-system divergence at once.
- [P1] system-cohesion — copy DropdownMenu's exact item class string into `MenubarItem`/`MenubarCheckboxItem`/`MenubarRadioItem`/`MenubarSubTrigger`: adds `hover:bg-surface-raised`, `active:bg-surface-raised-hover`, `duration-fast-01 ease-productive-standard`. Also add those two motion tokens to `MenubarTrigger`. Closes state-coverage + item motion in one move.
- [P1] api-composability — collapse `MenubarMenu` to `const MenubarMenu = MenubarPrimitive.Menu` and delete the draft comment blocks (:16-32, :151-159); drop `React.FC` typings.
- [P2] content-resilience — add `rtl:rotate-180` (or logical chevron) to `MenubarSubTrigger`'s icon; wrap `MenubarItem` children in `min-w-0 truncate`.
- [P2] visual-integrity — tokenize radio dot (`h-2 w-2` → `ico-*`/sized `<Icon>`); consider a spacing/size token for the `min-w-[8rem]`/`[12rem]` widths.
- [P2] docs-dx/testing — add stories (WithCheckboxAndRadio, WithSubmenu, Inset, RTL); refresh `Changes` section; add `describeConformance`.

## What it does well
- No visual slop: no accent rail, no gradient text, no glow/glass/blob, no emoji, no pill-spam; single radius vocabulary; correct overlay surface layering.
- Correct controlled/uncontrolled implementation on `MenubarSub` (`open`/`defaultOpen`/`onOpenChange`).
- Real menubar semantics + keyboard nav + axe-clean; `forwardRef`+`displayName` on every part.
- `springs.snappy` is bounce-free (no gratuitous overshoot); Content exit handled cleanly via CSS.
- Composes the vendored primitive rather than re-rolling surfaces/shadows.

## Cross-DS adoption ideas
- **shadcn Menubar** drives all open/close (root menus AND sub-menus) through one `data-[state]` CSS animation set — adopt to kill our CSS/framer split and get reduced-motion for free.
- **Base UI Menu** ships built-in typeahead (type to focus item) and first-class hover intent — we rely on Radix defaults; worth confirming typeahead is wired and adding explicit hover states.
- **Radix `dir` / RTL**: mirror the sub-trigger chevron via logical direction rather than a static `IconChevronRight`.

## Rebuild note
Polish, not rebuild — the structure (Radix compound, slots, controlled Sub, surface tokens) is correct. The whole gap list is class-string unification with the DropdownMenu sibling + one motion decision (guard the framer spring or move SubContent to CSS) + deleting draft comments + a few token swaps. Scope is roughly the 7-step plan the 2026-07-01 baseline already wrote; it simply never shipped. Effort: ~1 focused pass across menubar.tsx + stories + doc, mirroring dropdown-menu.tsx line-for-line.
