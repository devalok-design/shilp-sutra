# ui/toast — finish-bar audit
Finish: 4/5   Market: PARITY (Sonner)   Rebuild: polish

Built on Sonner (`sonner.custom` + `unstyled`), wrapping it with a typed imperative
API (`toast.success/error/warning/info/loading/message`), `toast.promise`,
`toast.undo`, a rich `toast.upload` (per-file progress/retry/remove), a hover-aware
self-dismiss timer, and a countdown timer bar. The prior baseline (2026-07-01, 2/5)
flagged a P0 colored accent rail as the AI-tell; that is now **fixed** — the rail is
off by default (`showAccent`), type is carried by the icon + status-colored timer
bar, and error toasts get a faint `bg-error-2` wash. Docs/tests were updated to match.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Accent rail removed (P0 fixed). `bg-surface-overlay` + `shadow-floating` (single edge treatment, no border), `rounded-overlay-sm` role token, semantic step colors, Tabler icons (no emoji). Two micro-dim arbitrary values remain (`max-w-[60px]`, `max-h-[140px]`). |
| accessibility | ✓ | Strong: `role` alert/status by urgency, `aria-live` assertive/polite, `aria-atomic`, sr-only live region for upload counts, labelled Retry/Cancel buttons, `focus-visible:ring-2` on action, `touch-target` on row buttons. |
| api-composability | gap | Imperative-only is correct for a toast, but `action`/`cancel` are bespoke `{label,onClick}` objects rendered as hand-rolled `<button>`s (re-rolls Button focus/typography) instead of composing the Button primitive or accepting `ReactNode`. `icon: ForwardRefExoticComponent<any>` in `TOAST_TYPE_CONFIG` (untyped). `toast.custom` is the escape hatch; message accepts `ReactNode`. |
| docs-dx | ✓ | Doc matches source (showAccent default-off + error tint documented), has API/Options/Types/Example/Composability/Gotchas/Changes. Stories cover every type + action/cancel + promise + undo + upload single/multi + custom + stacking. Only the Default story has an interaction play test. |
| testing | ✓ | Comprehensive RTL + vitest-axe (success & error), rendering per type, action/cancel, upload toast, `UploadFileRow`, timer-bar pause/duration, `formatFileSize` edge cases, undo. No `describeConformance` (N/A — imperative, not a forwardRef control). |
| motion | gap | **No component-level reduced-motion guard on the spring entrances** — only the CSS timer bar is `motion-safe:animate-timer-bar` gated; the icon/row/scale springs rely entirely on a consumer `<MotionConfig reducedMotion>`. `springs.bouncy` (damping 15, real overshoot) applied to routine status icons and every completed file row. `UploadFileRow` exit animates `height:0` (layout-driven, acceptable). Interruptible (springs, not keyframes). |
| state-coverage | ✓ | pending/uploading/processing/complete/error all designed; hover + focus pause with remaining-time preservation; loading spinner; error tint + assertive announce. Pause-on-interest is mouse+focus only (no `onPointerEnter` → touch can't hold dismiss) — minor. |
| content-resilience | ✓ | `min-w-0 flex-1 truncate` on filename, truncated error message, `max-h` scroll on file list, `ReactNode` title/description. Minor RTL gap: exit slides `x:-20` (physical, not mirrored); accent `rounded-l-*` is physical but off by default. |
| theming-resilience | ✓ | Semantic step tokens throughout (survive accent-9 swap); `rounded-overlay-sm` honors the three `[data-shape]` tiers in `semantic.css`; dark-mode overlay + `shadow-floating` + `error-2` wash hold up (no sunken-track-vanish risk — timer bar is an `opacity-30` fill). |
| system-cohesion | gap | Shares DS springs, radius roles, focus-ring, spacing tokens — but the hand-rolled action/cancel buttons drift from the Button primitive's focus/typography/soft-vs-outline vocabulary (the one bespoke voice in the file). |
| craft | ✓ | Remaining-time-preserving pause math, `AnimatePresence mode="wait"` icon morphs (spinner↔typed↔result), `tabular-nums` percentages, image-vs-file icon heuristic, `formatFileSize` NaN/negative guards, and a documented self-dismiss workaround for Sonner not resetting its timer on an Infinity→update. Thoughtful. |
| perceived-perf | ✓ | Instant show, optimistic upload progress, indeterminate spinner for processing, `layout` animation for smooth reflow, no obvious CLS. |
| market-benchmark | PARITY | Vs Sonner (the engine underneath). Leads vanilla Sonner on feature surface — typed variants, `toast.upload` with per-file progress/retry, promise orchestration, undo, countdown bar — while inheriting Sonner's stacking/swipe/positioning for free. Held to parity (not leads) by the motion self-sufficiency + action-composition gaps. |
| cross-ds | ✓ | Ideas listed below. |

## Top gaps (prioritized)
- **[P1] motion** — Spring entrances have no component-level reduced-motion guard (only the CSS timer bar is `motion-safe`-gated) → gate the icon/scale springs with framer's `useReducedMotion()` or the local `withReducedMotion()` helper so the component is self-sufficient rather than depending on a consumer `<MotionConfig>`.
- **[P1] api-composability / system-cohesion** — `action`/`cancel` re-roll Button styling → render them through the Button primitive (`variant="link"|"soft"` size sm) or accept `ReactNode`, so focus-ring/typography/soft-vs-outline come from one source.
- **[P2] api-composability** — `icon: ForwardRefExoticComponent<any>` in `TOAST_TYPE_CONFIG` → type as the Tabler `Icon` component type (matches `icon.tsx`).
- **[P2] motion** — `springs.bouncy` overshoot on routine status icons + every completed file row → reserve `bouncy` for celebratory moments (all-success), use `snappy`/`fade` for routine status; confirm if intentional.
- **[P2] state-coverage** — pause-on-interest is mouse+focus only → add `onPointerEnter/Leave` for touch-device hold.
- **[P3] visual-integrity** — `max-w-[60px]` / `max-h-[140px]` arbitrary values → promote to `--spacing-ds-*` or accept as documented fixed micro-dims.
- **[P3] content-resilience** — RTL: exit `x:-20` and physical `rounded-l-*` aren't mirrored → use logical direction if RTL is a target.

## What it does well
- Killed the accent rail cleanly (prior P0) — type now reads through the icon color + status-colored timer bar + faint error surface wash, exactly the post-Card pattern.
- Correct overlay surface + single edge treatment (`shadow-floating`, no border) — no edge-soup, no slop tells.
- Rich, genuinely useful surface beyond vanilla Sonner: promise orchestration, undo, and a full upload toast with per-file progress/retry/remove and morphing state icons.
- Excellent a11y baseline — urgency-aware role/aria-live, atomic re-read, sr-only upload count region, labelled icon-only buttons, touch targets.
- Hover/focus pause that correctly preserves *remaining* time, plus a documented workaround for Sonner's Infinity→update timer quirk. Real craft.

## Cross-DS adoption ideas
- **Sonner** exposes `onDismiss` / `onAutoClose` lifecycle callbacks and an `important` flag — we surface neither on our typed API; worth adding for consumers who need to react to dismissal or force-persist.
- **Sonner** supports swipe-direction config and stacking expand-on-hover (we inherit the defaults but don't expose the knobs) — consider passing through `expand` / swipe options via `ToasterProps`.
- **Vercel/Geist + Sonner** treat the action as a first-class component slot — reinforces the P1 fix of composing Button rather than `{label,onClick}`.
- **Sonner** `toast.promise` can update `description` per-state — our promise only swaps the title; allow a description updater.

## Rebuild note
**Polish, not rebuild.** The structure is sound: it composes Sonner correctly, uses the right overlay surface/radius/shadow tokens, and the P0 slop tell is already resolved. The remaining work is in-place: (1) make the spring entrances reduced-motion self-sufficient, (2) route `action`/`cancel` through the Button primitive, (3) type the icon config off `any`, (4) tokenize the two arbitrary micro-dims and add pointer-based pause. None require touching the API shape or the Sonner integration.
