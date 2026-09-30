# Ecosystem Deep Audit — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Audit every layer of the shilp-sutra design system against WCAG 2.2 AA, WAI-ARIA APG, React DX best practices, bundle/perf, SSR safety, and documentation completeness — then produce a prioritized fix plan.

**Architecture:** Three-phase bottom-up approach. Phase 1 audits the foundation (tokens, primitives, build, tailwind preset). Phase 2 audits every component individually against 6 dimensions. Phase 3 sweeps for cross-cutting systemic issues. Each phase produces a report; Phase 2 produces a scored matrix.

**Tech Stack:** OKLCH color tokens, vendored Radix primitives, React 18 + TypeScript 5.7, Vite 5.4, Tailwind 3.4, CVA, Vitest + RTL + vitest-axe

---

## Audit Output Location

All audit reports go in: `docs/audit/2026-04-06-ecosystem-deep-audit/`

```
docs/audit/2026-04-06-ecosystem-deep-audit/
  phase-1-foundation-report.md
  phase-2-component-scorecard.md
  phase-3-cross-cutting-report.md
  fix-plan.md
```

---

## PHASE 1: Foundation Audit

Phase 1 has 4 independent tasks that can run in parallel.

---

### Task 1: Token Contrast Audit

**Files to read:**
- `packages/core/src/tokens/primitives.css` — OKLCH primitive scales (pink, purple, neutral, red, green, yellow, amber, blue, teal, cyan, orange, emerald, indigo, slate, amber-bright)
- `packages/core/src/tokens/semantic.css` — semantic mappings (surface, status, accent, category tokens) + dark mode overrides
- `packages/core/src/tokens/typography.css` — typography composite tokens
- `packages/core/src/tokens/typography-semantic.css` — semantic typography
- `packages/core/src/tailwind/preset.ts` — Tailwind utility-to-token mappings

**Step 1: Extract all text-on-background pairings**

Read `semantic.css` and map every foreground token to its expected background:

| Foreground Token | Background Token | Usage Context |
|---|---|---|
| `--color-surface-fg` (neutral-12) | `--color-surface-base` (neutral-2) | Default body text on page |
| `--color-surface-fg` (neutral-12) | `--color-surface-raised` (neutral-1) | Text on cards |
| `--color-surface-fg-muted` (neutral-11) | `--color-surface-raised` (neutral-1) | Muted text on cards |
| `--color-surface-fg-subtle` (neutral-8) | `--color-surface-raised` (neutral-1) | Subtle text on cards |
| `--color-accent-fg` (neutral-1) | `--color-accent-9` (pink-9) | White text on accent buttons |
| `--color-error-fg` (neutral-1) | `--color-error-9` (red-9) | White text on error badges |
| `--color-success-fg` (neutral-1) | `--color-success-9` (green-9) | White text on success badges |
| `--color-warning-fg` | `--color-warning-9` (amber-bright-9) | Text on warning badges |
| `--color-info-fg` (neutral-1) | `--color-info-9` (blue-9) | Text on info badges |
| ... (all status-11 text on status-2/3 backgrounds) | | |

For each pairing, resolve the OKLCH values from `primitives.css` and calculate WCAG 2.1 contrast ratios.

**Step 2: Calculate contrast ratios**

For each OKLCH pair, convert to sRGB, then compute relative luminance and contrast ratio per WCAG 2.1 formula:
- Normal text (< 18pt / < 14pt bold): ratio >= 4.5:1
- Large text (>= 18pt / >= 14pt bold): ratio >= 3:1
- UI components and graphical objects: ratio >= 3:1 (WCAG 1.4.11)

**Step 3: Repeat for dark mode**

Read the `.dark { }` block in `semantic.css`. Every token override must also pass contrast checks with its dark-mode background.

**Step 4: Check dark mode parity**

Flag any semantic token that exists in `:root` but has NO `.dark` override. These inherit light-mode values in dark mode, which may break contrast.

**Step 5: Check token naming consistency**

- Scan for any semantic token referencing a primitive that doesn't exist in `primitives.css`
- Scan for any primitive defined in `primitives.css` that is never referenced by any semantic token (orphaned)
- Verify `--color-*-fg` exists for every `--color-*-9` (solid backgrounds need foreground text tokens)

**Step 6: Write report**

Output: `docs/audit/2026-04-06-ecosystem-deep-audit/phase-1-foundation-report.md` — Token Contrast section.

