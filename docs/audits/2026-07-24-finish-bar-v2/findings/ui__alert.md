# ui/alert — finish-bar audit
Finish: 4/5   Market: PARITY (shadcn Alert / Geist Note)   Rebuild: polish

Inline feedback block: colored auto-icon + optional title + body + optional dismiss, `role="alert"`, exit animation via `AnimatePresence`. Solid foundation, canonical axes, semantic tokens throughout, no slop tells. Held at 4/5 by a cluster of polish gaps — a sub-bar dismiss touch target, persistent doc drift (phantom `icon` prop), an inert entrance, and `subtle`-vs-`soft` vocabulary drift. No P0, no ✗ axis.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No accent rail / gradient / glow / emoji / pill-spam. No shadow → no edge-soup. `rounded-surface` + `rounded-control-inner` role tokens (clean). Minor: `gap-ds-04` (md) is off the ds-03/05/07 cadence. |
| accessibility | gap | `role="alert"` correct; dismiss is real `<button type="button">` w/ `aria-label`, focus-visible ring-2 + `ring-accent-9`, hover, `active:scale-95`. **But dismiss target = `min-h/w-ds-xs` = 24px**, below the DS 44px bar; `touch-target` util (utilities.css:187) exists and is unused. Solid-variant body contrast deliberately guarded (comment + `variant!=='solid'`). |
| api-composability | gap | Canonical `variant`/`color`/`size`, `forwardRef`+displayName, `Omit<HTMLAttributes,'color'>`. Gaps: variant `subtle` diverges from DS `soft`; `title` is `string` (not ReactNode — no link/bold); visibility is internal-only (no controlled `open`/`onOpenChange`); no `icon` override prop despite docs; `any` in `ALERT_ICONS: Record<string, ForwardRefExoticComponent<any>>`. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas. **Drift persists:** alert.md:27 + :36 advertise a "custom `icon` prop to override" that does not exist in source — flagged in the 2026-07-01 baseline, still unfixed. Source wins → false API in the doc. |
| testing | ✓ | `describeConformance` (all variant×size×color), role/title/dismiss-present/dismiss-absent/callback-timing; `play` test on Dismissible. Good coverage. |
| motion | gap | Entrance **inert**: `initial={{opacity:1,y:0}}` === `animate`; only exit animates (`opacity:0,y:-8`, `springs.snappy`). Transform/opacity only (HW-accel), press feedback on dismiss. No local `useReducedMotion` guard — relies on consumer `MotionProvider` (house-consistent w/ Card, but siblings notification-center/badge-indicator/bottom-navbar guard locally). |
| state-coverage | ✓ | Default + 5 colors × 3 variants; dismiss hover/active/focus-visible designed; error is a color. No disabled/loading/empty states apply. |
| content-resilience | ✓ | `flex-1 min-w-0` content wrapper, `shrink-0` icon+button → long text wraps, no overflow blowout. Vertical `mt/mb-ds-01` unaffected by RTL; row flex mirrors naturally; no directional arrows to mirror. |
| theming-resilience | ✓ | Radix-style semantic steps (`info-3/7/11`, `-9/-fg`) invert cleanly light↔dark; `neutral` subtle uses `bg-surface-raised` (visible on near-black). Radius role tokens honor `[data-shape]`. Dismiss ring `accent-9` survives brand swap. No sunken-track vanish. |
| system-cohesion | ✓ | Shares `springs.snappy`, radius roles, focus-ring pattern, ds spacing with siblings. One drift: `subtle` vs DS `soft` naming (see api). |
| craft | ✓ | `mt-ds-01` optical nudge aligns icon to title baseline; `min-w-0` truncation guard; documented solid-variant contrast fix; `shrink-0` on icon+button. Small, felt details. |
| perceived-perf | ✓ | Instant feedback; inert entrance avoids mount CLS. Minor: exit animates y/opacity not height, so sibling reflow snaps when the node unmounts. |
| market-benchmark | ✓ (PARITY) | vs shadcn Alert: leads on dismiss + motion + a11y announce + color system; lags on compound slots / `asChild`. vs Geist Note: parity. Overall PARITY — the 44px miss + inert entrance keep it from LEADS. |
| cross-ds-adoption | ✓ | Ideas below. |

## Top gaps (prioritized)
- [P1] accessibility — dismiss button is 24px (`min-h/w-ds-xs`), below the DS 44px bar → apply the existing `touch-target` util (keeps the 24px visual glyph, expands the hit area). Meets WCAG 2.2 minimum but not the house bar.
- [P1] docs-dx — alert.md still advertises a non-existent `icon` override prop (lines 27, 36) → either delete the two sentences or ship a real `icon?: IconInput` slot wired through `ALERT_ICONS` (+ story/test). Baseline flagged this on 2026-07-01; still open.
- [P2] motion — entrance is inert (`initial === animate`) → mirror the exit (`initial={{opacity:0,y:-8}}`) so event-driven alerts get feedback, or document the deliberate suppression in JSDoc.
- [P2] api-composability — `title?: string` is limiting and `ALERT_ICONS` is typed `Record<string, …<any>>` → widen title to `ReactNode`; re-type the map to a color-union key with a non-`any` icon type.
- [P2] api-composability — `subtle` variant name diverges from the DS `soft` convention → consider a `soft` alias (deprecate `subtle`, never hard-rename — narrowing/rename is breaking).

## What it does well
- Zero slop tells: no accent rail, gradient text, glow/glass/blob, emoji, or pill-spam; single edge treatment (no border+shadow soup).
- Radix-style semantic color scales that invert correctly in dark mode; `neutral` uses `surface-raised` so it never vanishes on near-black.
- Deliberate, documented solid-variant body-contrast handling (`variant!=='solid'` mute guard) — a real accessibility catch most DS alerts miss.
- `role="alert"` + real `<button>` dismiss with `aria-label`, focus-visible ring, hover, and press-scale.
- Radius role tokens throughout → clean under `[data-shape]` presets; passes the release-only radius-role gate.
- Strong test coverage (conformance across the full matrix + interaction play test).

## Cross-DS adoption ideas
- **shadcn/Radix** — optional compound slots (or `asChild` on the container) for a rich-content title; here `title` is string-only. Keep the flat default, add escape hatches.
- **Sonner / Geist Note** — an `action` slot (e.g. a "Retry" / "Undo" button) is the single most-requested Alert feature we lack; error/warning alerts almost always want one.
- **Radix Toast** — swipe-to-dismiss on touch for the dismissible variant.
- **Geist Note** — expandable/collapsible long-body affordance for verbose system messages.
- **General** — a controlled `open`/`onOpenChange` pair so consumers can re-show or drive visibility without remounting (today `isVisible` is internal-only).

## Rebuild note
Polish, not rebuild — the structure, tokens, a11y pattern, and API shape are sound. Scope: (1) apply `touch-target` to the dismiss button; (2) resolve the doc `icon`-prop drift (delete claim or ship the slot); (3) give the entrance a real fade+slide mirroring the exit, guarded by `MotionProvider`/optional local `useReducedMotion`; (4) widen `title` to ReactNode and kill the `any` in the icon map; (5) optionally add a `soft` alias for `subtle`. All in-place, no structural change, no breaking rename.
