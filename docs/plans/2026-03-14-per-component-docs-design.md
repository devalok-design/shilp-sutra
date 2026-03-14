# Per-Component Documentation System

> Design doc for replacing the hand-written `llms-full.txt` with per-component markdown files
> that combine API reference + version changelog, concatenated by a build script.

**Date:** 2026-03-14
**Status:** Approved

---

## Problem

- `CHANGELOG.md` is version-grouped — an AI agent looking for Button's history must scan the entire file
- `llms-full.txt` has API reference but no changelog per component
- No single place an AI agent can look up "what changed in component X and how to use it"
- Manual maintenance of `llms-full.txt` is error-prone and has caused missed updates before

## Decision Summary

| Decision | Choice |
|----------|--------|
| File structure | Per-component `.md` files in `docs/components/{category}/` |
| Relationship to `llms-full.txt` | Replaces it — build script concatenates per-component files into `llms-full.txt` |
| `llms.txt` | Unchanged — stays as a concise cheatsheet |
| Audience | Both internal AI agents (Claude Code on Karm) and external consumer AI agents |
| Changelog granularity | Backfill from all 18 versions in `CHANGELOG.md` |
| Component detection | Auto-detect from `src/` — build fails if a component is missing its doc file |

---

## File Structure

```
packages/core/
  docs/
    components/
      _header.md              ← architecture notes (two-axis system, tokens, etc.)
      ui/
        accordion.md
        alert.md
        button.md
        ...                   ← one file per ui component
      composed/
        activity-feed.md
        command-palette.md
        ...                   ← one file per composed component
      shell/
        sidebar.md
        top-bar.md
        ...                   ← one file per shell component
  scripts/
    build-component-docs.mjs  ← new build script
  llms-full.txt               ← GENERATED output (git-tracked, ships with npm)
```

---

## Per-Component File Format

```markdown
# ComponentName

- Import: @devalok/shilp-sutra/{category}/{kebab-name}
- Server-safe: Yes | No
- Category: ui | composed | shell

## Props
    propName: type (default value if any)
    ...

## Compound Components
    Root (root)
      Child1
        GrandChild1

## Defaults
    prop1="value", prop2="value"

## Example
  <ComponentName prop="value">
    children
  </ComponentName>

## Gotchas
- Important warnings and common mistakes

## Changes
### v0.18.0
- **Added** description of what was added
- **Changed** description of what changed
- **Fixed** description of what was fixed
- **Removed** description of what was removed

### v0.12.0
- **Fixed** some earlier fix
```

### Format Rules

- Same fields as current `llms-full.txt` entries: Props, Compound Components, Defaults, Example, Gotchas
- Changes section: newest version first, only versions where the component actually changed
- Change entries use prefixes: `Added`, `Changed`, `Fixed`, `Removed` (matching Keep a Changelog)
- Components with no recorded changes get: `### v0.1.0` → `- **Added** Initial release`

---

## Build Script: `build-component-docs.mjs`

### Behavior

1. **Scan** `src/ui/`, `src/composed/`, `src/shell/` for component files
2. **Match** each component to `docs/components/{category}/{kebab-name}.md`
3. **Fail** with an error listing any components missing their doc file (publish gate)
4. **Concatenate** all doc files:
   - Start with `_header.md` (architecture notes)
   - Then UI components (alphabetical)
   - Then Composed components (alphabetical)
   - Then Shell components (alphabetical)
   - Section dividers between categories
5. **Write** output to `llms-full.txt`

### Component Detection Rules

**Included:**
- `.tsx` files directly in `src/ui/`, `src/composed/`, `src/shell/`
- Subdirectories (e.g. `tree-view/`, `charts/`, `date-picker/`) — treated as one component per directory

**Excluded:**
- `*.test.*`, `*.stories.*`, `*.mdx` files
- `index.ts`, `*-types.ts`, type-only files
- `lib/` and `__tests__/` directories
- `.js` files (stale compiled artifacts, per project rule)

### Flags

- Default: validate + generate `llms-full.txt`
- `--check`: validate only (no write) — for CI

### Integration

- Runs as part of `pnpm build` in core package (post-vite, alongside other post-build scripts)
- Runnable standalone: `node scripts/build-component-docs.mjs`

---

## Header File: `_header.md`

Contains the architecture notes currently at the top of `llms-full.txt`:

- Package name + version (read from `package.json`)
- Two-axis variant system explanation
- Server-safe component list
- Token architecture (OKLCH 12-step)
- Toast setup pattern
- Form accessibility pattern

This file is manually maintained (not auto-generated).

---

## Backfill Strategy

### Phase 1: Generate Skeleton Files

Script scans all components and creates a doc file per component with:
- Current API reference migrated from existing `llms-full.txt` entries
- Empty `## Changes` section

### Phase 2: Parse CHANGELOG.md

Extract every component mention per version and tag with Added/Changed/Fixed/Removed.

### Phase 3: Distribute Entries

Slot each changelog entry into the correct component's `## Changes` section.

Cross-cutting entries (e.g. "all overlays migrated to Framer Motion") get duplicated
into each affected component's file with appropriate context.

### Phase 4: Manual Review

- Verify no entries were missed or mis-attributed
- Components with no changelog entries get: `### v0.1.0` → `- **Added** Initial release`

### Phase 5: Validate

Run `build-component-docs.mjs` — generated `llms-full.txt` should contain same API info
as the current version, plus changelog sections.

### Parallelization

Three agents can work simultaneously — one per category (ui, composed, shell).

---

## Publishing Checklist Updates

### New Checklist Item

Added after "Stories" and before "Build":

> **Component docs**: Every new/changed component has an up-to-date
> `docs/components/{category}/{name}.md` with a Changes entry for this version

### Retired Manual Step

"Update llms-full.txt" becomes automatic — the build script generates it.
`llms.txt` still requires manual updates for breaking changes.

### CLAUDE.md Update

- Add component docs as a publish gate
- Note that `llms-full.txt` is generated — do not hand-edit
- Add "update component doc files" to the publishing checklist

---

## What Does NOT Change

- `llms.txt` — stays as a concise cheatsheet, manually maintained
- `CHANGELOG.md` — stays as the version-grouped project changelog
- Storybook stories — still required as a separate publish gate
- `llms-full.txt` filename and npm shipping — consumers see no change
