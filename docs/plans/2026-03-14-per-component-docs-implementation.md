# Per-Component Documentation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hand-written `llms-full.txt` with per-component markdown files that combine API reference + version changelog, concatenated by a build script.

**Architecture:** Each of the 91 components gets a `docs/components/{category}/{name}.md` file. A Node.js build script scans source directories, validates coverage, and concatenates all docs into `llms-full.txt`. The header (architecture notes) lives in `_header.md`.

**Tech Stack:** Node.js (ESM), fs/path stdlib, package.json for version

**Design doc:** `docs/plans/2026-03-14-per-component-docs-design.md`

---

## Component Inventory (91 total)

### UI (65)
accordion, alert, alert-dialog, aspect-ratio, autocomplete, avatar, badge, banner, breadcrumb, button, button-group, card, charts, checkbox, chip, code, collapsible, color-input, combobox, container, context-menu, data-table, data-table-toolbar, dialog, dropdown-menu, file-upload, form, hover-card, icon-button, input, input-otp, label, link, menubar, navigation-menu, number-input, pagination, popover, progress, radio, search-input, segmented-control, select, separator, sheet, sidebar, skeleton, slider, spinner, stack, stat-card, stepper, switch, table, tabs, text, textarea, toast, toaster, toggle, toggle-group, tooltip, tree-view, visually-hidden

### Composed (18)
activity-feed, avatar-group, command-palette, confirm-dialog, content-card, date-picker, empty-state, error-boundary, global-loading, loading-skeleton, member-picker, page-header, page-skeletons, priority-indicator, rich-text-editor, schedule-view, simple-tooltip, status-badge

### Shell (8)
app-command-palette, bottom-navbar, command-registry, link-context, notification-center, notification-preferences, sidebar, top-bar

---

### Task 1: Create directory structure

**Files:**
- Create: `packages/core/docs/components/ui/` (directory)
- Create: `packages/core/docs/components/composed/` (directory)
- Create: `packages/core/docs/components/shell/` (directory)

**Step 1: Create directories**

```bash
mkdir -p packages/core/docs/components/ui
mkdir -p packages/core/docs/components/composed
mkdir -p packages/core/docs/components/shell
```

**Step 2: Commit**

```bash
git add packages/core/docs/components/
git commit -m "chore: create component docs directory structure"
```

---

### Task 2: Create the build script (`build-component-docs.mjs`)

**Files:**
- Create: `packages/core/scripts/build-component-docs.mjs`

**Step 1: Write the build script**

The script must:

1. **Scan source directories** for components:
   - `src/ui/` — `.tsx` files + subdirectories (`charts/`, `tree-view/`)
   - `src/composed/` — `.tsx` files + subdirectories (`date-picker/`)
   - `src/shell/` — `.tsx` files
   - **Exclude:** `*.test.*`, `*.stories.*`, `*.mdx`, `index.ts`, `*-types.ts`, `lib/`, `__tests__/`, `.js` files

2. **Match to doc files** in `docs/components/{category}/{kebab-name}.md`

3. **Fail with error** if any component is missing its doc file (list all missing)

4. **Concatenate** in order:
   - `docs/components/_header.md`
   - Separator: `---\n\n# UI COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/ui/<kebab-name>\n\n---\n`
   - All `docs/components/ui/*.md` (sorted alphabetically)
   - Separator: `---\n\n# COMPOSED COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/composed/<kebab-name>\n\n---\n`
   - All `docs/components/composed/*.md` (sorted alphabetically)
   - Separator: `---\n\n# SHELL COMPONENTS\n# Alphabetical within this section.\n# Import from: @devalok/shilp-sutra/shell/<kebab-name>\n\n---\n`
   - All `docs/components/shell/*.md` (sorted alphabetically)

5. **Write** to `llms-full.txt` (unless `--check` flag)

6. **Read version** from `package.json` and inject into header

**Flags:**
- No flags: validate + generate `llms-full.txt`
- `--check`: validate only (exit 1 if missing docs, exit 0 if all present). No file write.

