# Migration Guide

This page indexes all breaking changes across `@devalok/shilp-sutra` versions. For the full changelog, see [CHANGELOG.md](./CHANGELOG.md).

> **Upgrading from &lt; 0.36?** Start here, then read each intermediate version section. Breaking changes stack — skipping versions means stacking migrations.

## v0.44.0 — Card system: gap-model, corner slots, truncation primitive

Three breaking changes (`Card` `accent`/`accentColor` removed, `StatCard` `surface` → `variant`, `ContentCard` deprecated). Everything else is additive.

### Breaking: `Card` `accent` / `accentColor` removed

The decorative colored edge-bar (`accent="left" | "top" | "right" | "bottom"` + `accentColor`) is gone — same anti-convergence reasoning as the 0.43 StatCard rail (a colored bar stacked on a bordered, shadowed card is an AI tell). Replace it with a corner slot or a tinted border:

```diff
- <Card accent="left" accentColor="success">
-   <CardHeader><CardTitle>Deploy succeeded</CardTitle></CardHeader>
- </Card>
+ <Card color="success">                          {/* tints the 1px border */}
+   <CardAction><Badge color="success" size="xs">DEPLOYED</Badge></CardAction>
+   <CardHeader><CardTitle>Deploy succeeded</CardTitle></CardHeader>
+ </Card>
```

### Breaking: `StatCard` `surface` → `variant`

`StatCard` now composes `<Card>`, so its surface is the Card's `variant` (4-way) instead of the old `surface` (2-way):

```diff
- <StatCard label="Revenue" value="$48k" surface="raised" />
+ <StatCard label="Revenue" value="$48k" variant="default" />
- <StatCard label="Revenue" value="$48k" surface="flat" />
+ <StatCard label="Revenue" value="$48k" variant="outline" />
```

`variant` accepts `default` (ring-in-shadow) | `elevated` | `outline` (border, no shadow) | `flat` (filled, no edge).

### Breaking: `ContentCard` deprecated

`ContentCard` (composed) is deprecated. Compose `Card` + `CardHeader` / `CardContent` / `CardAction` directly — the gap-model padding makes the manual wrapper unnecessary. It still ships in 0.44 (with a `@deprecated` JSDoc) and is scheduled for removal in a later minor.

### New (additive, opt-in — no migration needed)

- `<CardAction>` — a composable corner slot (`placement`: 4 corners, `tuck` for icon-button optical alignment). Use for badges, menu buttons, overflow actions. `Card` is now `relative` to anchor it.
- `StatCard` `deltaPlacement="block" | "inline"` — inline rides the value's baseline for compact dashboards.
- `<TruncatedText>` — a text primitive that truncates (`end` / `clamp` / `middle`) AND recovers (tooltip only on real overflow, full string as the accessible name). Applied internally across ~25 file/email/user-text/nav sites.

### Visual changes (no code change required)

- `Card` uses a **gap-model** layout: the container owns vertical padding + inter-slot gap; slots own only horizontal padding. Adding/removing a slot can no longer unbalance the bottom edge. Re-baseline Chromatic if you snapshot the DS.
- A long filename / email / user name / nav label now truncates with an overflow-aware tooltip instead of wrapping or clipping silently.

## v0.43.0 — Anti-convergence surface & elevation pass

One breaking change (`StatCard` `accent` removed). Everything else is a visual refresh that needs no code change — but it shifts Chromatic baselines library-wide, so re-baseline if you snapshot the DS.

### Breaking: `StatCard` `accent` prop removed

The colored left-rail (`accent="default" | "success" | "warning" | "error" | "info"`) is gone. An accent rail on a rounded, shadowed card is the single most recognizable "AI-generated" tell, and it stacked a third edge on a card that already carried a border + shadow.

Migrate — pick the treatment that fits, or drop it (the `delta` arrow already carries trend direction + colour):

```diff
- <StatCard label="Revenue" value="$48k" accent="success" />
+ <StatCard label="Revenue" value="$48k" accentStyle="tint" />
+ <StatCard label="Revenue" value="$48k" icon={<IconCurrencyDollar />} accentStyle="icon" />
+ <StatCard label="Revenue" value="$48k" />
```

`accent` mapped a semantic colour to the rail. The new model separates concerns: **state** rides the `delta` (semantic up/down/neutral colour), **brand accent** rides `accentStyle` (`none` | `icon` | `tint`). There is no per-semantic-colour card accent — semantic status belongs on the `delta`, not the card edge.

### New (additive, opt-in — no migration needed)

- `StatCard`: `surface="raised" | "flat"`, `accentStyle`, `iconFill`, `flash` + `flashSpeed`.
- New `StatFlash` component — a state→identity entrance (a toned glyph settles to the metric icon), `prefers-reduced-motion` gated.
- `AppSidebar`: composable `navItemRadius` (`sm` | `md` | `lg` | `pill`, default `md`).

### Visual changes (no code change required)

- Overlays and cards no longer stack a visible border with a drop shadow — the shadow tokens' own 1px ring is the edge (make-kit Guidelines rule #6). The ring is strengthened, with a light ring in dark mode via the new `--shadow-edge-ring` token.
- `Card` `default` / `elevated` dropped their border (ring-in-shadow). Use `variant="outline"` for a border-led card.
- Sidebar active item: the accent rail was removed; active is now marked by tint + accent text + weight.
- `InputOTP` cells are border-led (dropped a redundant shadow).