Include:
- Full contrast matrix with PASS/FAIL per pairing
- Dark mode parity gaps
- Orphaned/missing tokens
- Specific fix recommendations

---

### Task 2: Vendored Primitives Audit

**Files to read:**
- All `.js` and `.d.ts` files in `packages/core/src/primitives/`
- `packages/core/src/primitives/VERSION` — vendored Radix version
- All `_internal/` files (focus scope, dismissable layer, popper, portal, presence, etc.)

**Step 1: Identify vendored Radix version**

Read `packages/core/src/primitives/VERSION` to get the exact Radix version that was vendored.

**Step 2: Check each primitive against WAI-ARIA APG**

For each vendored primitive, verify its behavior matches the current WAI-ARIA Authoring Practices Guide:

| Primitive | APG Pattern | Key Requirements |
|---|---|---|
| `react-accordion` | Accordion | Up/Down arrows, Home/End, Enter/Space toggle |
| `react-alert-dialog` | Alert Dialog | Focus trap, Escape close, focus restore, no close on overlay click |
| `react-checkbox` | Checkbox | Space toggle, tristate support |
| `react-collapsible` | Disclosure | Enter/Space toggle |
| `react-context-menu` | Menu | Right-click trigger, arrow navigation, typeahead |
| `react-dialog` | Dialog (Modal) | Focus trap, Escape close, focus restore, aria-modal |
| `react-dropdown-menu` | Menu Button | Enter/Space/Down open, arrow navigation, typeahead, Escape close |
| `react-hover-card` | (no APG) | Non-modal, pointer-only trigger is OK but needs keyboard alternative |
| `react-label` | Label | Click-to-focus associated control |
| `react-menubar` | Menu Bar | Left/Right between menus, Up/Down within, Enter/Space activate |
| `react-navigation-menu` | Navigation | Arrow key navigation, Enter activate |
| `react-popover` | Dialog (Non-modal) | Escape close, focus management (not trapped) |
| `react-progress` | Progressbar | aria-valuenow, aria-valuemin, aria-valuemax |
| `react-radio-group` | Radio Group | Arrow keys navigate, Space selects, roving tabindex |
| `react-select` | Listbox | Arrow navigation, typeahead, Enter select, Escape close |
| `react-separator` | Separator | role="separator", aria-orientation |
| `react-slider` | Slider | Arrow keys, Home/End, Page Up/Down |
| `react-switch` | Switch | Space toggle, role="switch" |
| `react-tabs` | Tabs | Arrow key navigation (auto/manual activation), roving tabindex |
| `react-toast` | Alert | role="status" or role="alert", auto-dismiss with pause on hover |
| `react-toggle` | Toggle Button | aria-pressed, Enter/Space toggle |
| `react-toggle-group` | Toolbar | Arrow navigation, roving tabindex |
| `react-tooltip` | Tooltip | Escape dismiss, delay on hover, focusable trigger |
| `react-visually-hidden` | (utility) | Visually hidden but screen-reader accessible |

**Step 3: Audit focus management internals**

Read `_internal/react-focus-scope.tsx` and `_internal/react-dismissable-layer.tsx`:
- Does focus trap correctly handle Tab and Shift+Tab wrapping?
- Does focus restoration return to the trigger element on close?
- Does scroll lock prevent background scrolling without layout shift?
- Is `aria-hidden` applied to siblings when modal is open?

**Step 4: Check for known Radix bugs**

Search Radix UI GitHub issues for bugs matching the vendored version. Key areas:
- Select: scroll-into-view issues on open
- Dialog: focus restoration edge cases
- Popover: position calculation near viewport edges
- Toast: pause-on-hover timer race conditions

**Step 5: Write report**

Append to `phase-1-foundation-report.md` — Vendored Primitives section.

---

### Task 3: Build Pipeline Audit

**Files to read:**
- `packages/core/scripts/post-build.mjs` — consolidated post-build pipeline
- `packages/core/scripts/inject-use-client.mjs` — "use client" injection
- `packages/core/scripts/ssr-smoke-test.mjs` — SSR import safety test
- `packages/core/scripts/build-tailwind-cjs.mjs` — ESM-to-CJS for tailwind preset
- `packages/core/scripts/fix-dts-primitives.mjs` — .d.ts path rewriting
- `packages/core/scripts/copy-tokens.mjs` — token CSS copy to dist
- `packages/core/scripts/build-component-docs.mjs` — docs generation
- `packages/core/scripts/check-props-exports.mjs` — prop type export verification
- `packages/core/vite.config.ts` — Vite build config (manualChunks, externals, entry points)
- `packages/core/package.json` — exports field, files field, sideEffects
- `scripts/pre-publish-audit.mjs` — pre-publish gates

