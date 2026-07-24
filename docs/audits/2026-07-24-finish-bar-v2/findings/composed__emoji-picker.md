# composed/emoji-picker — finish-bar audit
Finish: 3/5   Market: PARITY (frimousse / shadcn emoji-picker)   Rebuild: polish

Thin DS-token wrapper over **frimousse** (headless, native-only) + a `EmojiPickerPopover` composing the DS `Popover`. Rewritten since the 2026-07-01 baseline (was `@emoji-mart/react` with a framer skeleton→pop-in crossfade). The old audit's P1 motion findings (no reduced-motion guard) and the skeleton magic-number duplication are **gone** — there is no bespoke motion left; open animation now defers entirely to `Popover`. Wrapper is clean of AI tells. Remaining gaps: shallow tests, an unaddressed controlled-`open` gap carried from the baseline, sub-44px touch targets, and a handful of arbitrary values.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells; correct `bg-surface-overlay`, role radius (`rounded-surface`/`rounded-control`), single shadow treatment (`shadow-raised-hover`, Popover content is `border-none bg-transparent shadow-none`). But arbitrary values: `h-[435px] w-[352px]` (panel dims), `text-[1.375rem]` (emoji glyph ×2), `text-[1.25rem]` (skin-tone). Magic-number drift. |
| accessibility | gap | Skin-tone has `aria-label`; search + skin-tone have `focus-ring`. But `size-8` skin-tone = 32px and emoji cells (~40px at panel width) are **below the 44px touch target**; `Frimousse.Search` has only a placeholder, no explicit label; no `forced-colors` handling. Core roving-focus/activedescendant is delegated to frimousse (well-built), so no P0. |
| api-composability | gap | **Baseline F6 still unaddressed**: `EmojiPickerPopover` is internal-`useState` only — no `open`/`defaultOpen`/`onOpenChange` pass-through, so it can't be driven programmatically. Neither export is `forwardRef` (yet `displayName` is set — odd). `onSelect` is not canonical `onValueChange` but defensible for a fire-and-forget picker. Deprecated no-op aliases (`set`/`theme`/…) are staged correctly with `@deprecated`; `emojibaseUrl` CSP escape hatch is a strong add; composes `Popover` cleanly (no re-roll). |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas and **matches source** (deprecation notes, CSP self-host, TipTap link). Only nit: example steers to a 😀-as-icon trigger. |
| testing | ✗ | Only 3 shallow tests; **frimousse is fully mocked** (Search/Viewport/List/Loading/Empty all passthrough stubs) so almost none of our rendered surface is exercised. No `vitest-axe`, no `describeConformance`, no interaction/state coverage. Below bar. |
| motion | ✓ | No bespoke motion — correctly restrained: emoji selection is a high-frequency action that should NOT animate (Emil), and open/close is inherited from DS `Popover`'s reduced-motion-guarded spring. No press-scale on emoji cells is the right call here. |
| state-coverage | ✓ | `Frimousse.Loading` ("Loading…") + `Frimousse.Empty` ("No emoji found.") + hover (`hover:bg-surface-raised`) + active (`emoji.isActive`) all deliberately handled. Empty/loading are where most pickers are lazy; this isn't. (disabled/error N/A for a picker.) |
| content-resilience | ✓ | Footer label uses `min-w-0` + `truncate`; search is full-width; emoji cells use `w-[calc(100%/var(--frimousse-list-columns))]` for edge-to-edge rows. Fixed panel size is an emoji-grid norm. Minor: physical props (`px-`, `border-t`) not logical, though layout is symmetric enough for RTL. |
| theming-resilience | ✓ | All surfaces/text via tokens (`surface-overlay`/`raised`/`fg`/`fg-muted`/`fg-subtle`, `surface-border-subtle`); no accent dependency (survives accent-9 swap); role radius honors `[data-shape]`; dark via `.dark` tokens. |
| system-cohesion | ✓ | Shares DS `focus-ring` util, role radius, ds spacing tokens, and composes the DS Popover — feels like one system. (Emoji/skin-tone font sizes are off-ramp but that's glyph sizing, not a sibling-token concern; flagged under visual.) |
| craft | ✓ | `isolate` (z-containment), `select-none` on the grid, `leading-none` on glyphs, `min-w-0`/`truncate` label, the column-width `calc` with explanatory comment, and the `emojibaseUrl` CSP/offline escape hatch — real, felt-but-unnoticed details. |
| perceived-performance | gap | Lazy `emoji` chunk + dataset fetched from CDN on first open; the Loading affordance is centered "Loading…" text, not a skeleton grid — functional but a visual downgrade from the old skeleton, and CDN latency is user-visible on cold open. |
| market-benchmark | PARITY | frimousse is the current best-in-class headless emoji picker (shadcn's own emoji-picker is built on it). We match it and edge ahead on the `emojibaseUrl` self-host prop + DS footer (active preview + skin tone); we lag on controlled-open and test depth. |
| cross-DS adoption | gap | See ideas below — virtualization is already frimousse's, but async/error states and frequency/recents are unclaimed. |

## Top gaps (prioritized)
- [P1] testing — frimousse is 100% mocked and there's no axe/conformance/interaction test → add a `vitest-axe` pass on the rendered picker, a `describeConformance`, and at least one non-mocked render assertion for the footer/empty/loading branches.
- [P1] api-composability — no controlled `open`/`defaultOpen`/`onOpenChange` on `EmojiPickerPopover` (baseline F6, still open) → add the three optional props, forward to `<Popover>`, keep auto-close by calling the forwarded `onOpenChange(false)` inside `handleSelect`.
- [P2] accessibility — `size-8` skin-tone (32px) and emoji cells sit under the 44px target; search has placeholder-only labeling → bump the skin-tone hit area (`touch-target` util) and add an explicit `aria-label`/`label` to `Frimousse.Search`.
- [P2] visual-integrity — arbitrary `h-[435px] w-[352px]` / `text-[1.375rem]` / `text-[1.25rem]` → hoist panel dims to a single named constant (mirrors frimousse intrinsic size), and pull glyph sizes to a token or documented constant so they can't drift.
- [P2] perceived-performance — "Loading…" text on cold CDN fetch → restore a skeleton-grid loading affordance and consider documenting a prefetch pattern for the dataset.
- [P3] docs — swap the 😀-as-icon trigger in the doc example for a lucide `IconMoodSmile`; switch story `onSelect` from `console.log` to `action()`.

## What it does well
- Genuinely composes: `EmojiPickerPopover` wraps the inline `EmojiPicker`, and the Popover content correctly defers its chrome (`border-none bg-transparent shadow-none`) to the picker's own `shadow-raised-hover` — one edge treatment, no edge-soup.
- Loading AND empty states are deliberately designed (both centered, muted, token-driven) — better than most peers.
- The `emojibaseUrl` CSP/air-gapped self-host prop with an inline how-to is a best-in-class DX touch peers don't ship.
- Correct restraint on motion: no animation on a 100×/session tap action.
- Deprecation is staged as no-op aliases with `@deprecated` JSDoc — no hard break from the emoji-mart era.

## Cross-DS adoption ideas
- **shadcn/frimousse** examples expose a controlled-open pattern and a "frequently used / recents" row — we have neither; a recents row (localStorage-backed) is a high-value, low-cost add for chat/reaction use.
- **frimousse itself** supports a category-navigation strip (jump-to-category); we render category headers but no nav affordance — worth surfacing for large sets.
- **Base UI / React Aria** pickers model an explicit async/error state (fetch failed) with a retry; frimousse fetches from a CDN and we only show Loading/Empty — add a fetch-error branch with retry so a blocked CDN isn't a silent blank.
- **Radix/Base UI Popover** conventions: forward `open`/`onOpenChange` (and ideally `modal`) — importing that contract closes our F6 gap and matches the rest of our overlay family.

## Rebuild note
Polish, not rebuild. The structure is right — headless frimousse core + DS-token skin + a Popover-composing variant is the correct, market-parity shape, and the messy parts the 2026-07-01 audit flagged (unguarded framer motion, duplicated skeleton magic numbers) were removed in the migration rather than patched. Remaining work is additive/in-place: forward controlled-open props, deepen the (currently near-empty, fully-mocked) test suite with axe + conformance, lift touch targets to 44px, hoist the four arbitrary values to constants/tokens, and restore a skeleton loading state. No API break required.
