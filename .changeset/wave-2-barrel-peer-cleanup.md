---
"@devalok/shilp-sutra": minor
---

feat!: barrel peer-cliff cleanup — remove 12 hard-peer re-exports from `/ui`, `/composed`, `/ai`, `/ai/blocks` barrels

**Breaking.** Twelve symbols that statically `import` optional peer dependencies have been removed from their parent barrels. Every symbol remains fully available via its per-component subpath. Search-and-replace migration is one line per symbol; full table in `MIGRATION.md` under `v0.40.0 — Barrel peer-cliff cleanup`.

## Why

`peerDependenciesMeta.<peer>.optional = true` was a lie at the bundler level: barrels statically re-exported components whose source files contained top-level `import 'sonner'`, `import 'date-fns'`, `import { OTPInput } from 'input-otp'`, `import { useEditor } from '@tiptap/react'`, etc. Fresh consumer doing `import { Text } from '@devalok/shilp-sutra/ui'` without those peers installed → `Module not found: Can't resolve '<peer>'` at `next build` / `vite build` / `astro build`. Surfaced repeatedly across `tbf-tracker` (F-02), `hiring-platform`, and karm-v2.

Tree-shaking can't drop a static import if the resolver fails first. Lazy-importing moves the failure to runtime, which is worse. Removing the barrel re-export is the only fix.

## What moved

| Symbol family | Old barrel | New per-component subpath | Peer pulled |
|---|---|---|---|
| `InputOTP*` | `/ui` | `/ui/input-otp` | `input-otp` |
| `toast`, `formatFileSize`, `Toast*` | `/ui` | `/ui/toast` | `sonner` |
| `Toaster`, `ToasterProps` | `/ui` | `/ui/toaster` | `sonner` |
| `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker`, `CalendarGrid`, `MonthPicker`, `YearPicker`, `Presets`, `useCalendar` + all `*Props` | `/composed` | `/composed/date-picker` | `date-fns` |
| `EmojiPicker`, `EmojiPickerPopover` + types | `/composed` | `/composed/emoji-picker` | `@emoji-mart/data`, `@emoji-mart/react` |
| `EmojiNode`, `EmojiNodeAttrs` | `/composed` | `/composed/extensions/emoji-node` (**new subpath in 0.40.0**) | `@tiptap/*` |
| `createEmojiSuggestion` | `/composed` | `/composed/extensions/emoji-suggestion` (**new subpath**) | `@tiptap/*` |
| `FilePreview` + types | `/composed` | `/composed/file-preview` | `react-pdf`, `react-zoom-pan-pinch` |
| `MarkdownViewer` + types | `/composed` | `/composed/markdown-viewer` | `react-markdown`, `react-syntax-highlighter`, `remark-gfm` |
| `RichChatInput`, `AudioPlayer`, `AudioWaveform`, `useVoiceRecorder` + types | `/composed` | `/composed/rich-chat-input` | `@tiptap/*` |
| `RichTextEditor`, `RichTextViewer` + types | `/composed` | `/composed/rich-text-editor` | `@tiptap/*` |
| `BlockRenderer`, `BlockRendererProps` | `/ai` | `/ai/block-renderer` | `react-markdown`, `remark-gfm` (transitive via Text/Error blocks) |
| `ErrorBlock` | `/ai`, `/ai/blocks` | `/ai/blocks/error` (**new subpath**) | `react-markdown`, `remark-gfm` |
| `TextBlock` | `/ai`, `/ai/blocks` | `/ai/blocks/text` (**new subpath**) | `react-markdown`, `remark-gfm` |

Seven other AI blocks (`BlockTable`, `ConfirmBlock`, `DividerBlock`, `InfoBlock`, `LoadingBlock`, `StatRowBlock`, `SuccessBlock`) are peer-cliff-free and stay in both `/ai` and `/ai/blocks` barrels.

## Per-chart subpaths added (non-breaking)

New: `/ui/charts/area-chart`, `/ui/charts/bar-chart`, `/ui/charts/chart-container`, `/ui/charts/gauge-chart`, `/ui/charts/line-chart`, `/ui/charts/pie-chart`, `/ui/charts/radar-chart`, `/ui/charts/sparkline`. The `/ui/charts` barrel still works and still pulls all 9 d3-\* peers. Per-chart subpath pulls only the d3-\* peers that specific chart needs — `BarChart` = `d3-scale` + `d3-axis` + `d3-selection`; `PieChart`/`RadarChart` = `d3-shape` only. Documented in `llms.txt` as the preferred form for d3-conscious consumers.

## Build / packaging

- `packages/core/vite.config.ts` — 8 new chart entries + 4 new ai/composed peer-cliff entries added to `explicitEntries`.
- `packages/core/package.json#exports` — 12 new subpath entries (4 newly-added per-cliff + 8 per-chart).
- No change to `peerDependenciesMeta` — peers stay `optional`. The lie was elsewhere.

## What didn't change

- Component APIs, prop signatures, types, runtime behavior, default styles, accessibility.
- Per-component subpaths that already existed in 0.39.x — consumers already importing per-component need zero changes.
- Stories, tests, internal DS imports — all use relative paths, none were ever affected.

## Impact

- `tbf-tracker` (fresh-consumer audit, 18 findings) — closes F-02 (`input-otp` cliff) + F-03 (per-chart subpaths). Other findings tracked separately.
- `hiring-platform` — closes F-22 (silent sonner peer) docs angle; runtime warning still scheduled for Wave 4.
- `karm-v2` 0.37→0.40 upgrade — uses `DatePicker`, `toast`, `Toaster`, `MarkdownViewer`, `RichTextEditor`. Estimated 80-120 line touchpoints; mostly one-line `from '@devalok/shilp-sutra/composed'` → `'@devalok/shilp-sutra/composed/date-picker'` etc. Migration recipe in MIGRATION.md.