**Step 1: Audit "use client" correctness**

Read `inject-use-client.mjs` and understand the `@server-safe` annotation system:
- Grep all `.tsx` source files for `// @server-safe`
- For each file WITHOUT the annotation, verify it actually uses client-only APIs (hooks, event handlers, browser APIs)
- For each file WITH the annotation, verify it does NOT use client-only APIs at module scope
- Cross-reference against the built dist files: does every file that should have `"use client"` actually have it?

Run: `pnpm build` then check dist output.

**Step 2: Audit SSR smoke test coverage**

Read `ssr-smoke-test.mjs`:
- The known limitation: it only catches module-scope browser API crashes, not render-body access
- Count how many entry points are tested vs total exports
- Identify any exports NOT covered by the smoke test
- Assess whether a render-body SSR test is feasible (React SSR renderToString for each component)

**Step 3: Verify export map completeness**

Read `package.json` exports field:
- For every export entry, verify the target file exists in dist after build
- For every component in src/, verify it has a corresponding export entry
- Check for missing subpath exports (e.g., individual chart components, date-picker sub-components)
- Verify the `"types"` condition points to a valid `.d.ts` file

**Step 4: Audit chunk boundaries**

Read `vite.config.ts` manualChunks configuration:
- Verify vendor-utils only contains tree-shakeable, server-safe code
- Verify vendor-client has `"use client"` and only contains client-side code
- Check for unintentional cross-chunk imports that defeat tree-shaking
- Verify tiptap chunk is only loaded by rich-text-editor (lazy dependency)

**Step 5: Check sideEffects field**

- Verify `package.json` has `"sideEffects"` field for tree-shaking
- If using `"sideEffects": false`, verify no files have actual side effects (CSS imports, global polyfills)

**Step 6: Write report**

Append to `phase-1-foundation-report.md` — Build Pipeline section.

---

### Task 4: Tailwind Preset Audit

**Files to read:**
- `packages/core/src/tailwind/preset.ts` — full preset
- `packages/core/src/tailwind/index.ts` — export barrel
- `packages/core/src/tokens/semantic.css` — all CSS custom properties

**Step 1: Token-to-utility completeness**

For every CSS custom property in `semantic.css`, verify a corresponding Tailwind utility exists in `preset.ts`:

| Token Category | CSS Variable Pattern | Expected Tailwind Utility |
|---|---|---|
| Colors | `--color-surface-*` | `bg-surface-*`, `text-surface-*`, `border-surface-*` |
| Colors | `--color-accent-*` | `bg-accent-*`, `text-accent-*`, `border-accent-*` |
| Colors | `--color-error-*` | `bg-error-*`, `text-error-*`, `border-error-*` |
| Spacing | `--spacing-*` | `p-ds-*`, `m-ds-*`, `gap-ds-*` |
| Radius | `--radius-*` | `rounded-ds-*` |
| Shadows | `--shadow-*` | `shadow-ds-*` |
| Motion | `--duration-*`, `--ease-*` | `duration-ds-*`, `ease-ds-*` |
| Typography | `--font-size-*` | `text-ds-*` |

Flag any token with no utility and any utility with no token.

**Step 2: Scan for hardcoded values**

Search all component `.tsx` files in `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/` for:
- Raw hex colors: `#[0-9a-fA-F]{3,8}`
- Raw RGB/HSL: `rgb(`, `hsl(`, `oklch(` (should use tokens instead)
- Raw pixel values in className strings that should use spacing tokens
- Exceptions: SVG fill/stroke values, keyframe percentages

**Step 3: Verify CJS/ESM dual export**

- Read `build-tailwind-cjs.mjs` to understand the ESM-to-CJS conversion
- Verify the `package.json` exports for `./tailwind` has both `"require"` and `"import"` conditions
- Check that the CJS output is valid (no ESM syntax like `import`/`export`)

**Step 4: Write report**

Append to `phase-1-foundation-report.md` — Tailwind Preset section.

