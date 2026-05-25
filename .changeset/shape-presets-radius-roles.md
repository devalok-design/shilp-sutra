---
"@devalok/shilp-sutra": minor
---

feat(tokens, ui): semantic radius roles + `[data-shape]` shape presets

**Why:** Roundness is a brand axis (sharp = technical, rounded = consumer). Until now consumers could nudge individual `--radius-ds-*` primitives, but the components themselves baked in ad-hoc per-size radii — Button md (10px) was rounder than Button sm (6px), Input lg (10px) was rounder than Button lg (16px) at the same height, SegmentedControl's "pill" wasn't actually pill, Tooltip drifted from the rest of the overlay tier. This release makes radius role-based and consumer-customizable in one shot.

**What's new:**

1. **Eight semantic radius role tokens** in `packages/core/src/tokens/semantic.css` — `--radius-control`, `--radius-control-inner`, `--radius-surface`, `--radius-overlay-sm`, `--radius-overlay`, `--radius-overlay-lg`, `--radius-pill`, `--radius-bubble`. Components reference these, never the primitive `--radius-ds-*` scale.

2. **Three shape presets** via `[data-shape]` attribute — set on `<html>` or any subtree:
   - `sharp` — 2/4/6 px (technical, dev-tool feel — Vercel/Linear/terminal)
   - `slightly-rounded` (the default if no attribute is set) — 6/10/16 px (modern SaaS — shadcn/Stripe)
   - `rounded` — 10/16/24 px (friendly, consumer — iOS/Notion)

3. **Per-token overrides still work.** Consumers can override any role token globally or scoped:
   ```css
   :root { --radius-control: 4px; }
   .checkout { --radius-control: 8px; --radius-surface: 20px; }
   ```

4. **Pre-publish audit gate.** `pre-publish-audit.mjs` now fails publish if any `rounded-ds-*` or bare `rounded-full` leaks back into `src/ui/**/*.tsx`. Use the role tokens. The gate is scoped to `src/ui/` only; `composed/` and `shell/` migration is the next release.

**Breaking visual changes (no API breaks):** all changes are class-name swaps in the source; component prop APIs are unchanged. But consumers WILL see these on upgrade:

| Component | Before | After | Why |
|---|---|---|---|
| Button md | 10px | 6px | Killed per-size radius scaling — same role, same radius |
| Button lg | 16px | 6px | Same as above |
| Button icon-lg | 10px | 6px | Same as above |
| Input lg | 10px | 6px | Now matches Button lg (was inconsistent) |
| Tabs trigger (contained) | 10px | 6px | Now matches Button (was inconsistent) |
| SegmentedControl item | 10px | 9999px | Renamed pill is now actually pill |
| Menubar trigger | 2px | 6px | Now matches DropdownMenu item (was inconsistent) |
| Autocomplete listbox | 6px | 10px | Now matches Popover/DropdownMenu (was inconsistent) |
| ChatMessage bubble | rounded-ds-2xl (24px) | rounded-bubble (24px → preset-aware) |
| Everything else | unchanged |

**If you preferred the chunkier old look:** set `data-shape="rounded"` on your app root to get the v0.38-era feel back for big controls. Or override `--radius-control: 10px` to keep that one value at the old size.

**Migration:**

```diff
- <html lang="en">
+ <html lang="en" data-shape="slightly-rounded">  <!-- optional, this is the default -->
```

To go sharp:
```diff
- <html lang="en">
+ <html lang="en" data-shape="sharp">
```

**Files touched:** semantic.css (tokens + 3 preset blocks), 100+ source files migrated across `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/`, `src/motion/` (~480 replacements via `scripts/migrate-radius-roles.mjs`), 7 component tests updated to match new class names, `apps/site/` fully migrated and now sets `data-shape="slightly-rounded"` on `<html>`, pre-publish-audit.mjs gate covers the whole package, customize-brand.md recipe rewritten, new Storybook story `Foundations/Shape Presets`.

**Coverage:** complete adoption across the published package. Token showcase stories (`forced-colors.stories.tsx`, `FoundationsShowcase.tsx`) are intentionally allowlisted — they demonstrate the primitive scale and must continue to render at fixed values.
