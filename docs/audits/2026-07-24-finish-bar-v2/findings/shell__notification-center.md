# shell/notification-center — finish-bar audit
Finish: 3/5   Market: LAGS(Linear inbox)   Rebuild: polish

Well-structured, props-driven shell overlay: bell trigger → Popover (desktop) / bottom Sheet (mobile), grouped-by-date list, unread tinting, inline actions, per-row dismiss, infinite scroll, reduced-motion aware, tested + storied + documented. It is NOT slop and composes DS siblings (Popover/Sheet/Tooltip/Button/Icon/Spinner/TruncatedText) well. It lands at a solid-but-unfinished 3/5, held back by a confirmed dead-class border bug, a non-canonical action taxonomy, a decorative bell wiggle keyed to nothing, a UA-default (not DS) focus ring on rows, and re-rolled Dot/Badge vocabulary. All fixable in place — no structural rebuild.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Dead class `border border-card-strong` on trigger (line 445) — no such `@utility`/token exists (only `border-card` → `--color-surface-border-card`); border falls back to `currentColor`. Magic numbers: `h-[8px] w-[8px]` (dot), `w-[380px]`, `max-h-[420px]`, `max-h-[60vh]`. Otherwise clean: correct overlay layering, role radius (`rounded-pill`/`-control-inner`/`-overlay-lg`), no edge-soup/accent-rail/gradient. |
| accessibility | gap | Bell has count-aware `aria-label`; dismiss labelled; Enter/Space activation; reduced-motion guarded. BUT rows are bare `role="button"` divs with only `hover:` — no DS `focus-ring`, so keyboard focus shows the UA default outline, not the system ring (WCAG 2.4.7 met by UA fallback, but off-system). No list/feed semantics on the group. `forced-colors` handled at token layer only. |
| api-composability | gap | Strong slots (`headerActions`/`footerSlot`/`emptyState`), controlled `open`/`onOpenChange`, `getNotificationRoute` keeps routing in consumer, `forwardRef`+`displayName`, exported types. BUT `NotificationAction.variant: 'primary'\|'default'\|'danger'` conflates the canonical `variant`+`color` axes then re-maps at call time (line 232-233) — consumers can't reach `soft`/`outline`/arbitrary color. `onClick(id)` is a value callback wearing an event name. |
| docs-dx | ✓ | Doc has Props/Types/Defaults/Example/Composability/Gotchas/Changes and matches source. Only ding: the example models `popoverClassName="w-[480px]"` (magic number). |
| testing | gap | Genuine `vitest-axe` test + navigation/dismiss/footer/empty/header/Enter-key interaction coverage — above average. BUT the entire mobile Sheet render path (`useIsMobile`) and `hasMore`/`onFetchMore` infinite-scroll are untested; no `describeConformance`. |
| motion | gap | Bell wiggle `rotate:[0,-3,3,-1,1,0]` replays on *every* re-render keyed to nothing (should fire once on unread-count increase) and uses keyframes (non-interruptible). List stagger `delay: index*0.03` fade-in is tasteful and reduced-motion guarded. No press feedback (`active:scale`) on trigger/rows. Animates opacity/transform only — HW-clean. |
| state-coverage | gap | hover / unread-tint / read (dot opacity) / empty (default + custom slot) / loading (spinner) / critical-tier all designed. Missing: focus-visible on rows (UA default only), and a load/fetch **error** state (only success + loading exist). |
| content-resilience | gap | Strong: `TruncatedText` on title+project, `line-clamp-2` body, `min-w-0 flex-1`, 99+ count cap, date grouping. RTL weak: dismiss/badge use physical `right-*`/`top-*` and popover `align="end"` (not logical props) — will mis-place mirrored. |
| theming-resilience | ✓ | Semantic tokens throughout (`accent-*`, `info/warning/error-9`, `surface-*`), survives accent-9 swap, dark overrides defined, role radius honors `[data-shape]`. Caveat: the dead `border-card-strong` means the trigger edge follows `currentColor` in both themes rather than the card border token (counted under visual-integrity). |
| system-cohesion | gap | Shares DS easing/durations (`ease-productive-standard`, `duration-fast-02`) and composes siblings. BUT re-rolls a `Dot` (now a real primitive `ui/dot.tsx`, 0.49.0), a count `Badge`, and a selectable list-row inline instead of composing them — drift risk vs Sidebar/DropdownMenu/Combobox rows. |
| craft | ✓ | Real polish: dismiss reveals on `group-hover`/`group-focus-within`, sticky per-group date headers, tier dot doubles as read/unread marker via opacity, bell tooltip, 99+ cap, relative-time. |
| perceived-performance | ✓ | Instant popover, 50px-threshold infinite scroll, spinner during fetch, subtle stagger, no CLS, optimistic mark-read via callback. Skeleton (vs spinner) is the only step up. |
| market-benchmark | gap | LAGS Linear inbox: no roving keyboard list-nav (j/k/arrows), no snooze, spinner-not-skeleton, no swipe-to-dismiss on the mobile Sheet, wiggle-not-arrival animation. Competent mainstream bell+popover, not category-leading. |
| cross-ds-adoption | gap | Concrete imports available (see below) — currently adopts none of the inbox-leader patterns. |

