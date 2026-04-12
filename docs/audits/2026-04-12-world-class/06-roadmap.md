# Phase 6: Prioritized Roadmap

**Phase:** 6
**Auditor:** Claude
**Date:** 2026-04-12

Every finding from all 22 audit reports, organized by priority and sequenced into implementation waves.

---

## P0 -- Blocking World-Class (Must Fix)

These findings represent accessibility violations, broken functionality, or foundational issues that cascade into downstream components.

| # | Finding | Source | File(s) | What to Change | Effort |
|---|---------|--------|---------|---------------|--------|
| P0-01 | **Dark mode solid variant contrast failures** -- All 5 `*-fg` on `*-9` pairs fail WCAG AA | 01a-6 | `packages/core/src/tokens/primitives.css` | Lower dark step 9 from L=0.63 to ~0.52-0.55, or compute per-hue fg colors. Warning-9 (L=0.72) needs dark text, not white. | M |
| P0-02 | **Light mode success-fg on success-9** -- 4.44:1 (needs 4.5:1) | 01a-6 | `packages/core/src/tokens/primitives.css` | Darken green-9 from L=0.55 to L=0.53 | S |
| P0-03 | **surface-fg-subtle contrast failure** -- 3.35:1 light, 3.86:1 dark (needs 4.5:1) | 01a-11 | `packages/core/src/tokens/semantic.css` | Darken surface-fg-subtle token | S |
| P0-04 | **No responsive typography** -- 60px heading on 375px phone overflows | 01b-7 | `packages/core/src/tokens/semantic.css` | Add `clamp()` to heading font-size tokens (6xl through 3xl). Non-breaking. | S-M |
| P0-05 | **Button/Badge use Tailwind defaults** -- Foundational components bypass DS tokens | 01c-5 | `packages/core/src/ui/button.tsx`, `packages/core/src/ui/badge.tsx` | Replace `gap-1`, `px-2`, etc. with `gap-ds-01`, `px-ds-02`, etc. | M |
| P0-06 | **prefers-reduced-motion gap** -- 74 Framer Motion files without explicit reduced-motion handling | 01e-3 | 74 component files | Audit all 74 files for MotionConfig propagation coverage. Add explicit `useReducedMotion` to imperative animations. Add dev warning when MotionProvider missing. | M |
| P0-07 | **SSR smoke test missing from CI** -- Exists as script but not wired into CI workflow | 02f-1 | `.github/workflows/ci.yml` | Add `node packages/core/scripts/ssr-smoke-test.mjs` step | S |
| P0-08 | **Changesets publish skips pre-publish gates** -- Can publish what manual flow would block | 02f-6 | `.github/workflows/release.yml` | Add SSR smoke test + typecheck + test steps before npm publish | S |
| P0-09 | **Dev-mode token-missing warning absent** -- If consumer forgets token CSS import, components silently break | 02g-2h-2 | New file in `packages/core/src/` | Add dev-mode CSS var presence check that warns in console | S |
| P0-10 | **useFormField() not consumed by 12 form controls** -- ARIA wiring broken for Select, Combobox, DatePicker, etc. | 03l, 04c | `packages/core/src/ui/select.tsx`, `combobox.tsx`, `autocomplete.tsx`, `slider.tsx`, `switch.tsx`, `checkbox.tsx`, `radio.tsx`, + 5 date components | Wire `useFormField()` context into each component's ARIA attributes | L |
| P0-11 | **Combobox/Autocomplete/NumberInput missing `size` prop** -- Can't build consistent form rows | 03b-1,2 | `packages/core/src/ui/combobox.tsx`, `autocomplete.tsx`, `number-input.tsx` | Add CVA size variants matching Input/Select (xs/sm/md/lg) | M |
| P0-12 | **Slider missing size + color axes** -- Previous audit flagged, still not done | 03b-3 | `packages/core/src/ui/slider.tsx` | Add size and color CVA axes | L |
| P0-13 | **SplitButton has zero tests** | 03a-1 | New file `packages/core/src/ui/__tests__/split-button.test.tsx` | Write test suite | M |
| P0-14 | **SegmentedControl has zero tests** | 03a-2 | New file | Write test suite | M |
| P0-15 | **Link has zero tests** | 03a-3 | New file | Write test suite | S |
| P0-16 | **7 content components with zero tests** -- RichChatInput (850 lines), FileUpload, FilePreview, InlineEdit, MarkdownViewer, FormSection, date-utils | 03l | New test files for each | Write test suites | L |
| P0-17 | **Chat Message actions hover-only** -- Keyboard users can't see or access action toolbar | 03p-1 | `packages/core/src/composed/chat/message.tsx` | Add `group-focus-within:opacity-100` | XS |
| P0-18 | **MessageInput textarea no accessible name** | 03p-2 | `packages/core/src/composed/chat/message-input.tsx` | Add `aria-label` | XS |
| P0-19 | **SystemMessage alert variant lacks role="alert"** | 03p-3 | `packages/core/src/composed/chat/system-message.tsx` | Add conditional `role="alert"` | XS |
| P0-20 | **TypingIndicator no aria-live** | 03p-4 | `packages/core/src/composed/chat/typing-indicator.tsx` | Add `aria-live="polite"` | XS |
| P0-21 | **Karm-specific routes hardcoded in AppCommandPalette** -- DS ships consumer app code | 03m | `packages/core/src/shell/app-command-palette.tsx` | Extract Karm routes, use CommandRegistryProvider only | M |
| P0-22 | **5 form inputs have no error state mechanism** -- NumberInput, Slider, Combobox, Autocomplete, InputOTP | 04d | Multiple form component files | Add `state` CVA variant or FormField context consumption | M |