**Key implementation details:**
- Use `import { readdir, readFile, writeFile, stat } from 'node:fs/promises'`
- Use `import { join, basename, extname } from 'node:path'`
- Component detection: for each entry in src dir, check if it's a `.tsx` file (not excluded) or a directory (not `lib/`, `__tests__/`). Derive kebab-name from filename without extension, or directory name.
- Exit with process.exit(1) on missing docs, printing the list of missing files.

**Step 2: Test the script manually**

```bash
cd packages/core
node scripts/build-component-docs.mjs --check
```

Expected: Should fail listing all 91 missing doc files (since we haven't created them yet). This confirms the scanner works.

**Step 3: Commit**

```bash
git add packages/core/scripts/build-component-docs.mjs
git commit -m "feat: add build-component-docs.mjs script"
```

---

### Task 3: Extract `_header.md` from current `llms-full.txt`

**Files:**
- Create: `packages/core/docs/components/_header.md`
- Reference: `packages/core/llms-full.txt` (lines 1–88, everything before the first component entry)

**Step 1: Create `_header.md`**

Extract the content from `llms-full.txt` lines 1 through the `---` separator before `## Accordion`. This includes:
- Package name + version header
- Architecture Notes (two-axis variant system)
- Server-safe component list
- Token architecture (OKLCH 12-step)
- Toast setup pattern
- Form accessibility pattern

**Important:** The version line should use a placeholder `{{VERSION}}` that the build script replaces with the actual version from `package.json`. Change:
```
> Version: 0.18.0
```
to:
```
> Version: {{VERSION}}
```

**Step 2: Commit**

```bash
git add packages/core/docs/components/_header.md
git commit -m "docs: extract _header.md from llms-full.txt"
```

---

### Task 4: Backfill UI component docs (65 files)

**Files:**
- Create: `packages/core/docs/components/ui/{name}.md` for each of the 65 UI components

**This is a parallel task.** Split across 3 subagents:
- **Agent A:** accordion through dialog (20 components, alphabetical)
- **Agent B:** dropdown-menu through segmented-control (20 components)
- **Agent C:** select through visually-hidden (25 components)

**For each component, the agent must:**

1. **Read the current `llms-full.txt` entry** for the component's API reference (props, compound components, defaults, examples, gotchas). Copy this content into the new file format.

2. **Scan `CHANGELOG.md`** for every mention of the component across all versions (v0.1.0 through v0.18.0). Create a `## Changes` section with version entries.

3. **Handle cross-cutting changes** that affect the component even if not named explicitly:
   - v0.18.0: All overlays migrated to Framer Motion → affects Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard, NavigationMenu
   - v0.18.0: Form components (Checkbox, Switch, Toggle) got Framer Motion animations
   - v0.18.0: OKLCH color token migration → affects ALL components (mention only if specific fixes were noted)
   - v0.12.0: Animation keyframes added → affects components using those animations
   - v0.3.0: "use client" directives, Button/Badge/Alert variant renames → affects those specific components
   - v0.2.0: Per-component exports, server-safe identification → affects all components
   - v0.1.1: Token compliance audit → mention only components explicitly listed
   - v0.4.2: Variant naming consistency audit → mention renamed components

4. **Components with no explicit changelog entries** get:
   ```
   ### v0.1.0
   - **Added** Initial release
   ```

5. **Verify the file matches the format** from the design doc (see Task 3 format reference).

**Reference files needed by each agent:**
- `packages/core/llms-full.txt` — current API reference
- `CHANGELOG.md` — full version history
- `docs/plans/2026-03-14-per-component-docs-design.md` — file format spec

**Step N (after all agents complete): Commit**

```bash
git add packages/core/docs/components/ui/
git commit -m "docs: backfill UI component docs (65 files)"
```

---

### Task 5: Backfill Composed component docs (18 files)

**Files:**
- Create: `packages/core/docs/components/composed/{name}.md` for each of 18 composed components

**Same process as Task 4.** Single agent can handle 18 files.

**Components:** activity-feed, avatar-group, command-palette, confirm-dialog, content-card, date-picker, empty-state, error-boundary, global-loading, loading-skeleton, member-picker, page-header, page-skeletons, priority-indicator, rich-text-editor, schedule-view, simple-tooltip, status-badge

**Reference files:** Same as Task 4.

**Commit:**

```bash
git add packages/core/docs/components/composed/
git commit -m "docs: backfill Composed component docs (18 files)"
```

---

### Task 6: Backfill Shell component docs (8 files)

**Files:**
- Create: `packages/core/docs/components/shell/{name}.md` for each of 8 shell components

**Same process as Task 4.** Single agent handles 8 files.

**Components:** app-command-palette, bottom-navbar, command-registry, link-context, notification-center, notification-preferences, sidebar, top-bar

**Reference files:** Same as Task 4.

**Commit:**

```bash
git add packages/core/docs/components/shell/
git commit -m "docs: backfill Shell component docs (8 files)"
```

---

### Task 7: Run build script and validate output

**Files:**
- Modify: `packages/core/llms-full.txt` (generated, replaces current content)

**Step 1: Run the build script**

```bash
cd packages/core
node scripts/build-component-docs.mjs
```

Expected: Script succeeds, writes new `llms-full.txt`.

**Step 2: Validate output**

- Check that `llms-full.txt` starts with the header (architecture notes)
- Check that it contains all 91 components
- Check that API reference sections match the old content (props, examples, gotchas preserved)
- Check that changelog sections are present for components with history
- Spot-check 5 components: Button, Dialog, EmptyState, NotificationCenter, DataTable

**Step 3: Commit**

```bash
git add packages/core/llms-full.txt
git commit -m "docs: regenerate llms-full.txt from per-component docs"
```

---

### Task 8: Integrate into build pipeline

**Files:**
- Modify: `packages/core/package.json` (add script, update build command)

**Step 1: Add script to package.json**

Add to `scripts`:
```json
"build:docs": "node scripts/build-component-docs.mjs",
"build:docs:check": "node scripts/build-component-docs.mjs --check"
```

Update `build` script to include docs generation:
```json
"build": "vite build && pnpm build:tokens && node scripts/fix-dts-primitives.mjs && node scripts/inject-use-client.mjs && node scripts/build-tailwind-cjs.mjs && pnpm build:docs"
```

**Step 2: Verify build still works**

```bash
cd packages/core
pnpm build
```

Expected: Build succeeds, `llms-full.txt` is regenerated as part of build.

**Step 3: Commit**

```bash
git add packages/core/package.json
git commit -m "build: integrate component docs generation into build pipeline"
```

---

### Task 9: Update CLAUDE.md publishing checklist

**Files:**
- Modify: `CLAUDE.md` (root)

**Step 1: Update the publishing checklist**

Add after item 3 (Stories):
```
4. **Component docs**: Every new/changed component has an up-to-date `packages/core/docs/components/{category}/{name}.md` with a Changes entry for this version
```

Renumber subsequent items (old 4→5, etc.).

Update the existing llms-full.txt item to note it's now generated:
```
7. **llms-full.txt**: GENERATED — do not hand-edit. Run `pnpm build:docs` or let the build pipeline regenerate it. Only update `llms.txt` manually for breaking changes.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update publishing checklist with component docs gate"
```

---

### Task 10: Final review and cleanup

**Step 1: Run full validation**

```bash
cd packages/core
pnpm typecheck && pnpm test && pnpm build
```

All must pass.

**Step 2: Verify `llms-full.txt` is in the npm files list**

Check `package.json` `files` array still includes `"llms-full.txt"`. (It already does — just verify it wasn't removed.)

**Step 3: Spot-check 3 generated component docs against source code**

Pick 3 components, read their CVA source, and verify the doc file's props section matches reality.

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "docs: final review fixes for per-component docs"
```