**Step 5: Commit Phase 1 report**

```bash
git add docs/audit/2026-04-06-ecosystem-deep-audit/phase-1-foundation-report.md
git commit -m "docs(audit): Phase 1 foundation audit report"
```

---

## PHASE 2: Component-by-Component Deep Audit

Phase 2 audits every component against 6 dimensions. Components are grouped by layer, and each layer can be audited by a parallel subagent.

### Audit Checklist Template

For each component, score against these 6 dimensions:

```
## [ComponentName] — packages/core/src/{layer}/{file}.tsx

### A. WCAG 2.2 AA
- [ ] 1.4.3 Contrast: text/icon meets 4.5:1 (normal) or 3:1 (large)
- [ ] 1.4.11 Non-text contrast: borders, focus rings, UI elements meet 3:1
- [ ] 2.5.8 Target size: interactive areas >= 24x24px (or 24px spacing)
- [ ] 2.4.7 Focus visible: visible focus indicator on all focusable elements
- [ ] 1.3.1 Info/relationships: programmatic labels, aria-describedby for hints/errors
- [ ] 2.3.3 Reduced motion: animations respect prefers-reduced-motion
- [ ] 1.4.10 Reflow: no horizontal scroll at 320px width

### B. APG Keyboard
- [ ] Keyboard pattern matches WAI-ARIA APG for this widget role
- [ ] No keyboard traps
- [ ] No pointer-only interactions
- [ ] Roving tabindex where APG specifies

### C. API/DX (CONTRIBUTING.md checklist)
- [ ] React.forwardRef
- [ ] displayName set
- [ ] className prop + cn() merge
- [ ] Remaining props spread (...props)
- [ ] CVA for variants (where applicable)
- [ ] Exported prop types interface
- [ ] Compound pattern (where >8 props or 2+ independent sections)
- [ ] Prop naming: variant/size/color consistent with system

### D. Test Quality
- [ ] Has test file
- [ ] toHaveNoViolations() present
- [ ] Meaningful behavioral assertions (not just renders)
- [ ] Keyboard interaction tested
- [ ] Error/edge states tested
- [ ] Interactive state a11y tested (open, expanded, selected)

### E. Bundle/SSR
- [ ] @server-safe annotation correct (if applicable)
- [ ] No side effects at import time
- [ ] No unnecessary heavy dependency

### F. Documentation
- [ ] Storybook story exists
- [ ] tags: ['autodocs'] set
- [ ] Key variants/states shown in stories
- [ ] JSDoc on exported props interface

### Score: [P/P/P/P/P/P] or [P/F/P/C/P/F] etc.
```

---

### Task 5: Audit UI Layer — Batch 1 (Form Controls)

**Components (19 files):**
- `packages/core/src/ui/input.tsx`
- `packages/core/src/ui/textarea.tsx`
- `packages/core/src/ui/select.tsx`
- `packages/core/src/ui/checkbox.tsx`
- `packages/core/src/ui/radio.tsx`
- `packages/core/src/ui/switch.tsx`
- `packages/core/src/ui/slider.tsx`
- `packages/core/src/ui/number-input.tsx`
- `packages/core/src/ui/search-input.tsx`
- `packages/core/src/ui/input-otp.tsx`
- `packages/core/src/ui/color-input.tsx`
- `packages/core/src/ui/autocomplete.tsx`
- `packages/core/src/ui/combobox.tsx`
- `packages/core/src/ui/file-upload.tsx`
- `packages/core/src/ui/label.tsx`
- `packages/core/src/ui/form.tsx`
- `packages/core/src/ui/toggle.tsx`
- `packages/core/src/ui/toggle-group.tsx`
- `packages/core/src/ui/segmented-control.tsx`

**For each component:**
1. Read the source file
2. Read the corresponding test file(s) in `__tests__/` or co-located
3. Read the Storybook story (`.stories.tsx`)
4. Apply the full 6-dimension checklist
5. Record findings in the component scorecard

**Known issues to verify:**
- Checkbox/Radio: target size < 24px (WCAG 2.5.8) — check if padding compensates
- Switch sm: 18px height (WCAG 2.5.8)
- Slider thumb: 16px (WCAG 2.5.8)
- All form controls must support `aria-invalid` + `aria-describedby` for error states

---

### Task 6: Audit UI Layer — Batch 2 (Feedback and Overlays)