**P0 Total: 22 findings**

---

## P1 -- Significant Gaps

| # | Finding | Source | Effort |
|---|---------|--------|--------|
| P1-01 | Missing semantic color tokens: link/link-hover/link-visited, accent-contrast, icon tokens | 01a-4 | S-M |
| P1-02 | Category color hue crowding (teal/emerald 15deg, amber/orange 20deg, slate/indigo 15deg) | 01a-7 | S |
| P1-03 | amber-bright-9 dark clips sRGB + no sRGB hex fallbacks for ~5% of browsers | 01a-10 | M |
| P1-04 | Missing `code`/mono semantic typography variant | 01b-3 | S |
| P1-05 | Missing mixed-case `label-plain` variant (forces ad-hoc patterns for form labels) | 01b-10 | S-M |
| P1-06 | Small text negative tracking (body-sm -0.24px, body-xs -0.2px) -- opposite of best practice | 01b-6 | S |
| P1-07 | Font subsetting needed (Inter 344KB, could be ~80KB with Latin subset) | 01b-4 | M |
| P1-08 | Spacing -b tokens invisible in FoundationsShowcase (documentation bug) | 01c-2 | S |
| P1-09 | Layout spacing tokens missing (no responsive page margins, no density control) | 01c-6 | M |
| P1-10 | Z-index violations: 3 components use `z-50` instead of semantic tokens | 01f-2 | S |
| P1-11 | Motion duration scale: CSS tokens not used by Framer Motion (parallel JS map needed) | 01e-1,4 | M |
| P1-12 | Missing 200ms duration token (most-used duration has no token) | 01e-1 | S |
| P1-13 | 50+ inline motion magic numbers bypassing centralized presets | 01e-4 | M |
| P1-14 | Typography composite utilities missing from Tailwind preset (64 tokens have no utilities) | 02a-2 | M |
| P1-15 | No JS source maps shipped (consumers can't debug into DS) | 02b-8 | S |
| P1-16 | Stale dependencies in package.json (cause unnecessary consumer installs) | 02b-10 | S |
| P1-17 | Autodocs quality: only 21/128 stories have prop descriptions | 02c-2 | M |
| P1-18 | No real-browser E2E tests for complex component flows | 02d-7 | L |
| P1-19 | Chromatic visual regression may not be active (needs CHROMATIC_PROJECT_TOKEN) | 02d-8 | M |
| P1-20 | ESLint missing import ordering plugin | 02e-3 | S |
| P1-21 | Module boundary (composed -> shell) not enforced in ESLint | 02e-4 | S |
| P1-22 | Changesets release workflow skips typecheck/lint/test before publish | 02f-3 | S |
| P1-23 | Branch protection not verifiable from codebase | 02f-7 | S |
| P1-24 | W3C DTCG token format not implemented (design-philosophy.md claims it) | 02g-1 | M |
| P1-25 | No Figma token sync | 02g-2 | M |
| P1-26 | MIGRATION.md missing v0.32/v0.33 breaking changes | 02g-2h-3 | S |
| P1-27 | False claim in design-philosophy.md about W3C Design Tokens | 02g-1 | XS |
| P1-28 | Input border lighter than sibling form controls (surface-border vs surface-border-strong) | 03b-4 | S |
| P1-29 | Textarea missing ring-offset-2 on focus | 03b-5 | S |
| P1-30 | InputOTP missing size variants | 03b-6 | M |
| P1-31 | ColorInput popover missing role="dialog" | 03b-7 | S |
| P1-32 | Autocomplete uses absolute positioning (clips in overflow:hidden) | 03b-8 | M |
| P1-33 | ToggleGroupItem has zero tap animation (Toggle has it, ToggleGroupItem doesn't) | 03a-4 | S |
| P1-34 | SplitButton has no tap feedback | 03a-5 | S |
| P1-35 | Toggle/ToggleGroup missing color axis | 03a-6 | M |
| P1-36 | Link missing ring-offset-2 (focus ring clips text) | 03a-7 | S |
| P1-37 | AvatarGroup `lead` indicator = warning-9 vs Avatar `lead` ring = accent-7 (bug) | 03d-1 | S |
| P1-38 | AlertDialog not responsive on mobile | 03f-G1 | M |
| P1-39 | DropdownMenu no functional test file | 03f-G2 | S |
| P1-40 | Tabs no `orientation` prop (vertical tabs impossible) | 03h-1 | M |
| P1-41 | Separator gradient direction broken on vertical | 03h-2 | S |
| P1-42 | Container fixed `px-ds-05` not responsive | 03h-3 | S |
| P1-43 | Stepper steps not clickable/focusable | 03h-4 | M |
| P1-44 | Chart keyboard tooltip access missing (mouse-only) | 03j-1 | M |
| P1-45 | Chart screen reader data fallback missing | 03j-2 | M |
| P1-46 | DataTable missing aria-busy on loading | 03j-3 | S |
| P1-47 | TreeView hardcoded pixel indentation (`depth * 20 + 8`) | 03j-4 | S |
| P1-48 | TimePicker no keyboard nav within columns (60 tab stops) | 03l-3 | M |
| P1-49 | CalendarGrid no aria-live for month changes | 03l-4 | S |
| P1-50 | RichTextEditor toolbar lacks roving tabindex (20+ tab stops) | 03l-10 | M |
| P1-51 | NotificationCenter no mobile adaptation (380px popover overflows) | 03m-2 | M |
| P1-52 | EmptyState floating icon ignores useReducedMotion() | 03m-3 | S |
| P1-53 | MultiSelectPopover items missing role="listbox"/role="option" | 03m-4 | S |
| P1-54 | Chat: no axe a11y tests in any chat test file | 03p-6 | M |
| P1-55 | Chat: hardcoded text-[13px]/text-[11px] bypass DS type scale | 03p-7 | S |
| P1-56 | Reaction buttons lack descriptive aria-label | 03p-5 | S |
| P1-57 | `solid` vs `filled` variant name fragmentation | 04a | M |
| P1-58 | Loading state naming inconsistency (`loading` vs `isLoading`) | 04e | S |

**P1 Total: 58 findings**

---

## P2 -- Polish

| # | Finding | Source | Effort |
|---|---------|--------|--------|
| P2-01 | No alpha variant color scales for overlay use cases | 01a-2 | M |
| P2-02 | amber-bright-9 dark clips sRGB | 01a-3 | S |
| P2-03 | Chart palette: uniform L=0.55 indistinguishable in grayscale | 01a-8 | M |
| P2-04 | No theme generator tool for accent swapping | 01a-9 | M |
| P2-05 | Type scale ratio documentation | 01b-1 | S |
| P2-06 | Scale completeness: xs (10px) usage guidance | 01b-2 | S |
| P2-07 | Font loading: Ranade should use font-display: optional | 01b-8 | S |
| P2-08 | Weight distribution: remove phantom light (300) | 01b-9 | S |
| P2-09 | Spacing -b naming (cleaner aliases or rename) | 01c-2 | S-L |
| P2-10 | Tabs/SegmentedControl should use token height classes | 01f-3 | S |
| P2-11 | Effect shadows: add shadow-glow usage or remove it | 01d-5 | S-M |
| P2-12 | Dead disabled surface tokens (unused by all components) | 01d-6 | S |
| P2-13 | Tailwind preset namespace: fontWeight collision risk | 02a-1 | S |
| P2-14 | Responsive token behavior in preset | 02a-7 | M |
| P2-15 | Chunk strategy: monolithic framer/primitives chunks | 02b-2,4 | L |
| P2-16 | SSR render-level test (beyond import smoke test) | 02b-6 | M |
| P2-17 | Storybook interactive controls: 72 story files without argTypes | 02c-4 | M |
| P2-18 | Multi-viewport Chromatic snapshots | 02c-6 | S |
| P2-19 | Storybook play functions for core form controls | 02c-7 | M |
| P2-20 | Coverage thresholds in vitest.config | 02d-1 | M |
| P2-21 | Test file location convention documentation | 02d-2 | S |
| P2-22 | Keyboard testing gaps: tab focus-trap for modals | 02d-4 | M |
| P2-23 | Performance testing: no render benchmarks | 02d-9 | M |
| P2-24 | noUncheckedIndexedAccess in tsconfig | 02e-1 | M |
| P2-25 | Type-aware ESLint linting | 02e-3 | M |
| P2-26 | Bundle size: per-entry-point budgets | 02f-4 | M |
| P2-27 | Visual regression: Chromatic exitZeroOnChanges (informational only) | 02f-5 | S |
| P2-28 | Style Dictionary pipeline | 02g-3 | M |
| P2-29 | Designer handoff: standalone token reference page | 02g-4 | M |
| P2-30 | First-use experience: transpilePackages friction | 02g-2h-1 | S |
| P2-31 | TypeScript DX: backfill JSDoc on 16 prop interfaces | 02g-2h-4 | M |
| P2-32 | Checkbox/Radio missing color axis | 03b-9 | S |
| P2-33 | SplitButton missing `lg` size | 03a-8 | S |
| P2-34 | SplitButton missing loading state | 03a-9 | M |
| P2-35 | Disabled treatment inconsistency (cursor, saturate) | 03a-10 | S |
| P2-36 | Link has no variant/color/size system | 03a-11 | M |
| P2-37 | Link has no disabled state | 03a-12 | S |
| P2-38 | SegmentedControl missing fullWidth/orientation | 03a-13 | M |
| P2-39 | Alert textClass identical for md and lg (bug) | 03f-F1 | S |
| P2-40 | Alert missing axe() test | 03f-F2 | S |
| P2-41 | BadgeGroup missing role="group" and aria-label | 03d-2 | S |
| P2-42 | BadgeIndicator no aria-label/role="status" | 03d-3 | S |
| P2-43 | DeadlineIndicator missing useReducedMotion | 03d-4 | S |
| P2-44 | DeadlineIndicator should use `<time>` element | 03d-5 | S |
| P2-45 | PriorityIndicator compact uses title only (not keyboard-accessible) | 03d-6 | S |
| P2-46 | PriorityIndicator missing useReducedMotion | 03d-7 | S |
| P2-47 | StatusDot tests lack axe audit | 03d-8 | S |
| P2-48 | StatCard no size axis | 03d-9 | M |
| P2-49 | Dialog no size variant (always max-w-lg) | 03f-G3 | S |
| P2-50 | AlertDialog uses hardcoded styles instead of Button | 03f-G4 | S |
| P2-51 | Breadcrumb no size variant | 03h-5 | S |
| P2-52 | Pagination no size/compact variant for mobile | 03h-6 | M |
| P2-53 | NavigationMenu zero variant axes | 03h-7 | M |
| P2-54 | NavigationMenu triplicated MutationObserver | 03h-8 | S |
| P2-55 | Menubar no responsive handling | 03h-9 | L |
| P2-56 | Stepper missing size and color axes | 03h-10 | M |
| P2-57 | Accordion no size variant | 03h-11 | S |
| P2-58 | Stack no responsive gap/direction props | 03h-12 | M |
| P2-59 | Container only 3 maxWidth presets | 03h-13 | S |
| P2-60 | MasterDetail masterWidth accepts raw CSS | 03h-14 | S |
| P2-61 | BarChart inconsistent multi-series API | 03j-5 | M |
| P2-62 | Chart tests shallow (no tooltip/multi-series/empty data tests) | 03j-6 | L |
| P2-63 | Table no row border separators by default | 03j-7 | S |
| P2-64 | DataTable missing inline editing and mobile card view tests | 03j-8 | M |
| P2-65 | Dead code in _internal/scales.ts | 03j-9 | S |
| P2-66 | Charts fixed height, no responsive/aspect-ratio option | 03j-10 | M |
| P2-67 | PieChart label contrast on light slices | 03j-11 | S |
| P2-68 | Three duplicate emoji picker implementations | 03l-11 | M |
| P2-69 | InlineEdit uses deprecated execCommand | 03l-12 | S |
| P2-70 | FormSection ref not forwarded in collapsible branch | 03l-13 | S |
| P2-71 | CalendarGrid missing PageUp/PageDown | 03l-14 | S |
| P2-72 | date-utils hardcodes en-IN locale | 03l-15 | S |
| P2-73 | PageSkeletons are Karm-specific layouts | 03m-6 | S |
| P2-74 | CommandBar gradient hardcoded hex | 03m-7 | M |
| P2-75 | CommandBar/CommandPalette filtering logic duplicated | 03m-8 | L |
| P2-76 | No StreamingTextBlock for incremental AI responses | 03m-10 | M |
| P2-77 | Chat: no virtualization for 1000+ messages | 03p-11 | L |
| P2-78 | Chat: no WAI-ARIA feed pattern (role="feed") | 03p-12 | M |
| P2-79 | MessageInput doesn't expose ref to textarea | 03p-13 | S |
| P2-80 | SystemMessage missing warning/success/info variants | 03p-14 | S |
| P2-81 | Separators lack role="separator" | 03p-15 | XS |
| P2-82 | Density mode system | 04g | L |

**P2 Total: 82 findings**

---

## P3 -- Aspirational

| # | Finding | Source | Effort |
|---|---------|--------|--------|
| P3-01 | Per-hue dark mode tuning | 01a-5 | M |
| P3-02 | P3 wide gamut enhancement layer | 01a-10 | M |
| P3-03 | Body line height tuning (body-lg at 1.4 for compact UI) | 01b-5 | S |
| P3-04 | Spacing base unit documentation | 01c-1 | S |
| P3-05 | Spacing naming convention: add quick-reference comment table | 01c-3 | S |
| P3-06 | 56px spacing token if needed | 01c-4 | S |
| P3-07 | Dark mode shadows A/B test 2.0x vs 2.5x | 01d-3 | S |
| P3-08 | Forced-colors (high contrast) media query support | 01d-6 | L |
| P3-09 | Border radius: fix bare rounded-none in color-swatch | 01f-1 | S |
| P3-10 | Tailwind preset naming cleanup (ds-02b, ds-default) | 02a-3 | S |
| P3-11 | Tailwind preset composability: modular split | 02a-4 | L |
| P3-12 | Tailwind custom utilities: add .antialiased base | 02a-6 | S |
| P3-13 | Tailwind plugin architecture: createPreset(options) | 02a-8 | L |
| P3-14 | Post-build: regex SSR patching fragility | 02b-11 | M |
| P3-15 | Storybook organization: Patterns/Recipes section | 02c-1 | S |
| P3-16 | Storybook story patterns: Do/Don't stories | 02c-8 | M |
| P3-17 | Performance stories for Combobox/Select/TreeView | 02c-12 | M |
| P3-18 | Test snapshot approach documentation | 02d-5 | S |
| P3-19 | Bundle debugging guide for consumers | 02g-2h-5 | S |
| P3-20 | Button doesn't default type="button" | 03a-14 | S |
| P3-21 | ButtonProcessing duplicates useReducedMotion | 03a-16 | S |
| P3-22 | SplitButton duplicates variant styling | 03a-17 | L |
| P3-23 | No async feedback aria announcement | 03a-18 | S |
| P3-24 | IconButton missing xs size | 03a-15 / 03d-10 | S |
| P3-25 | Code component no size axis | 03d-11 | S |
| P3-26 | Card lacks category colors that Badge has | 03d-12 | M |
| P3-27 | StatCard sparkline injects `<style>` per instance | 03d-13 | M |
| P3-28 | StatusDot vocabulary (healthy/critical) vs rest (success/error) | 03d-CC1 | S |
| P3-29 | Toast: error uses role="status" instead of role="alert" | 03f-F3 | S |
| P3-30 | ProgressRing: MultiProgressRing inner rings no individual ARIA | 03f-F4 | S |
| P3-31 | LoadingSkeleton lacks role="status"/aria-busy | 03f-F5 | S |
| P3-32 | Popover BottomSheet title hardcoded "Options" | 03f-G5 | S |
| P3-33 | SimpleTooltip creates redundant TooltipProvider | 03f-G6 | S |
| P3-34 | ContextMenu missing min-w-[8rem] | 03f-G7 | S |
| P3-35 | ContextMenu items lack transition-colors | 03f-G8 | S |
| P3-36 | SegmentedControl no color axis | 03a-20 | M |
| P3-37 | Button wrapper span always rendered | 03a-19 | M |
| P3-38 | Sidebar layoutId multi-active conflict | 03m-11 | S |
| P3-39 | BottomNavbar user prop unused | 03m-12 | S |
| P3-40 | AppSidebar inline SVGs instead of Icon | 03m-13 | S |
| P3-41 | DevadootIcon brand colors not tokenized | 03m-14 | S |
| P3-42 | PageHeader breadcrumbs use raw `<a>` | 03m-15 | S |
| P3-43 | Input missing framer-motion parity with Textarea | 03b-10 | S |
| P3-44 | Entrance/exit pattern extraction to shared constants | 01e-5 | S |
| P3-45 | Animation performance: will-change underuse | 01e-7 | S |
| P3-46 | TopBar hasCenter detection breaks with wrapped children | 03m-9 | S |
| P3-47 | NotificationPreferences hardcoded channel types | 03m-5 | S |
| P3-48 | Suggestion popups create DOM outside React tree (Extensions) | 03l-17 | L |
| P3-49 | Video preview suppresses media-has-caption | 03l-16 | M |
| P3-50 | FormSection header should use semantic heading | 03l-18 | S |
| P3-51 | CalendarGrid double tab-stop | 03l-9 | S |
| P3-52 | DateTimePicker uses native select (inconsistent) | 03l-6 | M |
| P3-53 | TimePicker columns need role="listbox"/role="option" | 03l-5 | S |

**P3 Total: 53 findings**

---

## Implementation Waves

### Wave 1: Foundation Fixes (Token changes cascade to all components)
**Duration estimate: 1-2 weeks**

| Order | Task | Why First | Effort |
|-------|------|----------|--------|
| 1.1 | Fix dark mode step 9 contrast (P0-01, P0-02) | Color tokens cascade everywhere. Must be correct before component work. | M |
| 1.2 | Fix surface-fg-subtle contrast (P0-03) | Same token cascade reason | S |
| 1.3 | Add responsive typography clamp() (P0-04) | Token-level change, zero component changes needed | S-M |
| 1.4 | Fix body-sm/xs letter spacing (P1-06) | 4 CSS value changes in semantic.css | S |
| 1.5 | Add missing 200ms duration token (P1-12) | Motion token used in 20+ components | S |
| 1.6 | Add layout spacing tokens (P1-09) | Prerequisite for Container fix and density modes | M |
| 1.7 | Add link/link-hover semantic color tokens (P1-01) | Enables Link component rework | S |

**Wave 1 total effort: ~2-3 weeks (1 developer)**

---

### Wave 2: Infrastructure Fixes
**Duration estimate: 1-2 weeks**

| Order | Task | Why Here | Effort |
|-------|------|---------|--------|
| 2.1 | Wire SSR smoke test into CI (P0-07) | Already built, just not wired. 10-minute task. | S |
| 2.2 | Add gates to Changesets publish (P0-08, P1-22) | Prevents bad publishes. Critical safety. | S |
| 2.3 | Add dev-mode token-missing warning (P0-09) | Consumer DX. Small standalone task. | S |
| 2.4 | Enable JS source maps (P1-15) | One config change, big DX impact. | S |
| 2.5 | Clean stale dependencies (P1-16) | Move bundled deps to devDependencies. | S |
| 2.6 | Add module boundary ESLint rule (P1-21) | Prevent future violations. | S |
| 2.7 | Add import ordering ESLint plugin (P1-20) | Low-effort quality improvement. | S |
| 2.8 | Verify branch protection (P1-23) | Non-code task, but important. | S |
| 2.9 | Fix design-philosophy.md false claim (P1-27) | Literal one-line fix. | XS |
| 2.10 | Backfill MIGRATION.md (P1-26) | Documentation debt. | S |

**Wave 2 total effort: ~1 week (1 developer)**

---

### Wave 3: Component Fixes by Dependency Order
**Duration estimate: 3-5 weeks**

**3A: Form infrastructure (must come before individual form fixes)**

| Order | Task | Effort |
|-------|------|--------|
| 3A.1 | Wire useFormField() into Select, Combobox, Autocomplete, DatePicker, Switch, Checkbox, Radio, Slider (P0-10) | L |
| 3A.2 | Add error state to NumberInput, Slider, Combobox, Autocomplete, InputOTP (P0-22) | M |
| 3A.3 | Fix Input border to match siblings (P1-28) | S |
| 3A.4 | Fix Textarea ring-offset (P1-29) | S |
| 3A.5 | Fix ColorInput popover role="dialog" (P1-31) | S |

**3B: Size axis additions (depends on token system being stable from Wave 1)**

| Order | Task | Effort |
|-------|------|--------|
| 3B.1 | Add size prop to Combobox + Autocomplete (P0-11) | M |
| 3B.2 | Add size + state props to NumberInput (P0-11) | M |
| 3B.3 | Add size + color axes to Slider (P0-12) | L |
| 3B.4 | Add size variants to InputOTP (P1-30) | M |
| 3B.5 | Fix Autocomplete absolute positioning (P1-32) | M |

**3C: Action component fixes**

| Order | Task | Effort |
|-------|------|--------|
| 3C.1 | Migrate Button/Badge to DS spacing tokens (P0-05) | M |
| 3C.2 | Add tap feedback to ToggleGroupItem + SplitButton (P1-33, P1-34) | S |
| 3C.3 | Add color axis to Toggle/ToggleGroup (P1-35) | M |
| 3C.4 | Fix Link ring-offset (P1-36) | S |

**3D: Overlay and navigation fixes**

| Order | Task | Effort |
|-------|------|--------|
| 3D.1 | Make AlertDialog responsive on mobile (P1-38) | M |
| 3D.2 | Add orientation to Tabs (P1-40) | M |
| 3D.3 | Fix Separator gradient on vertical (P1-41) | S |
| 3D.4 | Make Container padding responsive (P1-42) | S |
| 3D.5 | Make Stepper steps clickable/focusable (P1-43) | M |

**3E: Data and chart accessibility**

| Order | Task | Effort |
|-------|------|--------|
| 3E.1 | Add chart keyboard tooltip access (P1-44) | M |
| 3E.2 | Add chart screen reader data fallback (P1-45) | M |
| 3E.3 | Add DataTable aria-busy on loading (P1-46) | S |
| 3E.4 | TreeView token indentation (P1-47) | S |

**3F: Chat accessibility**

| Order | Task | Effort |
|-------|------|--------|
| 3F.1 | Fix Message hover-only actions (P0-17) | XS |
| 3F.2 | Fix MessageInput aria-label (P0-18) | XS |
| 3F.3 | Fix SystemMessage alert role (P0-19) | XS |
| 3F.4 | Fix TypingIndicator aria-live (P0-20) | XS |
| 3F.5 | Fix reaction button aria-labels (P1-56) | S |
| 3F.6 | Replace hardcoded chat text sizes (P1-55) | S |

**3G: Shell cleanup**

| Order | Task | Effort |
|-------|------|--------|
| 3G.1 | Remove Karm-specific code from AppCommandPalette (P0-21) | M |
| 3G.2 | Add NotificationCenter mobile adaptation (P1-51) | M |
| 3G.3 | Fix EmptyState reduced motion (P1-52) | S |
| 3G.4 | Fix MultiSelectPopover ARIA roles (P1-53) | S |

**Wave 3 total effort: ~5-7 weeks (1-2 developers)**

---

### Wave 4: Cross-Cutting Fixes
**Duration estimate: 2-3 weeks**

| Order | Task | Effort |
|-------|------|--------|
| 4.1 | Reduced motion audit: verify 74 Framer Motion files, add dev warning for missing MotionProvider (P0-06) | M |
| 4.2 | Replace 50+ inline motion magic numbers with preset references (P1-13) | M |
| 4.3 | Create JS duration constant map mirroring CSS tokens (P1-11) | M |
| 4.4 | Add typography composite utilities to Tailwind preset (P1-14) | M |
| 4.5 | Standardize variant naming: `solid` everywhere (P1-57) | M |
| 4.6 | Add axe tests to chat component test files (P1-54) | M |
| 4.7 | Add `code`/mono typography variant (P1-04) | S |
| 4.8 | Add mixed-case `label-plain` variant (P1-05) | S-M |
| 4.9 | Fix AvatarGroup/Avatar lead color mismatch (P1-37) | S |
| 4.10 | Fix z-50 stacking violations (P1-10) | S |
| 4.11 | Fix FoundationsShowcase -b token display (P1-08) | S |

**Wave 4 total effort: ~3-4 weeks (1-2 developers)**

---

### Wave 5: Test Debt and Polish
**Duration estimate: 2-4 weeks**

| Order | Task | Effort |
|-------|------|--------|
| 5.1 | Write tests: SplitButton, SegmentedControl, Link (P0-13, P0-14, P0-15) | M+M+S |
| 5.2 | Write tests: RichChatInput, FileUpload, FilePreview, InlineEdit, MarkdownViewer, FormSection, date-utils (P0-16) | L |
| 5.3 | Add DropdownMenu functional tests (P1-39) | S |
| 5.4 | Autodocs: add TSDoc comments to component props (P1-17) | M |
| 5.5 | Font subsetting: Inter Latin + Latin-Extended (P1-07) | M |
| 5.6 | W3C DTCG token export (P1-24) | M |
| 5.7 | Figma token sync setup (P1-25) | M |
| 5.8 | Verify/activate Chromatic (P1-19) | M |
| 5.9 | TimePicker keyboard navigation (P1-48) | M |
| 5.10 | RTE toolbar roving tabindex (P1-50) | M |
| 5.11 | Remaining P2 items as capacity allows | Ongoing |

**Wave 5 total effort: ~4-6 weeks (1-2 developers)**

---

## Total Scope Summary

| Priority | Count | Estimated Effort |
|----------|-------|-----------------|
| P0 | 22 | ~6-8 weeks |
| P1 | 58 | ~8-12 weeks |
| P2 | 82 | ~12-16 weeks |
| P3 | 53 | ~6-10 weeks |
| **Total** | **215** | **~32-46 weeks** |

**Realistic timeline with 1 developer:** Waves 1-3 in 8-10 weeks. Wave 4 in 3-4 weeks. Wave 5 ongoing. P0+P1 clearable in ~14-20 weeks.

**With 2 developers:** Waves 1-3 in 5-7 weeks (parallelizable across component groups). Total P0+P1 in ~10-14 weeks.

---

## Dependencies

```
Wave 1 (Tokens)
  |
  +---> Wave 2 (Infra) [independent of Wave 1, can run parallel]
  |
  +---> Wave 3A (Form infra) --> Wave 3B (Size axes)
  |
  +---> Wave 3C (Actions) [parallel with 3A/3B]
  |
  +---> Wave 3D (Overlays/Nav) [parallel with 3A-3C]
  |
  +---> Wave 3E (Data/Charts) [parallel with 3A-3D]
  |
  +---> Wave 3F (Chat) [parallel, no deps]
  |
  +---> Wave 3G (Shell) [parallel, no deps]
  |
  +---> Wave 4 (Cross-cutting) [depends on Wave 3 completion for motion/naming]
  |
  +---> Wave 5 (Test debt + Polish) [can start during Wave 3-4]
```
