# composed/inline-edit — finish-bar audit
Finish: 3/5   Market: PARITY (slight LAGS Atlassian @atlaskit/inline-edit on validation/error robustness)   Rebuild: polish

InlineEdit is a contentEditable in-place editor (Notion/Linear/Figma layer-name pattern — the text IS the editor, no mode switch). Source verified against `inline-edit.tsx`, stories, test, and doc: nothing structural changed since the 2026-07-01 baseline (also 3/5), so the same P1s remain open. It is visually clean and token-disciplined with genuinely thoughtful micro-craft, but it hand-rolls its focus indicator instead of using the DS `focus-ring` `:focus-visible` utility that already exists, has a lazy (silent, unannounced) error state, and is controlled-only. No slop tells, no radius-ds, no magic numbers, no framer slide-no-fade (pure CSS transitions).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells. Token-bound colors (`accent-7`, `surface-fg[-subtle]`, `surface-raised-hover`), `rounded-control-inner` role token, `gap-ds-02`/`-mx-ds-01`/`px-ds-01` spacing cadence, real `IconPencil` + `Spinner`. Surface layering N/A (inline text, not a card). |
| accessibility | gap | Correct `role="textbox"`, thoughtful label forwarding (aria-label/labelledby land on the span, placeholder fallback), axe-clean, keyboard-operable. BUT: focus ring is JS-`focused`-driven `ring-1 ring-accent-7` + `outline-hidden` — not `:focus-visible`, so it paints on mouse click AND the box-shadow ring is stripped under `forced-colors: active` (only the native caret survives). No `aria-multiline="false"`. No `aria-live` for save success / the silent error-revert. Pencil affordance is hover-only (invisible to keyboard/touch). |
| api-composability | gap | Controlled-only — no `defaultValue`/uncontrolled mode. `onSave` (not `onValueChange`) is defensible (it IS commit semantics), but there's no per-keystroke change surface and no doc note that this is deliberate. No `asChild`/polymorphism — editable element is a hardcoded `<span>` in a `<div>`. `textClassName` string escape hatch instead of a typed `size` axis. Good: `forwardRef` + `displayName`, fully typed props, no `any`. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas and matches source exactly. Clear, direct voice. (Story-coverage gaps counted under testing/state.) |
| testing | ✓ | Unit + RTL + `vitest-axe` + `describeConformance`; covers value/placeholder/readOnly/saving/keyboard(Enter/Escape/no-op)/aria forwarding/axe. Gap: no test for async-save resolution or the error-revert path; no forced-colors assertion. |
| motion | ✓ | Restrained and correct — no bounce/elastic, transform/opacity + color only, `duration-fast-01` token timing. Global `prefers-reduced-motion` reset (semantic.css:704) zeroes the transitions, so no per-component guard needed. Minor: pencil↔spinner swap is abrupt (no crossfade) — optional polish. |
| state-coverage | gap | hover / focused / saving / readOnly / empty(placeholder) all designed. Error state is lazy — async reject silently reverts text with zero visual or SR feedback. No disabled distinct from readOnly. `saving` state is never shown in a story (test-only). |
| content-resilience | gap | Single-line commit-on-Enter is correct for the use case. But no overflow/truncation strategy for very long values (container just grows). `maxLength` truncates silently (no counter/feedback). No RTL story; `handleInput` cursor-to-end + value-sync `textContent` writes can drop an in-progress IME/CJK composition (no `onCompositionStart/End` guard). |
| theming-resilience | ✓ | Survives accent-9 swap (accent-7 ring), honors `[data-shape]` via `rounded-control-inner` role token, light/dark via semantic tokens, no sunken track to invert. (forced-colors ring survival counted under a11y.) |
| system-cohesion | gap | Shares DS radius roles, spacing cadence, duration tokens, and composes Icon + Spinner — good. But it bypasses the shared `focus-ring` `:focus-visible` @utility (utilities.css:207) for a bespoke JS-state ring. That's the one voice out of tune, and it's the root of the a11y focus gap. |
| craft-unseen | ✓ | Select-all-on-focus (Finder rename), plain-text paste sanitize, trim + no-op-if-unchanged, snapshot-for-revert, `cursor-text`, `spellCheck` only while focused, and `-mx-ds-01 px-ds-01` compensation so entering edit mode causes no text shift. Genuinely felt details. |
| perceived-performance | ✓ | Native contentEditable caret = zero-latency feedback; edits in place (optimistic); spinner for async; no layout shift on focus (padding compensated). |
| market-benchmark | gap | vs Atlassian `@atlaskit/inline-edit` (the canonical peer for this archetype): we LEAD on elegance (no read/edit mode swap, cleaner). We LAG on robustness — Atlassian ships validation + inline error message, explicit confirm/cancel affordances, and uses a real form field rather than contentEditable (avoiding IME/cursor fragility). Net PARITY. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] accessibility / system-cohesion — focus ring is a JS-`focused` box-shadow ring that ignores `:focus-visible` and vanishes in forced-colors → adopt the existing `focus-ring` utility (or a real `:focus-visible` outline) on the editable span, add a `forced-colors:` outline fallback; keep the accent bg as an "editing" cue if desired, but not as the sole focus indicator.
- [P1] accessibility — pencil affordance is hover-only → add `group-focus-within:opacity-100` so keyboard/touch users see the edit cue.
- [P1] state-coverage / accessibility — async error silently reverts with no feedback → add a visually-hidden `aria-live="polite"`/`role="status"` announcing "Saved" / "Save failed, reverted"; consider a transient error tint.
- [P1] api-composability — controlled-only → add `defaultValue?: string` for uncontrolled use; document that `onSave` is intentionally the sole change surface.
- [P2] accessibility — add `aria-multiline="false"` to the textbox.
- [P2] content-resilience — guard the `handleInput` maxLength rewrite and value-sync behind `onCompositionStart/End` so IME/CJK composition isn't dropped; define a truncation/overflow strategy for long values.
- [P2] craft — replace deprecated `document.execCommand('insertText')` (line 144) with a Selection/Range insert.
- [P2] testing/state — add stories for saving-state, forced-colors, RTL, and error-revert.