**Components (13 files):**
- `packages/core/src/ui/alert.tsx`
- `packages/core/src/ui/alert-dialog.tsx`
- `packages/core/src/ui/banner.tsx`
- `packages/core/src/ui/dialog.tsx`
- `packages/core/src/ui/sheet.tsx`
- `packages/core/src/ui/popover.tsx`
- `packages/core/src/ui/tooltip.tsx`
- `packages/core/src/ui/hover-card.tsx`
- `packages/core/src/ui/toast.tsx`
- `packages/core/src/ui/toaster.tsx`
- `packages/core/src/ui/dropdown-menu.tsx`
- `packages/core/src/ui/context-menu.tsx`
- `packages/core/src/ui/menubar.tsx`

**Key APG patterns to verify:**
- Dialog/AlertDialog: focus trap, Escape close, focus restore, aria-modal
- Sheet: same as Dialog (side-anchored dialog)
- Popover: non-modal, Escape close, no focus trap
- Tooltip: Escape dismiss, delay, not keyboard-focusable itself
- Toast: role="status", auto-dismiss with pause on hover/focus
- DropdownMenu: Enter/Space/ArrowDown open, arrow navigation, typeahead
- ContextMenu: right-click trigger + Shift+F10, arrow navigation
- Menubar: Left/Right between menus, Up/Down within

---

### Task 7: Audit UI Layer — Batch 3 (Data Display)

**Components (27 files):**
- `packages/core/src/ui/badge.tsx`
- `packages/core/src/ui/badge-group.tsx`
- `packages/core/src/ui/badge-indicator.tsx`
- `packages/core/src/ui/avatar.tsx`
- `packages/core/src/ui/card.tsx`
- `packages/core/src/ui/table.tsx`
- `packages/core/src/ui/data-table.tsx`
- `packages/core/src/ui/data-table-toolbar.tsx`
- `packages/core/src/ui/stat-card.tsx`
- `packages/core/src/ui/status-dot.tsx`
- `packages/core/src/ui/code.tsx`
- `packages/core/src/ui/skeleton.tsx`
- `packages/core/src/ui/progress.tsx`
- `packages/core/src/ui/progress-ring.tsx`
- `packages/core/src/ui/spinner.tsx`
- `packages/core/src/ui/chip.tsx`
- `packages/core/src/ui/color-swatch.tsx`
- `packages/core/src/ui/devalok-grain.tsx`
- `packages/core/src/ui/charts/chart-container.tsx`
- `packages/core/src/ui/charts/area-chart.tsx`
- `packages/core/src/ui/charts/bar-chart.tsx`
- `packages/core/src/ui/charts/line-chart.tsx`
- `packages/core/src/ui/charts/pie-chart.tsx`
- `packages/core/src/ui/charts/radar-chart.tsx`
- `packages/core/src/ui/charts/gauge-chart.tsx`
- `packages/core/src/ui/charts/sparkline.tsx`
- `packages/core/src/ui/tree-view/tree-view.tsx`

**Key checks:**
- Charts: do they have accessible table fallbacks? (WCAG 1.1.1)
- Spinner: respects `prefers-reduced-motion`? Has `role="status"` + sr-only text?
- Skeleton: shimmer animation respects reduced motion?
- Progress/ProgressRing: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- Badge pulse animation: reduced motion?
- DataTable: sortable columns announced? (`aria-sort`)
- TreeView: APG tree pattern (Up/Down, Left/Right collapse/expand, Home/End)

---

### Task 8: Audit UI Layer — Batch 4 (Navigation and Layout)

**Components (21 files):**
- `packages/core/src/ui/breadcrumb.tsx`
- `packages/core/src/ui/tabs.tsx`
- `packages/core/src/ui/pagination.tsx`
- `packages/core/src/ui/navigation-menu.tsx`
- `packages/core/src/ui/link.tsx`
- `packages/core/src/ui/button.tsx`
- `packages/core/src/ui/button-group.tsx`
- `packages/core/src/ui/button-processing.tsx`
- `packages/core/src/ui/icon-button.tsx`
- `packages/core/src/ui/icon.tsx`
- `packages/core/src/ui/icon-context.tsx`
- `packages/core/src/ui/icon-group.tsx`
- `packages/core/src/ui/container.tsx`
- `packages/core/src/ui/stack.tsx`
- `packages/core/src/ui/separator.tsx`
- `packages/core/src/ui/text.tsx`
- `packages/core/src/ui/visually-hidden.tsx`
- `packages/core/src/ui/aspect-ratio.tsx`
- `packages/core/src/ui/collapsible.tsx`
- `packages/core/src/ui/stepper.tsx`
- `packages/core/src/ui/sidebar.tsx`