## v0.42.0 — Figma Make kit guidelines (no migration needed)

**Non-breaking minor.** No consumer code changes required.

- **New:** `packages/core/make-kit/` ships in the tarball — 26 guideline files Figma Make consumes when registering this package as a Make kit. Includes `Guidelines.md`, `setup.md`, 8 `foundations/*.md`, `components/overview.md`, and 15 per-component deep guides. Reachable at `node_modules/@devalok/shilp-sutra/make-kit/` after install, or via subpath exports `@devalok/shilp-sutra/make-kit` and `/make-kit/*`. Adds ~140 KB to tarball.
- No source code changes. No runtime impact. Existing consumers see a slightly larger install footprint and nothing else.
- See https://developers.figma.com/docs/code/bring-your-design-system-package/ for the Figma Make kit registration flow.

## v0.41.0 — `BREAKING.json` manifest + recipe polish (no migration needed)

**Non-breaking minor.** No consumer code changes required.

- **New:** `packages/core/BREAKING.json` ships in the tarball — a machine-readable record of every breaking change per version. AI agents and migration tooling can `import manifest from '@devalok/shilp-sutra/BREAKING.json'` instead of parsing this file. Schema at `BREAKING.schema.json`.
- **Docs:** Next.js App Router install recipe gained a Tested-on matrix, explicit replace-the-whole-scaffold-globals.css guidance, Turbopack note, and three new gotchas (`pnpm-workspace.yaml`, auto-generated `AGENTS.md` markers, scaffold body-font cascade). No setup change required for existing consumers.
- **Internals:** release.yml now regenerates Agent Skill references before the pre-publish audit (kills the skill-drift email spam class). No impact on the published tarball.

## v0.40.0 — Barrel peer-cliff cleanup + Icon API unification

This release pairs one breaking change (barrel peer-cliff cleanup) with one non-breaking type widening (Icon API unification). Read the breaking section first.

### Icon API unification (mostly non-breaking — one narrowing)

**Mostly non-breaking, with one narrowing for `React.ReactNode`-typed props.** For the 14 components whose `icon` prop was previously `React.ReactNode`, `IconInput` accepts **less** — it excludes `string`, `number`, and iterables. If you store icons in a `Record<string, React.ReactNode>` map or a `icon?: React.ReactNode` field and pass them to a migrated component, `tsc` will fail even though the runtime JSX is valid. **Fix: retype the icon source to `React.ReactElement`** (or import `IconInput`). Known affected props: `CommandItem.icon` (CommandBar/CommandPalette), `ActivityItem.icon` (ActivityFeed), `Chat.Message.Avatar` `icon`. For props that were `ComponentType`-only the change is a genuine widening (accepts more). Build-time only — no runtime impact.

Every icon-accepting prop across the design system now takes the same shape: **`IconInput`**. Before 0.40 there were six distinct prop types for the same conceptual "icon":