## What it does well
- Zero slop, fully token-disciplined (colors, radius role token, spacing cadence, duration tokens) — clean in both themes.
- Best-in-class label forwarding: aria-label/aria-labelledby intercepted from `...props` and placed on the `role="textbox"` span (not the wrapper), with a placeholder fallback so the textbox is never nameless. Backed by tests + axe.
- Real micro-craft: select-all-on-focus, plain-text paste, no-op-if-unchanged, no-layout-shift-on-focus, spellCheck-only-when-editing.
- Motion restraint is correct for a frequent action — no gratuitous animation, and the global reduced-motion reset covers the CSS transitions.
- Thorough, behavior-focused test suite (`describeConformance` + keyboard + aria + axe), and a doc that actually matches source.

## Cross-DS adoption ideas
- **Atlassian `@atlaskit/inline-edit`** ships validation with an inline error message and optional explicit confirm/cancel controls — we have neither. Add an optional `validate?: (v) => string | undefined` + error surface, and an optional confirm/cancel affordance for touch (where Enter/Escape aren't discoverable).
- **React Aria / Atlassian** deliberately edit through a real (visually-managed) input rather than contentEditable to sidestep IME/cursor-jump/execCommand fragility. Worth a spike: back the editor with a hidden/auto-sizing input while keeping the seamless read-view look — removes the execCommand dependency and the composition-drop risk in one move.
- **Linear/Notion** reveal the edit affordance on focus, not just hover, and announce save state — cheap wins already listed as P1 gaps above.

## Rebuild note
**Polish, not rebuild.** The contentEditable/no-mode-switch architecture is a legitimate and arguably superior UX choice (matches Notion/Linear/Figma) and should stay. Every gap is an in-place fix: swap the JS-state ring for the DS `focus-ring` utility + forced-colors fallback, reveal the pencil on focus, add an `aria-live` region, add `defaultValue`, guard IME composition, and retire `execCommand`. The one thing worth a scoped spike (not a full rebuild) is whether to back the editor with a real input instead of contentEditable to kill the execCommand + IME-fragility class of problems — but that's optional hardening, not a prerequisite to reach the finish bar.