**Key APG patterns:**
- Tabs: arrow key navigation, roving tabindex, auto vs manual activation
- Breadcrumb: `nav` + `aria-label="Breadcrumb"`, `aria-current="page"` on last item
- Pagination: `nav` + `aria-label`, current page indicated
- NavigationMenu: arrow keys between items, Enter/Space activate
- Button: Enter and Space activate (not just click)
- IconButton: must have `aria-label` (no visible text)
- Stepper: step state communicated (current, completed, upcoming)
- Collapsible: Enter/Space toggle, `aria-expanded`

---

### Task 9: Audit Composed Layer

**Components (35 files):**
- `packages/core/src/composed/activity-feed.tsx`
- `packages/core/src/composed/avatar-group.tsx`
- `packages/core/src/composed/bulk-action-bar.tsx`
- `packages/core/src/composed/command-palette.tsx`
- `packages/core/src/composed/confirm-dialog.tsx`
- `packages/core/src/composed/content-card.tsx`
- `packages/core/src/composed/deadline-indicator.tsx`
- `packages/core/src/composed/emoji-picker.tsx`
- `packages/core/src/composed/empty-state.tsx`
- `packages/core/src/composed/error-boundary.tsx`
- `packages/core/src/composed/file-preview.tsx`
- `packages/core/src/composed/filter-bar.tsx`
- `packages/core/src/composed/form-section.tsx`
- `packages/core/src/composed/global-loading.tsx`
- `packages/core/src/composed/inline-edit.tsx`
- `packages/core/src/composed/loading-skeleton.tsx`
- `packages/core/src/composed/markdown-viewer.tsx`
- `packages/core/src/composed/master-detail.tsx`
- `packages/core/src/composed/member-picker.tsx`
- `packages/core/src/composed/multi-select-popover.tsx`
- `packages/core/src/composed/page-header.tsx`
- `packages/core/src/composed/page-skeletons.tsx`
- `packages/core/src/composed/priority-indicator.tsx`
- `packages/core/src/composed/responsive-overlay.tsx`
- `packages/core/src/composed/rich-text-editor.tsx`
- `packages/core/src/composed/schedule-view.tsx`
- `packages/core/src/composed/simple-tooltip.tsx`
- `packages/core/src/composed/status-badge.tsx`
- `packages/core/src/composed/date-picker/date-picker.tsx`
- `packages/core/src/composed/date-picker/date-range-picker.tsx`
- `packages/core/src/composed/date-picker/date-time-picker.tsx`
- `packages/core/src/composed/date-picker/month-picker.tsx`
- `packages/core/src/composed/date-picker/year-picker.tsx`
- `packages/core/src/composed/date-picker/time-picker.tsx`
- `packages/core/src/composed/date-picker/calendar-grid.tsx`

**Key checks:**
- CommandPalette: APG combobox pattern (input + listbox), arrow navigation, Escape close
- RichTextEditor: toolbar keyboard navigation (APG toolbar pattern), content editing a11y
- DatePicker family: APG date picker pattern (grid navigation with arrow keys, Home/End, PageUp/PageDown)
- EmojiPicker: keyboard navigation within grid, search input
- FilterBar: toolbar pattern, remove filter chips with keyboard
- InlineEdit: Enter to save, Escape to cancel, focus management
- MemberPicker: combobox pattern for search + selection
- MasterDetail: arrow keys for list navigation, focus management between panels
- ScheduleView: grid navigation (if calendar-like), keyboard event creation

---

### Task 10: Audit Shell Layer

**Components (8 files):**
- `packages/core/src/shell/top-bar.tsx`
- `packages/core/src/shell/sidebar.tsx`
- `packages/core/src/shell/bottom-navbar.tsx`
- `packages/core/src/shell/notification-center.tsx`
- `packages/core/src/shell/notification-preferences.tsx`
- `packages/core/src/shell/app-command-palette.tsx`
- `packages/core/src/shell/link-context.tsx`
- `packages/core/src/shell/command-registry.tsx`

