---
"@devalok/shilp-sutra": minor
---

Setu-requested components + DS-wide anti-slop pass.

**New / enhanced components**
- **`Diff`** (`./composed/diff`) — version-compare viewer wrapping jsdiff: inline / split / structured `fields` (JSON) modes, word-level intra-line highlights, collapse-unchanged, per-hunk accept/reject for review flows, and a compound API (`Diff.Root` / `Diff.Summary` / `Diff.Body` / `Diff.ColumnLabels`, `useDiff`).
- **`RichTextEditor`** — new `format="markdown"` (bidirectional Markdown via `@tiptap/markdown`), slot composition (`RichTextEditor.Provider` / `.Toolbar` / `.Content`, `useRichTextEditor`), and a built-in source-view toggle (`sourceToggle`, controllable `sourceMode`/`onSourceModeChange`, `.SourceToggle` slot).
- **`RadarChart`** — supports up to ~16 axes (auto radial labels + truncation past ~10), `target` benchmark ring, `onAxisClick` drill-down, and `axisDescriptions` hover tooltips.

**Anti-slop DS pass (non-breaking)**
- Typography migrated from size-only `text-ds-*` to the semantic ramp (`text-body-*` / `text-heading-*` / `text-label-*` / `text-caption`); heading weights now semibold (was regular).
- New `--color-surface-border-card` token + `border-card` utility — a faint card-edge hairline applied to panel components (interactive-control edges keep their WCAG-contrast border).
- Fixed `cn`/tailwind-merge to register the ramp utilities as `font-size` (they previously collided with text-colour utilities).