## Top gaps (prioritized)
- [P0] visual-integrity — `border border-card-strong` (line 445) is a dead class; there is no `border-card-strong` utility or `--color-card-strong` token, so the trigger border silently renders in `currentColor`. → Change to `border-card` (the real utility → `--color-surface-border-card`) or `border-surface-border-strong`. Latent bug the 2026-07-01 baseline missed.
- [P1] api-composability — `NotificationAction.variant: 'primary'|'default'|'danger'` collapses `variant`+`color` and re-maps. → Expose `variant?: ButtonProps['variant']; color?: ButtonProps['color']` (default non-primary to `soft` per repo pref); keep the old enum as a deprecated alias (rename = breaking).
- [P1] motion — bell wiggle fires on every re-render, meaning nothing. → Drive off an unread-count-increase effect (prev vs current) via `useAnimationControls`/`AnimatePresence` key, or drop it. Reduced-motion guard already correct.
- [P1] accessibility — rows show only the UA-default focus outline, no DS `focus-ring`. → Apply the `focus-ring`/`focus-visible:ring-2 ring-accent-8` utility to the row + dismiss button; add a `role="feed"`/list semantic to the group.
- [P2] visual-integrity — magic numbers `h-[8px] w-[8px]`, `w-[380px]`, `max-h-[420px]`, `max-h-[60vh]`. → Move to size/spacing tokens (compose `Dot` for the 8px dot; token the panel width/height).
- [P2] system-cohesion — hand-rolled dot + count badge. → Compose `Dot` (color=`info|warning|error`) and `Badge` (soft/accent) so the tier→color map lives once.
- [P2] testing — mobile Sheet path and `hasMore`/`onFetchMore` untested. → Add a `useIsMobile`-mocked Sheet story/test and a fetch-more interaction test.
- [P2] content-resilience — physical RTL positioning. → Switch dismiss/badge offsets to logical props (`end-*`/`start-*`).

## What it does well
- Clean responsive split: Popover on desktop, bottom Sheet on mobile, sharing one `panelContent` — no duplicated markup.
- Proper content slots (`headerActions`, `footerSlot`, `emptyState`), controlled open state, and consumer-owned routing via `getNotificationRoute` (no hardcoded routes).
- Genuine craft: `group-focus-within` dismiss reveal, sticky date-group headers, tier dot as read/unread marker, 99+ cap, bell tooltip, relative time.
- Content resilience on text: `TruncatedText` + `line-clamp-2` + `min-w-0 flex-1`.
- Reduced-motion honored on both the stagger and the bell shake; animates transform/opacity only.
- Above-average tests (real axe + keyboard + interaction coverage) and an accurate doc.

## Cross-DS adoption ideas
- **Linear inbox** — roving keyboard navigation (arrow/j-k) with a visible DS focus ring across rows; we have per-row `tabIndex` but no roving/arrow nav. Import the roving-tabindex pattern.
- **Linear / GitHub** — a **snooze** action and read/unread filter tabs; we only have mark-read + dismiss.
- **Sonner / Vaul** — optimistic dismiss with a layout/exit animation (`AnimatePresence`), and swipe-to-dismiss on the mobile Sheet; we dismiss with no motion.
- **Vercel/Geist + Linear** — **skeleton** list rows during initial/`fetchMore` load instead of a bare centered Spinner.
- **Meaningful arrival motion** — key a one-shot highlight/shake to new-notification *arrival* (count increase) rather than a render-triggered wiggle.
- **Radix** — a proper `role="feed"`/list semantic wrapper for assistive-tech article navigation.

## Rebuild note
Polish, not rebuild. The structure (responsive Popover/Sheet split, props-driven data, slot API) is sound and worth keeping. Scope: (1) fix the `border-card-strong` dead class [P0, one-line]; (2) migrate `NotificationAction` to canonical `variant`+`color` with a deprecated alias; (3) make the bell animation fire on count-increase only; (4) add the DS focus-ring + list/feed semantics to rows; (5) compose `Dot`/`Badge` and token the magic numbers; (6) close the mobile-Sheet + fetch-more test gap. None of these touch the component's architecture — all are in-place edits.
