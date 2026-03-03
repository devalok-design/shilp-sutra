# Gap Components Design: Combobox & FileUpload

**Date:** 2026-03-02
**Source spec:** `karm-v2/docs/plans/2026-03-02-shilp-sutra-gap-components-spec.md`
**Status:** Approved

---

## Context

The karm-v2 migration identified 2 genuine gap components in shilp-sutra that are duplicated inline across the codebase. Both are generic UI primitives that belong in `src/ui/`.

**Decision:** Build Combobox as a new component (not extend Autocomplete) because they serve different UX patterns — Autocomplete is an inline input with suggestions, Combobox is a button trigger that opens a searchable popover dropdown.

---

## 1. Combobox (`src/ui/combobox.tsx`)

### Architecture

Radix Popover wrapping a search input + scrollable option list. Single flat component (not compound — 7 props, under the 8-prop threshold).

### Interaction Model

- **Trigger:** Button-like element showing current selection (single) or pills (multi). Click opens popover.
- **Popover:** Auto-focused search input at top, scrollable option list below.
- **Filtering:** Client-side `useMemo` filter on `option.label`.
- **Multi-select pills:** Max 2 visible in trigger + "+N more" chip.

### Keyboard

| Key | Action |
|-----|--------|
| ArrowDown/Up | Navigate options |
| Enter | Select/toggle highlighted option |
| Escape | Close popover |
| Home/End | Jump to first/last option |

### ARIA

- Trigger: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`
- Search input: `aria-controls` pointing to listbox
- List: `role="listbox"`, `aria-multiselectable` when `multiple`
- Options: `role="option"`, `aria-selected`, `aria-disabled`
- Keyboard focus: `aria-activedescendant`

### Token Mapping

| Element | Token |
|---------|-------|
| Trigger bg | `--color-field` |
| Trigger border | `--color-border-default` |
| Trigger text | `--color-text-primary` |
| Popover bg | `--color-layer-01` |
| Popover border | `--color-border-subtle` |
| Popover shadow | `--shadow-02` |
| Search input bg | `--color-field-02` |
| Option hover | `--color-interactive-subtle` |
| Selected text/icon | `--color-interactive` |
| Empty message | `--color-text-tertiary` |
| Pill bg | `--color-interactive-subtle` |
| Pill remove | `--color-icon-secondary` |

### Dependencies

- `@primitives/react-popover` (vendored)
- `@tabler/icons-react` (IconCheck, IconChevronDown, IconSearch, IconX)
- `cn` from `./lib/utils`

### Props

Per spec: `options`, `value`, `onChange`, `placeholder`, `searchPlaceholder`, `emptyMessage`, `multiple`, `disabled`, `className`, `triggerClassName`, `maxVisible` (default 6), `renderOption`.

---

## 2. FileUpload (`src/ui/file-upload.tsx`)

### Architecture

Pure custom component. Hidden `<input type="file">` with a visible drop zone that handles drag events. Two modes: default (drop zone) and compact (button).

### Interaction Model

- **Default mode:** Dashed-border drop zone. Click anywhere to open file picker. Drag files over for visual feedback.
- **Compact mode:** Styled button with paperclip icon. Click to open file picker.
- **Validation:** File type against `accept`, file size against `maxSize` — checked before calling `onFiles`.
- **Progress:** When `uploading=true`, progress bar replaces sublabel, icon becomes spinner.

### Drag State Machine

```
idle → (dragenter) → dragActive → (dragleave/drop) → idle
                                → (drop + valid) → calls onFiles
                                → (drop + invalid) → shows error
```

### ARIA

- Drop zone: `role="button"`, `tabIndex={0}`, `aria-label`
- Hidden input: `aria-hidden="true"`
- Error: `role="alert"`, `aria-live="polite"`
- Progress: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### Token Mapping

| Element | Token |
|---------|-------|
| Zone border (dashed) | `--color-border-default` |
| Zone bg | `--color-field` |
| Drag active border | `--color-interactive` |
| Drag active bg | `--color-interactive-subtle` |
| Icon | `--color-icon-secondary`, 32px |
| Label text | `--color-text-secondary`, `--font-size-sm` |
| Sublabel text | `--color-text-tertiary`, `--font-size-xs` |
| Error text | `--color-error`, `--font-size-xs` |
| Progress fill | `--color-interactive` |
| Progress track | `--color-field` |

### Dependencies

- `@tabler/icons-react` (IconUpload, IconPaperclip, IconLoader2)
- `cn` from `./lib/utils`

### Props

Per spec: `accept`, `maxSize` (default 10MB), `multiple`, `uploading`, `progress`, `onFiles`, `error`, `compact`, `disabled`, `className`, `label`, `sublabel`.

---

## Deliverables Per Component

1. Component file (`src/ui/<name>.tsx`)
2. Storybook stories (`src/ui/<name>.stories.tsx`)
3. Unit tests (`src/ui/<name>.test.tsx`)
4. Barrel export in `src/ui/index.ts`

## Convention Compliance

Both components will follow CONTRIBUTING.md checklist:
- `React.forwardRef` with proper element type
- `displayName` set
- `className` prop merged via `cn()`
- Props spread
- Exported prop types
- Unit test with `vitest-axe`
- Story with `tags: ['autodocs']`