| Old shape | Components |
|---|---|
| `React.ReactElement \| null` | Button (startIcon/endIcon), IconButton (icon), Badge (startIcon/endIcon) |
| `React.ReactNode` | 14 components (Combobox option, Stepper step, TreeItem, OAuthButton, AppCommandPalette, CommandRegistry, BottomNavbar, Sidebar's three NavItem types, TopBar, Chat.Message.Avatar, SystemMessage, AIConversation, ActivityFeed, CommandPalette item) |
| `React.ReactNode \| React.ComponentType<{className}>` | EmptyState, StatCard (dual-detect logic duplicated in both source files) |
| `React.ComponentType<{className?}>` | SegmentedControl (option), SlashCommand |
| `IconProps['icon']` (strict Tabler ref) | BulkActionBar (action), Chat.Message.Action |
| `React.ForwardRefExoticComponent<any>` | Toast (internal, sonner pass-through — unchanged) |

All six collapse to `IconInput`:

```ts
type IconInput =
  | React.ReactElement
  | React.ComponentType<{ className?: string; size?: number | string }>
  | null
  | undefined
```

#### Migration

For every prop now typed as `IconInput`, all four shapes work identically:

```tsx
<Button startIcon={<Icon icon={IconPlus} />}>OK</Button>   // canonical
<Button startIcon={<IconPlus />}>OK</Button>                // raw Tabler element
<Button startIcon={IconPlus}>OK</Button>                    // component ref
<Button startIcon={<span>+</span>}>OK</Button>              // custom node
```

**Calls passing a JSX element or component ref still work.** The exception is the narrowing above: if your icon *source* is annotated `React.ReactNode` (a map value or field type), retype it to `React.ReactElement` — one-line per source, not per call site.

**You can now delete `className="h-4 w-4"` overrides** on icon-prop usages — `IconProvider` wires size through context. Stories cleanup is voluntary; behavior unchanged.

**Strict-to-loose call sites that newly compile:**
- `SegmentedControl options[*].icon` previously rejected `<IconX />` instantiated elements (only accepted bare `IconX` refs). Now both work.
- `BulkActionBar actions[*].icon` previously rejected non-Tabler nodes. Now accepts any `IconInput`.
- `Message.Action` same.
- `EmptyState` no longer needs the dual `<X />` / `X` differentiation in your call sites.

#### What got removed internally

- Five duplicate `iconSizeMap` declarations (Badge, Combobox, EmptyState, StatCard, etc.) → one shared `<IconProvider size={token}>` per call site
- Two duplicate dual-detect branches (`React.isValidElement(icon) || ('$$typeof' in icon)`) — replaced with `normalizeIcon()`
- The orphan `IconProps['icon']` references in BulkActionBar + Chat.Message.Action

#### Helpers exported (for consumer composability)

```ts
import type { IconInput } from '@devalok/shilp-sutra/ui/lib/icon-input'
import { normalizeIcon } from '@devalok/shilp-sutra/ui/lib/normalize-icon'

// In your own component:
function MyCard({ icon }: { icon: IconInput }) {
  return (
    <div>
      <IconProvider size="md">{normalizeIcon(icon)}</IconProvider>
    </div>
  )
}
```

Use these in custom wrappers that consume our icon-style props.

### Barrel peer-cliff cleanup (breaking)

**Breaking.** Twelve symbols that statically pulled optional peer dependencies have been removed from their parent barrels (`/ui`, `/composed`, `/ai`, `/ai/blocks`). They remain fully available via their per-component subpath.

#### Why

Optional peer deps (`input-otp`, `sonner`, `date-fns`, `@emoji-mart/*`, `@tiptap/*`, `react-pdf`, `react-zoom-pan-pinch`, `react-markdown`, `react-syntax-highlighter`, `remark-gfm`) were declared `peerDependenciesMeta.optional = true` but the components that needed them were re-exported from the corresponding barrel with **static** ESM `import` statements. Result: a fresh consumer who wrote `import { Text } from '@devalok/shilp-sutra/ui'` without installing `input-otp` got:

```
Module not found: Can't resolve 'input-otp'
```

…at `next build`/`vite build` time. "Optional" was a lie at the bundler level. This release closes that cliff for every affected component.

#### Search-and-replace migration table

For each symbol below, change ONLY the import path. Prop / type signatures are unchanged.

| Symbol(s) | Old (no longer works) | New (in 0.40.0+) | Peer it pulls |
|---|---|---|---|
| `InputOTP`, `InputOTPGroup`, `InputOTPSeparator`, `InputOTPSlot`, `InputOTPProps` | `from '@devalok/shilp-sutra/ui'` | `from '@devalok/shilp-sutra/ui/input-otp'` | `input-otp` |
| `toast`, `formatFileSize`, `ToastActionOptions`, `ToastOptions`, `ToastProps`, `ToastType`, `ToastUndoOptions`, `ToastUploadOptions`, `UploadFile` | `from '@devalok/shilp-sutra/ui'` | `from '@devalok/shilp-sutra/ui/toast'` | `sonner` |
| `Toaster`, `ToasterProps` | `from '@devalok/shilp-sutra/ui'` | `from '@devalok/shilp-sutra/ui/toaster'` | `sonner` |
| `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker`, `CalendarGrid`, `MonthPicker`, `YearPicker`, `Presets`, `useCalendar`, all related `*Props` + `CalendarEvent` + `PresetKey` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/date-picker'` | `date-fns` |
| `EmojiPicker`, `EmojiPickerPopover`, `EmojiData`, `EmojiPickerProps`, `EmojiPickerPopoverProps`, `EmojiSet` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/emoji-picker'` | `@emoji-mart/data` + `@emoji-mart/react` |
| `EmojiNode`, `EmojiNodeAttrs` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/extensions/emoji-node'` (new in 0.40.0) | `@tiptap/*` |
| `createEmojiSuggestion` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/extensions/emoji-suggestion'` (new in 0.40.0) | `@tiptap/*` |
| `FilePreview`, `FilePreviewProps` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/file-preview'` | `react-pdf` + `react-zoom-pan-pinch` |
| `MarkdownViewer`, `MarkdownViewerProps` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/markdown-viewer'` | `react-markdown` + `react-syntax-highlighter` + `remark-gfm` |
| `RichChatInput`, `AudioPlayer`, `AudioWaveform`, `useVoiceRecorder`, all related `*Props` + `*Message` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/rich-chat-input'` | `@tiptap/*` |
| `RichTextEditor`, `RichTextViewer`, `RichTextEditorProps`, `RichTextViewerProps`, `MentionItem`, `ToolbarItem` | `from '@devalok/shilp-sutra/composed'` | `from '@devalok/shilp-sutra/composed/rich-text-editor'` | `@tiptap/*` |
| `BlockRenderer`, `BlockRendererProps` | `from '@devalok/shilp-sutra/ai'` | `from '@devalok/shilp-sutra/ai/block-renderer'` | `react-markdown` + `remark-gfm` (transitively via TextBlock/ErrorBlock) |
| `ErrorBlock` | `from '@devalok/shilp-sutra/ai'` OR `from '@devalok/shilp-sutra/ai/blocks'` | `from '@devalok/shilp-sutra/ai/blocks/error'` (new in 0.40.0) | `react-markdown` + `remark-gfm` |
| `TextBlock` | `from '@devalok/shilp-sutra/ai'` OR `from '@devalok/shilp-sutra/ai/blocks'` | `from '@devalok/shilp-sutra/ai/blocks/text'` (new in 0.40.0) | `react-markdown` + `remark-gfm` |

The seven other AI blocks (`BlockTable`, `ConfirmBlock`, `DividerBlock`, `InfoBlock`, `LoadingBlock`, `StatRowBlock`, `SuccessBlock`) have no peer-dep imports and remain available via `from '@devalok/shilp-sutra/ai/blocks'` (the sub-barrel) or `from '@devalok/shilp-sutra/ai'` (the main barrel).

#### Codemod helper (recommended)

The fastest path is the official ESLint plugin — its `prefer-per-component-import` rule detects every peer-cliff symbol still imported from a barrel and **autofixes the import path** for you:

```bash
pnpm add -D @devalok/eslint-plugin-shilp-sutra
# one-shot codemod across your source
pnpm eslint --fix --config node_modules/@devalok/eslint-plugin-shilp-sutra/migration src/
```

Or wire `shilpSutra.configs['flat/migration']` into your `eslint.config.ts` and run `eslint --fix`. The rule splits multi-symbol barrel lines correctly, which the `sed` approach below cannot.

<details><summary>Manual <code>sed</code> fallback (single-symbol lines only)</summary>

```bash
# Replace barrel imports of toast / Toaster with per-component imports
grep -rl "from '@devalok/shilp-sutra/ui'" src/ | xargs sed -i.bak \
  -e "s|import { \\(.*\\)toast\\(.*\\)} from '@devalok/shilp-sutra/ui'|import { toast } from '@devalok/shilp-sutra/ui/toast'\\nimport { \\1\\2} from '@devalok/shilp-sutra/ui'|"
```

(Adjust per project — the regex assumes a single `toast` import on the line. For multi-symbol lines, the ESLint autofix above is far more reliable.)

</details>

#### Per-chart subpaths added (non-breaking)

`/ui/charts/<chart>` subpaths are now exported for `area-chart`, `bar-chart`, `chart-container`, `gauge-chart`, `line-chart`, `pie-chart`, `radar-chart`, `sparkline`. The `/ui/charts` barrel still works and still pulls all 9 d3-\* peers — but if you only need `BarChart`, `import { BarChart } from '@devalok/shilp-sutra/ui/charts/bar-chart'` pulls only the d3-\* peers it actually needs (`d3-scale`, `d3-axis`, `d3-selection`).

#### What didn't change

- All per-component subpaths existed before 0.40.0 (except the 4 new ones noted above). Consumers already importing per-component need zero changes.
- Component APIs, prop signatures, types, runtime behavior, default styles: all unchanged.
- Storybook stories, tests, internal imports inside the DS itself: all use relative paths and were never affected.

#### Why this isn't behind a flag

There is no good additive solution. Tree-shaking can't drop a static `import 'sonner'` if `sonner` isn't on disk — the resolver fails before tree-shaking runs. Lazy-imports (`import('sonner')`) move the failure from build-time to runtime, which is worse. Removing the barrel re-export is the only fix.

## v0.39.0 — Shape presets & semantic radius role tokens

No API breaks. Component prop signatures unchanged. But the visual output of several components shifts because radius is now role-driven, not per-size ad-hoc.

### What changed under the hood

Radius now has TWO layers:

- **Primitive scale** (private, unchanged): `--radius-ds-sm/md/lg/xl/2xl/full`
- **Semantic roles** (new, public): `--radius-control`, `--radius-control-inner`, `--radius-surface`, `--radius-overlay-sm`, `--radius-overlay`, `--radius-overlay-lg`, `--radius-pill`, `--radius-bubble`

Components reference roles. A new `[data-shape]` attribute on `<html>` (or any subtree) remaps all roles at once. Three presets ship: `sharp`, `slightly-rounded` (default), `rounded`.

### Visual changes consumers see

| Component | Was (px) | Now (px) | Why |
|---|---|---|---|
| Button md | 10 | 6 | Per-size radius scaling removed — same role, same radius |
| Button lg | 16 | 6 | Same |
| Button icon-lg | 10 | 6 | Same |
| Input lg | 10 | 6 | Now matches Button at same height |
| Tabs trigger (contained) | 10 | 6 | Now matches Button |
| SegmentedControl item | 10 | 9999 | Renamed `pill` is now actually pill |
| Menubar trigger | 2 | 6 | Now matches DropdownMenu item |
| Autocomplete listbox | 6 | 10 | Now matches Popover / DropdownMenu |
| ChatMessage bubble | 24 | 24 (preset-aware) | Now `rounded-bubble` — shifts with preset |
| Everything else | unchanged | | |

### If you liked the old "chunky big controls" look

Either set the `rounded` preset on `<html>`:

```diff
- <html lang="en">
+ <html lang="en" data-shape="rounded">
```

Or override just `--radius-control` to keep the previous v0.38 default:

```css
:root { --radius-control: 10px; }
```

### Opting into the preset system

To set the default (slightly-rounded) preset on your app explicitly:

```diff
- <html lang="en">
+ <html lang="en" data-shape="slightly-rounded">
```

Scoped overrides also work — apply `data-shape` to any subtree:

```tsx
<div data-shape="sharp">
  <DeveloperConsole />
</div>
```

### Migrating your own code from `rounded-ds-*` / `rounded-full`

Your existing classes still render (primitive tokens are unchanged), but they're pinned to fixed values and won't respond to `[data-shape]` presets. To opt in, swap to role tokens:

```diff
- className="rounded-ds-md ..."       /* control-sized, 6px */
+ className="rounded-control ..."

- className="rounded-ds-lg ..."       /* surface context — Card, Alert, panel */
+ className="rounded-surface ..."

- className="rounded-ds-lg ..."       /* overlay context — Popover, Dropdown, listbox */
+ className="rounded-overlay ..."

- className="rounded-ds-xl ..."       /* Dialog, Sheet, picker panel */
+ className="rounded-overlay-lg ..."

- className="rounded-ds-2xl ..."      /* chat bubble */
+ className="rounded-bubble ..."

- className="rounded-ds-sm ..."       /* checkbox box, focus ring, small chip */
+ className="rounded-control-inner ..."

- className="rounded-ds-full ..."     /* and bare rounded-full */
+ className="rounded-pill ..."
```

A re-runnable codemod lives at `scripts/migrate-radius-roles.mjs` in this repo. Dry-run by default — pass `--write` to apply.

### Custom presets

Define your own `[data-shape="..."]` block:

```css
[data-shape="brand-soft"] {
  --radius-control:        8px;
  --radius-control-inner:  3px;
  --radius-surface:        14px;
  --radius-overlay-sm:     8px;
  --radius-overlay:        14px;
  --radius-overlay-lg:     20px;
  --radius-pill:           9999px;
  --radius-bubble:         28px;
}
```

```html
<html data-shape="brand-soft">
```

### Reference

- Role token map: `packages/core/llms-full.txt` → "Shape Presets & Radius Roles" section
- Recipe: `packages/core/docs/recipes/customize-brand.md` → "Shape presets" section
- Storybook: `Foundations / Shape Presets` story — interactive switcher + custom-preset demo

---

## v0.38.0 — Deprecation sweep

0.38 removes 8 deprecated APIs that were soft-deprecated in earlier minor releases. All were available as aliases alongside their replacements; this release drops the aliases.

### Removed APIs and replacements

| Package | Removed | Use instead |
|---------|---------|-------------|
| `@devalok/shilp-sutra/ui/alert` | `variant="filled"` | `variant="solid"` |
| `@devalok/shilp-sutra/ui/banner` | `action` prop | `actions` prop |
| `@devalok/shilp-sutra/ui/input` | `startIcon` / `endIcon` props | `startSection` / `endSection` |
| `@devalok/shilp-sutra/ui/input` | `inputVariants` export | `inputWrapperVariants` |
| `@devalok/shilp-sutra/ui/segmented-control` | `variant="accent"` | `variant="solid"` |
| `@devalok/shilp-sutra/composed` | `ResponsiveOverlay` component | `Dialog` or `Sheet` directly |
| `@devalok/shilp-sutra/tailwind` | entire `./tailwind` export | CSS import (see v0.37 guide) |
| `@devalok/shilp-sutra/hooks/use-toast` | entire `./hooks/use-toast` export | `toast` from `@devalok/shilp-sutra` |

### Quick migration checklist

**Alert `variant="filled"` → `variant="solid"`:**
```diff
- <Alert variant="filled" color="error">Error occurred</Alert>
+ <Alert variant="solid" color="error">Error occurred</Alert>
```

**Banner `action` → `actions`:**
```diff
- <Banner action={<Button>Dismiss</Button>}>Update available</Banner>
+ <Banner actions={<Button>Dismiss</Button>}>Update available</Banner>
```

**Input `startIcon`/`endIcon` → `startSection`/`endSection`:**
```diff
- <Input startIcon={<Icon icon={IconSearch} />} />
+ <Input startSection={<Icon icon={IconSearch} />} />
```

**Input `inputVariants` → `inputWrapperVariants`:**
```diff
- import { inputVariants } from '@devalok/shilp-sutra'
+ import { inputWrapperVariants } from '@devalok/shilp-sutra'
```

**SegmentedControl `variant="accent"` → `variant="solid"`:**
```diff
- <SegmentedControl variant="accent" ... />
+ <SegmentedControl variant="solid" ... />
```

**ResponsiveOverlay → Dialog or Sheet:**
```diff
- import { ResponsiveOverlay } from '@devalok/shilp-sutra/composed'
- <ResponsiveOverlay open={open} onOpenChange={setOpen} title="Details">...</ResponsiveOverlay>
+ import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@devalok/shilp-sutra'
+ <Dialog open={open} onOpenChange={setOpen}>
+   <DialogContent><DialogHeader><DialogTitle>Details</DialogTitle></DialogHeader>...</DialogContent>
+ </Dialog>
```

**`./tailwind` preset:** Already removed in 0.37 — follow the [v0.37 migration guide](#v0370--tailwind-4-css-first-migration) if you haven't already.

**`hooks/use-toast`:**
```diff
- import { toast } from '@devalok/shilp-sutra/hooks/use-toast'
+ import { toast } from '@devalok/shilp-sutra'
```

## v0.37.0 — Tailwind 4 CSS-first migration

0.37 completes the Tailwind 3 → 4 migration that started in 0.34. The JS preset is gone. Tokens now ship as `@theme` CSS variables that TW4 consumes directly. **This is a breaking setup change; component APIs are unchanged.**

> **During the RC window, 0.37 lives on the `@next` dist-tag.** Use `@devalok/shilp-sutra@next` in the commands below. Once stable promotes to `@latest`, plain `@devalok/shilp-sutra` or `@latest` resolves to 0.37.x too. Pin via `@0.37.0` only after the stable release announcement.

### Before you start — two constraints inherited from Tailwind 4 itself

- **Browser support.** Tailwind 4 requires **Safari 16.4+, Chrome 111+, Firefox 128+**. Consumer apps that must support older browsers should stay on 0.36 (via the `latest-0.36` dist-tag) until they can drop those targets.
- **PostCSS plugin rename.** If your app had a TW3-style `postcss.config.js` like this:
  ```js
  // TW3 — no longer works in v4
  module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
  ```
  update to the v4 plugin:
  ```js
  // TW4 — required
  module.exports = { plugins: { '@tailwindcss/postcss': {} } }
  ```
  Install: `pnpm add -D @tailwindcss/postcss`. Next.js 15+ / Vite users whose build already handles this transparently can skip this step.

### Quick migration checklist

1. Install the new required peers:
   ```sh
   pnpm add framer-motion @devalok/shilp-sutra@next
   # if you use toasts:
   pnpm add sonner
   ```
2. Rewrite `app/globals.css`:
   ```diff
   - @import "tailwindcss";
   - @config "./tailwind.config.ts";
   + @import "tailwindcss";
   + @import "@devalok/shilp-sutra/css";
   ```
3. **Delete `tailwind.config.ts`** — unless you have your own plugins (see "Keeping your own plugins" below).
4. Verify `next.config.ts` transpiles BOTH packages:
   ```ts
   transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
   ```
5. Run `pnpm why framer-motion` and confirm **a single version** (see "Framer-motion single-copy check").
6. Run a dark-mode sanity check (see below).
7. `pnpm build` — should succeed with no warnings mentioning shilp-sutra.

### Before / after: globals.css

**Before (0.36.x):**
```css
@import "tailwindcss";
@config "./tailwind.config.ts";
```

**After (0.37.0):**
```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

/* Optional — your own plugins or content globs go here */
@plugin "@tailwindcss/typography";
@source "./app/**/*.{ts,tsx}";
```

`@import "@devalok/shilp-sutra/css"` pulls in our full token set (`@theme` blocks for color, spacing-ds, text-ds, leading-ds, radius, shadow, ease, duration, breakpoints, z-layers, animate), custom utilities (typography composites, focus-ring, touch-target, safe-area insets, z-layer utilities), the dark-mode `@custom-variant`, and a `@source` directive that scans our compiled classes.

### Delete tailwind.config.ts

You **no longer need** `tailwind.config.ts` for shilp-sutra. TW4 config is CSS-first via `@theme`. Delete it if that was its only purpose.

### Keeping your own plugins

If you had TW plugins of your own (e.g., `@tailwindcss/typography`, `@tailwindcss/forms`), keep them with the TW4 CSS directive:

```css
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

No JS config file required. If you had custom theme extensions, translate them to `@theme` blocks inside your `globals.css`.

### Legacy TW3 config APIs removed in v4

If your old `tailwind.config.ts` used any of these, they no longer exist:

| Removed API | Replacement |
|---|---|
| `corePlugins: { … }` | Omit utilities you don't want by not including them; use `@source not "..."` or custom variants to exclude patterns |
| `safelist: [...]` | `@source inline("bg-red-500 text-lg")` in globals.css |
| `separator: ':'` | Not configurable; always `:` |
| `prefix: 'tw-'` | `@import "tailwindcss" prefix(tw);` at top of globals.css |
| `resolveConfig()` / `defaultTheme` helpers | Read `@theme` CSS vars at runtime via `getComputedStyle(document.documentElement)` |
| `content: [...]` | `@source "./app/**/*.{ts,tsx}"` in globals.css |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark, .dark *));` (already included in our `/css` bundle) |

If you relied on `resolveConfig()` for runtime theme access in TypeScript (e.g., to pull brand colors into framer-motion variants), migrate to reading CSS custom properties directly — they're all declared on `:root` / `.dark` by the `/css` import.

### Peer dependency changes

| Dep | 0.36.x | 0.37.0 |
|---|---|---|
| `framer-motion` | bundled | **required peer** (`^12.0.0`) |
| `sonner` | bundled | **optional peer** (`^2.0.0`) — only if you render a `<Toaster />` |
| `tailwindcss` | `^3.4.0 \|\| ^4.0.0` | **`^4.0.0` only** |
| `use-sync-external-store` | optional peer | now in `dependencies` (auto-installed) |

**Why framer-motion moved to peer:** module-scoped React contexts (`MotionConfig`, `AnimatePresence`, `LayoutGroup`) fail silently if two copies resolve. Making it a peer means *you* pin the version and pnpm dedupes it.

### Framer-motion single-copy check

Run:
```sh
pnpm why framer-motion
```

**Expected:** one version, one instance. If you see two different versions, run:
```sh
pnpm dedupe
```
If dedupe doesn't collapse them (version ranges don't overlap), pin `framer-motion` at the top of your app's `package.json` `dependencies`, then `pnpm install`.

> **Note:** `pnpm why` reports what the lockfile resolved. Under strict-hoist, two copies can still coexist if they satisfy different peer ranges. If animations feel "stuck" or `AnimatePresence` exits don't fire, check `pnpm list framer-motion --depth=Infinity` as a second-level verification.

### Dark mode sanity check

Our `.dark` variant now uses `@custom-variant dark (&:where(.dark *))`. After upgrading, render a representative screen with `.dark` toggled on `<html>` (or your usual ancestor) and verify:

- Card backgrounds re-theme (not stuck on light)
- Solid buttons keep contrast
- Input borders are visible in dark
- Toast colors invert correctly
- Any surface shadows still appear (check `shadow-raised`, `shadow-overlay`)

If any of these is stuck on light, the `.dark` class isn't on an ancestor — add it to `<html>` (recommended) or `<body>`.

### Token collisions

Our spacing scale is namespaced `--spacing-ds-*` (→ `p-ds-03`, `gap-ds-04` etc.) to avoid colliding with TW4's default numeric spacing (`p-4`, `gap-6`). **If you define your own `--spacing-4` in `@theme`, it wins** — our utilities are `p-ds-04` not `p-4`. Typography uses `--text-ds-*`, `--leading-ds-*`. Radius is unprefixed (`--radius`, `--radius-ds-*`) because bare `rounded` / `rounded-ds-md` are the common idiom.

### Source class changes (in consumer code too)

If your own app code used any of these TW3-era patterns, update:

| TW3 (dead in TW4) | TW4 |
|---|---|
| `w-[--my-var]` | `w-(--my-var)` |
| `theme(spacing.4)` inside `w-[…]` | literal value (e.g., `1rem`) |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| bare `shadow` | `shadow-sm`, `shadow-raised`, etc. |
| `outline-none` | `outline-hidden` |
| `rounded-sm` | `rounded-xs` |
| `!prefix` | `suffix!` |

Quick grep in your repo:
```sh
grep -rn 'w-\[--\|bg-gradient-to-\|theme(spacing' src/
```

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Module not found: Can't resolve 'framer-motion'` on `next build` | framer-motion moved to peer, not installed | `pnpm add framer-motion` |
| `Module not found: Can't resolve 'sonner'` on `next build` | You import `Toaster`/`toast` from shilp-sutra but sonner isn't installed (optional peer) | `pnpm add sonner` |
| Toasts render without styling / `toast()` no-ops in dev | Same as above, but you didn't notice the build warning | `pnpm add sonner` |
| Classes like `p-ds-03` produce no CSS | missing `@import "@devalok/shilp-sutra/css"` in globals.css | add it |
| Classes like `p-ds-03` produce no CSS (import present) | pnpm strict-hoist hiding our dist from `@source` | verify `node_modules/.pnpm/@devalok+shilp-sutra@0.37.0/node_modules/@devalok/shilp-sutra/dist/` exists |
| Dark mode not switching | `.dark` not on an ancestor of the component | add `.dark` to `<html>` via `next-themes` or your color-mode hook |
| Animations feel broken / exits don't fire | two framer-motion copies | see "Framer-motion single-copy check" |
| `@config` warning on build | legacy config import in your CSS | remove `@config "..."` and use `@import "@devalok/shilp-sutra/css"` |
| `Unknown at-rule @theme` / `Unknown at-rule @utility` | PostCSS config still references `tailwindcss` + `autoprefixer` (TW3 style). TW4 uses a single plugin. | Install `@tailwindcss/postcss` and replace both plugins with `'@tailwindcss/postcss': {}` in `postcss.config.js`. See "Before you start" above. |
| `[@devalok/shilp-sutra] DEPRECATION: The JS preset at "./tailwind"...` notice on build | your `tailwind.config.ts` still has `presets: [shilpSutra]`, or a dependency's does | delete that line AND add `@import "@devalok/shilp-sutra/css"` to globals.css (both steps — the preset is a no-op stub in 0.37, removed in 0.38) |
| **App renders unstyled after upgrade; no build error** | You upgraded the package but did not add `@import "@devalok/shilp-sutra/css"` to `globals.css`. TW4 silently drops unknown utilities, so every `bg-surface-raised`/`p-ds-*`/`shadow-raised` class is emitting zero CSS. | Add the `@import` per step 2 above. If you see the DEPRECATION notice in your build output, heed it — that's the signal for exactly this scenario. |
| Dark mode no longer switches (worked on 0.36) | Same as above — the `@custom-variant dark` declaration lives in the DS `/css` bundle. Without the import, `dark:*` utilities also silently no-op. | Add `@import "@devalok/shilp-sutra/css"` to globals.css. |

### Upgrading from &lt; 0.36

Read the intermediate sections below (0.34, 0.33, 0.32, 0.30, 0.29, 0.23, 0.9) in order. Each has component-level breakage you'll need to resolve before 0.37's setup-level breakage matters.

### Need to pin 0.36 temporarily?

Use the `latest-0.36` dist-tag:
```sh
pnpm add @devalok/shilp-sutra@latest-0.36
```
This keeps you on the last TW3-compatible minor. We will backport critical security fixes to the `latest-0.36` line through at least 2026-10-01.

### Rollback recipe (for maintainers)

See [`docs/rollback.md`](./docs/rollback.md) for the executable playbook.

## v0.34.0 (Tailwind 4 + Toolchain)

**Tailwind CSS 3 → 4:**
- `outline-none` → `outline-hidden`
- `rounded-sm` → `rounded-xs`
- `backdrop-blur-sm` → `backdrop-blur-xs`
- `!prefix` → `suffix!` important syntax
- Replace `darkMode: 'class'` with `@variant dark (&:is(.dark *))` in CSS
- Add `@import "tailwindcss"` + `@config` to your CSS entry point
- Peer dep accepts both `^3.4.0 || ^4.0.0`

**Other toolchain:**
- `tailwind-merge` 3.0 → 3.5 (required for TW4 class recognition)
- TypeScript 5.7 → 6.0.2 (`types` defaults to `[]` — add `"types": ["node"]` to tsconfig if needed)
- ESLint 9 → 10 (config lookup starts from linted file directory, not CWD)
- `react-zoom-pan-pinch` 3 → 4 (`onTransformed` → `onTransform`)

## v0.33.0

**2 breaking changes:**

### EmojiSuggestion factory pattern

```diff
- import { EmojiSuggestion } from '@devalok/shilp-sutra/composed'
+ import { createEmojiSuggestion } from '@devalok/shilp-sutra/composed'
+ const EmojiSuggestion = createEmojiSuggestion()  // or createEmojiSuggestion('apple')
```

### Emoji HTML output changed

Non-native `emojiSet` renders emoji as `<span data-emoji-id="..." role="img">` nodes, not raw Unicode. `plainText` still returns Unicode.

## v0.32.0

**6 breaking changes:**

### Button variant/color rename

```diff
- <Button variant="default">        →  <Button variant="solid">
- <Button variant="destructive">    →  <Button variant="solid" color="error">
- <Button color="default">          →  <Button color="accent">
```

### Chip removed — use Badge

```diff
- import { Chip } from '@devalok/shilp-sutra/ui'
+ import { Badge } from '@devalok/shilp-sutra/ui'
```

### SegmentedControl rewritten

```diff
- <SegmentedControl variant="filled">   →  <SegmentedControl variant="accent">
- <SegmentedControl variant="tonal">    →  <SegmentedControl variant="default">
- <SegmentedControlItem>                →  (no longer exported — use options array)
- size="small|medium|big"               →  size="sm|md|lg"
```

### TopBar renders as `<header>`

Was `<div>`, now `<header>`. If you had a wrapping `<header>`, remove it to avoid nested landmarks.

### Surface token rename

```diff
- bg-surface-1  →  bg-surface-base
- bg-surface-2  →  bg-surface-raised
- bg-surface-3  →  bg-surface-raised-hover
- bg-surface-4  →  bg-surface-raised-active
```

### Shadow token rename

```diff
- shadow-01  →  shadow-raised
- shadow-02  →  shadow-raised-hover
- shadow-03  →  shadow-floating
- shadow-04  →  shadow-overlay
```

## v0.30.0

- **`@devalok/shilp-sutra-karm` removed** — Domain components moved to Karm app repo. The npm package is deprecated at v0.9.0.

No component API breakage. Drop-in upgrade from 0.29.0.

## v0.29.0

**4 breaking changes:**

### Warning color remapped (yellow → amber-bright)

`warning-*` tokens now use warm amber (OKLCH hue 65-70) instead of yellow (hue 85). If you hardcoded any `--yellow-*` primitives for warning states, switch to `--amber-bright-*` or the semantic `warning-*` tokens.

### Button icon API change

```tsx
// Before (0.28.x)
<Button startIcon={<IconPlus />}>Add</Button>

// After (0.29.0)
<Button startIcon={<Icon icon={IconPlus} />}>Add</Button>
```

### Badge rewrite

```tsx
// Before (0.28.x)
<Badge variant="secondary">Tag</Badge>
<Badge variant="destructive">Error</Badge>

// After (0.29.0)
<Badge variant="subtle">Tag</Badge>
<Badge variant="solid" color="error">Error</Badge>
```

Removed: `variant="secondary"`, `variant="destructive"`, `color="brand"`.
Added: `variant="soft"`, `color="custom"`, interactive props, `Badge.Indicator`, `Badge.Group`.

### Chip deprecated

```tsx
// Before
<Chip label="Tag" onDelete={fn} />

// After
<Badge onClick={fn} onDismiss={fn}>Tag</Badge>
```

## v0.23.0

**Surface and shadow token migration.** See the detailed guide: [plans/2026-03-16-surface-shadow-consistency-design.md](plans/2026-03-16-surface-shadow-consistency-design.md).

Key renames:
- `bg-surface-1` → `bg-surface-base`
- `bg-surface-2` → `bg-surface-raised`
- `bg-surface-3` → `bg-surface-raised-hover`
- `bg-surface-4` → `bg-surface-raised-active`
- `shadow-01` through `shadow-05` → `shadow-raised`, `shadow-raised-hover`, `shadow-floating`, `shadow-overlay`

## v0.9.0

**Dependency bundling.** All runtime deps now bundled into dist. Only React + peer deps stay external. Fixes React #527 in Next.js + pnpm. No API changes, but consumers should add to `next.config.js`:

```js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"]
```