**Key checks:**
- Sidebar: APG navigation pattern, keyboard-accessible toggle, skip-nav landmark
- TopBar: landmark (`banner` role or `<header>`), skip-nav target
- BottomNavbar: landmark, active state communicated to screen readers
- NotificationCenter: live region for new notifications? Focus management on open/close
- AppCommandPalette: same as CommandPalette APG checks
- All shell: proper landmark roles (`<nav>`, `<header>`, `<main>`, `<aside>`)

---

### Task 11: Audit AI Layer

**Components (14 files):**
- `packages/core/src/ai/conversation.tsx`
- `packages/core/src/ai/command-bar.tsx`
- `packages/core/src/ai/block-renderer.tsx`
- `packages/core/src/ai/ai-command-provider.tsx`
- `packages/core/src/ai/devadoot-icon.tsx`
- `packages/core/src/ai/blocks/block-table.tsx`
- `packages/core/src/ai/blocks/confirm.tsx`
- `packages/core/src/ai/blocks/divider.tsx`
- `packages/core/src/ai/blocks/error.tsx`
- `packages/core/src/ai/blocks/info.tsx`
- `packages/core/src/ai/blocks/loading.tsx`
- `packages/core/src/ai/blocks/stat-row.tsx`
- `packages/core/src/ai/blocks/success.tsx`
- `packages/core/src/ai/blocks/text.tsx`

**Key checks:**
- Conversation: live region for incoming messages (`aria-live="polite"`), message list keyboard navigation
- CommandBar: combobox/search pattern, Escape close
- BlockRenderer: renders semantic HTML, not just divs
- Loading block: spinner a11y (role="status", sr-only label)
- Confirm block: button contrast and target sizes
- Error/Info/Success blocks: appropriate ARIA roles (role="alert" for error)

**Step (for all Phase 2 tasks): Write scorecard**

After all components are audited, compile into: `docs/audit/2026-04-06-ecosystem-deep-audit/phase-2-component-scorecard.md`

Format:
```markdown
| Component | Layer | WCAG | APG | API/DX | Tests | Bundle | Docs | Issues |
|-----------|-------|------|-----|--------|-------|--------|------|--------|
| Button    | ui    | P    | P   | P      | P     | P      | P    | -      |
| Checkbox  | ui    | F    | P   | P      | F     | P      | P    | Target size, missing kbd test |
```

**Commit Phase 2:**

```bash
git add docs/audit/2026-04-06-ecosystem-deep-audit/phase-2-component-scorecard.md
git commit -m "docs(audit): Phase 2 component-by-component scorecard"
```

---

## PHASE 3: Cross-Cutting Sweep

Phase 3 has 5 independent tasks that can run in parallel.

---

### Task 12: Documentation Completeness Audit

**Files to read:**
- `packages/core/llms.txt`
- `packages/core/llms-full.txt`
- All `.stories.tsx` files in `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/`

**Step 1: llms.txt accuracy**

For every component exported in `package.json`:
- Verify it appears in `llms.txt` and `llms-full.txt`
- Verify the documented API matches the actual exported types
- Flag any component missing from docs or with stale API descriptions

**Step 2: Storybook coverage**

For every component source file:
- Verify a `.stories.tsx` file exists
- Verify it has `tags: ['autodocs']`
- Verify key variants/states are demonstrated (not just a single default story)

**Step 3: JSDoc coverage**

For every exported props interface:
- Check if JSDoc comments exist on the interface and its properties
- Flag interfaces with zero documentation

**Step 4: Write report**

Output: `docs/audit/2026-04-06-ecosystem-deep-audit/phase-3-cross-cutting-report.md` — Documentation section.

---

### Task 13: Test Suite Health Audit

**Files to read:**
- All `.test.tsx` files across ui/, composed/, shell/, ai/

**Step 1: False-pass detection**

Scan each test file for patterns that indicate false passes:
- Tests that render but assert nothing meaningful (`expect(container).toBeDefined()`)
- Tests that query the wrong element (wrong text, wrong role)
- Tests that use `.toBeInTheDocument()` without checking content/state
- Missing `await` on async assertions (fireEvent on async components)

**Step 2: Coverage gap matrix**

For each component, check which test categories are present:

| Component | Renders | A11y (axe) | Keyboard | Error States | Interactive States |
|-----------|---------|------------|----------|-------------|-------------------|
| Button    | Y       | Y          | Y        | N/A         | Y (loading)       |
| Dialog    | Y       | Y          | ?        | N/A         | ? (open/close)    |

