# Component Quality Cleanup — Design Document

**Date:** 2026-04-07
**Scope:** Badge CVA refactor, Button deprecation cleanup, dead code removal, DataTable decomposition, FilePreview decomposition, inline style cleanup

## Motivation

The ecosystem audit revealed several components with over-engineered CVA definitions (Badge: 57 compound variants), deprecated aliases bloating core code (Button: 15 compat entries), dead utilities (useRipple), monolith files (DataTable: 1,154 lines, FilePreview: 964 lines), and inline styles bypassing the token system.

## Constraints

- All changes must use the existing token system (primitives.css → semantic.css → preset.ts)
- Tailwind utilities only — no raw hex, rgb, oklch in component code
- CVA for variants, `cn()` for class merging, forwardRef + displayName
- Surface layering rules (surface-1 = page/overlays, surface-2 = cards, etc.)
- No new design patterns — follow established conventions

## Workstream 1: Badge CVA Refactor

**Problem:** 57 compound variants from 4 variants × 14+ colors.

**Solution:** CSS custom property strategy. Each color sets 4 CSS vars using Tailwind arbitrary properties, and each variant references them.

Color map (using existing semantic/category tokens):
```
accent  → --badge-bg: accent-3,  --badge-fg: accent-11, --badge-border: accent-7, --badge-solid: accent-9
error   → --badge-bg: error-3,   --badge-fg: error-11,  --badge-border: error-7,  --badge-solid: error-9
success → --badge-bg: success-3, --badge-fg: success-11, etc.
... (all 14 colors using existing tokens)
```

Variant styles reference the vars:
```
subtle  → bg: var(--badge-bg), text: var(--badge-fg), border: transparent
outline → bg: transparent, text: var(--badge-fg), border: var(--badge-border)
solid   → bg: var(--badge-solid), text: accent-fg
dot     → bg: transparent, text: surface-fg, dot: var(--badge-solid)
```

Result: ~20 rules instead of 57. API unchanged — `<Badge variant="subtle" color="error">` works identically.

## Workstream 2: Button Deprecation Cleanup

**Problem:** 15 compound variants for backward-compat aliases (`variant="default"`, `variant="destructive"`, `color="default"`).

**Solution:** Remove deprecated aliases from CVA. They've shipped with deprecation warnings since v0.29.0 (2+ minor versions ago). Consumers should have migrated.

Removed:
- `variant="default"` (use `"solid"`)
- `variant="destructive"` (use `variant="solid" color="error"`)
- `color="default"` (use `"accent"`)

## Workstream 3: Dead Code Removal

- Delete `packages/core/src/ui/lib/use-ripple.ts` (unused after SegmentedControl rewrite)
- Delete Chip component (`packages/core/src/ui/chip.tsx`, its test, its story) — marked @deprecated, Badge replaces it
- Remove Chip from barrel exports

## Workstream 4: DataTable Decomposition

**Problem:** 1,154 lines, 10+ features in one file.

**Solution:** Extract into focused sub-components. The public API stays the same — `<DataTable>` remains the entry point and orchestrates sub-components internally.

Extract:
- `data-table-header.tsx` — column headers, sort indicators, resize handles
- `data-table-filters.tsx` — filter row, column filter inputs
- `data-table-pagination.tsx` — page nav, page size selector, row count display
- `data-table-row.tsx` — row rendering, selection checkbox, expand toggle
- `data-table.tsx` — orchestrator (~300-400 lines), TanStack Table setup, context provider

All sub-components are internal (not exported to consumers). The public exports remain unchanged.

## Workstream 5: FilePreview Decomposition

**Problem:** 964 lines handling image, video, audio, PDF, and embed previews.

**Solution:** Extract format-specific renderers. `FilePreview` becomes a router.

Extract:
- `file-preview/image-preview.tsx` — zoom, pan, rotate via react-zoom-pan-pinch
- `file-preview/video-preview.tsx` — native video + YouTube/Vimeo/Loom embed detection
- `file-preview/audio-preview.tsx` — native audio player
- `file-preview/document-preview.tsx` — PDF viewer via react-pdf
- `file-preview.tsx` — router that delegates to the right preview based on `type` prop

Public API unchanged — `<FilePreview url={...} type="image" />` works identically.

## Workstream 6: Inline Style Cleanup

- `navigation-menu.tsx`: `style={{ width: '100%' }}` → `className="w-full"`
- `card.tsx`: inline `backgroundColor` for accent colors → CSS custom property via `style={{ '--card-accent': ... }}` + Tailwind `bg-[var(--card-accent)]` (keeps dynamic color support while using the system)
- Review and fix any other `style={{` usage in non-dynamic contexts

## Breaking Changes

| Change | Migration |
|--------|-----------|
| Button `variant="default"` removed | Use `variant="solid"` |
| Button `variant="destructive"` removed | Use `variant="solid" color="error"` |
| Button `color="default"` removed | Use `color="accent"` |
| Chip component removed | Use `Badge` with appropriate variant |