Flag components missing keyboard or interactive-state tests.

**Step 3: Test isolation check**

- Look for tests that modify global state without cleanup (mocking `window`, `document`)
- Look for tests that depend on other tests' side effects
- Check that ResizeObserver/matchMedia mocks are scoped per test, not global leaks

**Step 4: Write report**

Append to `phase-3-cross-cutting-report.md` — Test Suite Health section.

---

### Task 14: Bundle Analysis

**Step 1: Run build and measure**

```bash
cd packages/core && pnpm build
```

After build, measure chunk sizes:

```bash
ls -la dist/_chunks/*.js | awk '{print $5, $9}'
du -sh dist/
```

**Step 2: Analyze chunk composition**

For each chunk in `dist/_chunks/`:
- List what modules are bundled
- Flag any server-safe code bundled into client-only chunks
- Flag any duplicate code across chunks

**Step 3: Tree-shaking verification**

Check `package.json` `sideEffects` field. If a consumer only imports `Button`, verify that `RichTextEditor` (and its tiptap chunk) is NOT included.

**Step 4: Font payload**

- Measure total size of fonts in the package
- Are fonts in the npm package? (Check `files` field)
- Recommend optimization if > 5MB

**Step 5: Write report**

Append to `phase-3-cross-cutting-report.md` — Bundle Analysis section.

---

### Task 15: Consumer Integration Verification

**Step 1: Export map verification**

For each export in `package.json`, verify:
- The `import` path resolves to a real file
- The `types` path resolves to a real `.d.ts` file
- The `require` path (if present) resolves to a real CJS file

**Step 2: SSR safety (enhanced)**

Run the existing SSR smoke test:
```bash
cd packages/core && node scripts/ssr-smoke-test.mjs
```

Document any failures. Assess the render-body gap.

**Step 3: Write report**

Append to `phase-3-cross-cutting-report.md` — Consumer Integration section.

---

### Task 16: Security and Hygiene Audit

**Step 1: Unsafe HTML patterns**

Search for unsafe HTML injection patterns in all component source files under `packages/core/src/`.

For each hit, verify the content is sanitized.

**Step 2: Hardcoded secrets/URLs**

Search for hardcoded API keys, secrets, passwords, and internal URLs in all `.tsx` and `.ts` files under `packages/core/src/`.

Flag any hits that are actual secrets (not documentation/comments).

**Step 3: Dependency vulnerabilities**

```bash
pnpm audit --prod
```

Check vendored Radix primitives against known CVEs.

**Step 4: Write report**

Append to `phase-3-cross-cutting-report.md` — Security section.

---

### Task 17: Compile Fix Plan

**After all phases complete:**

Read all three reports:
- `phase-1-foundation-report.md`
- `phase-2-component-scorecard.md`
- `phase-3-cross-cutting-report.md`

Compile into `fix-plan.md` with this structure:

```markdown
# Fix Plan — Ecosystem Deep Audit

## Critical (must fix before next release)
1. [Finding] — [Location] — [Fix description]

## Systemic (fix once, fixes many components)
1. [Finding] — [Location] — [Fix description]

## Per-Component (individual fixes)
| Component | Issue | Fix | Priority |
|-----------|-------|-----|----------|

## Documentation Gaps
1. [What's missing] — [Where to add it]

## Nice-to-Have (not blocking, but improves quality)
1. [Finding] — [Recommendation]
```

**Commit Phase 3 + Fix Plan:**

```bash
git add docs/audit/2026-04-06-ecosystem-deep-audit/
git commit -m "docs(audit): Phase 3 cross-cutting report + prioritized fix plan"
```

---

## Execution Strategy

**Parallelizable groups:**

| Group | Tasks | Dependencies |
|-------|-------|-------------|
| Phase 1 | Tasks 1-4 | None (all independent) |
| Phase 2 | Tasks 5-11 | After Phase 1 complete |
| Phase 3 | Tasks 12-16 | After Phase 2 complete (scorecard needed) |
| Fix Plan | Task 17 | After Phase 3 complete |

Within each phase, all tasks can run as parallel subagents.

**Estimated scope:** ~120 components x 6 dimensions = 720 individual checks, plus 4 foundation audits and 5 cross-cutting sweeps.
