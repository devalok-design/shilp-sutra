# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.11.0] - 2026-03-10

### Added
- **Tokens**: `--pink-1000` (#150208) near-black primitive for deep dark mode surfaces

### Changed (BREAKING — dark mode)
- **Dark mode interactive colors**: `--color-interactive` pink-400→pink-500, `--color-interactive-hover` pink-300→pink-600, `--color-interactive-active` pink-200→pink-700, `--color-interactive-subtle` pink-950→pink-1000
- **Dark mode text status colors**: `--color-text-error` red-200→red-300, `--color-text-success` green-200→green-300, `--color-text-warning` yellow-200→yellow-300, `--color-text-link` blue-200→blue-300, `--color-text-brand` pink-300→pink-400

### Fixed
- **Foundations Showcase**: Pink palette now displays 1000 swatch

## [0.10.0] - 2026-03-10

### Added
- **AppSidebar**: Collapsible nav items with `children` array and `NavSubItem` type (S9)
- **AppSidebar**: Nav item `badge` prop for counts/labels, caps at 99+ (S10)
- **AppSidebar**: Nav group `action` prop for buttons next to group labels (S11)
- **AppSidebar**: Structured `footer` prop with `SidebarFooterConfig` — links, version, slot (S12)
- **AppSidebar**: `headerSlot` and `preFooterSlot` content slots (S13)
- **AppSidebar**: `renderItem` escape hatch for custom item rendering (S14)

### Deprecated
- **AppSidebar**: `footerLinks` prop — use `footer.links` instead

## [0.9.2] — 2026-03-10

### Fixed
- **Server components broken (cont.)**: `_chunks/utils.js` (the `cn()` helper — clsx + tailwind-merge) also had `"use client"` injected, breaking server-safe components that import it (PageHeader, StatusBadge, EmptyState, Skeleton, etc.). Added to inject-use-client skip list.

## [0.9.1] — 2026-03-10

### Fixed
- **Server components broken**: `_chunks/vendor.js` had `"use client"` injected, breaking server-safe components (Skeleton, StatusBadge, etc.) that import cva/clsx. Split vendor chunk into `vendor-utils.js` (pure functions, no directive) and `vendor-client.js` (`"use client"`, @floating-ui + react-remove-scroll + transitive deps).

## [0.9.0] — 2026-03-10

### Changed (BREAKING)
- **Build**: All runtime dependencies (`@floating-ui/react-dom`, `aria-hidden`, `react-remove-scroll`, `clsx`, `class-variance-authority`, `tailwind-merge`) are now bundled into the compiled output instead of listed as `dependencies`. Consumers who were importing these packages directly (not through shilp-sutra) must install them separately.
- **Tiptap**: All `@tiptap/*` packages moved from `peerDependencies` to bundled build-time dependencies. Consumers no longer need to install tiptap separately — the RichTextEditor ships as a self-contained bundle. Tiptap code is in a dedicated `_chunks/tiptap.js` chunk (only loaded when importing `composed/rich-text-editor`).

### Fixed
- **React #527**: Eliminated dual React instances in Next.js 15 + pnpm consumers by bundling all runtime deps into `_chunks/vendor.js` and tiptap into `_chunks/tiptap.js`. Only `react`, `react-dom`, and remaining peer dependencies stay external.

### shilp-sutra-karm
- **Build**: All runtime dependencies (`@dnd-kit/*`, `react-markdown`, `date-fns`, `clsx`, `cva`, `tailwind-merge`) bundled into compiled output.

### shilp-sutra-brand
- **Build**: `clsx` and `tailwind-merge` bundled into compiled output.

### Migration
Add to `next.config.js` (required for Next.js + pnpm consumers):
```js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-karm", "@devalok/shilp-sutra-brand"]
```

## [0.8.4] — 2026-03-10

### Fixed
- **Missing export**: Added `./composed/lib/string-utils` to exports map — fixes `Module not found` when shilp-sutra-karm imports `getInitials`

## [0.8.3] — 2026-03-10

### Fixed
- **Exports map**: Added `"default"` condition fallback to all package exports — fixes Next.js 15 webpack resolution without needing `conditionNames` workarounds
- **Missing export**: Added `./ui/lib/utils` to exports map — fixes `Module not found` when shilp-sutra-karm imports this internal path

### shilp-sutra-karm 0.8.2
- **Exports map**: Added `"default"` condition fallback to all package exports

## [0.8.2] — 2026-03-10

### Fixed
- **Tiptap peer deps**: Tightened from `^2.0.0` to `>=2.27.2 <3.0.0` to prevent consumers from accidentally installing tiptap v3, which has breaking API changes incompatible with the RichTextEditor

## [0.8.0] — 2026-03-09

The **Mega-Audit** release. Comprehensive design system audit fixing 48 issues across accessibility, type safety, security, token consistency, and build correctness.

### Changed (BREAKING)
- **Combobox**: Props now use discriminated union — `multiple: true` requires `value: string[]` and `onValueChange: (value: string[]) => void`; `multiple?: false` requires `value: string` and `onValueChange: (value: string) => void`
- **StatusBadge**: Props now use discriminated union — pass either `status` or `color`, not both

### Added
- **ConversationTab** (karm): `richText` prop for built-in RichTextEditor/Viewer support
- **Semantic token**: `layer-active` for pressed/active states
- **Semantic token**: `text-info` for informational text color
- **Tailwind peer dep**: `tailwindcss ^3.4.0` declared as optional peer dependency
- **useComposedRef** (karm): Utility hook for merging multiple refs

### Fixed
- **RichTextEditor**: Emoji picker now renders above the editor (not clipped by overflow)
- **RichTextEditor**: Link/image URL injection prevented via protocol validation (`http`, `https`, `mailto` only)
- **RichTextEditor**: Escape key in emoji picker no longer closes parent dialogs
- **Input/Textarea**: Now consume FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)
- **NumberInput**: FormField context consumption, `aria-label` fallback, `parseInt` radix parameter
- **ColorInput**: Added `aria-label` to hex color input
- **CommandPalette**: Full ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`)
- **TaskCard** (karm): Keyboard accessible (`role="button"`, `tabIndex`, Enter/Space handling)
- **BoardColumn** (karm): Icon-only buttons now have `aria-label`, keyboard-focusable
- **StreamingText** (karm): Added `aria-live="polite"` for screen readers
- **ChatInput** (karm): Added `aria-label` on textarea
- **FilesTab** (karm): URL protocol validation on download links
- **Markdown renderer** (karm): URL protocol validation on rendered links
- **Stale .js artifacts**: Removed 15 compiled `.js` files shadowing `.tsx` sources in module resolution
- **Typecheck**: All tiptap extensions added as devDependencies for complete type resolution
- **Token consistency**: `text-placeholder` contrast improved (`neutral-400` → `neutral-500`)
- **Badge**: `text-[10px]` → `text-ds-xs` for token consistency
- **Icon sizing**: 7 components migrated from `min-h-6 min-w-6` → `min-h-ds-xs min-w-ds-xs`

### Removed
- **SegmentedControl** re-export from karm (was stale — use core's directly)

---

## [0.7.0] — 2026-03-09

### Added
- **RichTextEditor/Viewer**: Full-featured tiptap-based rich text editing with toolbar, mentions, emoji, image, alignment
- **TopBar**: `userMenuItems` prop for custom dropdown items

### Fixed
- **Audit findings**: Various component fixes from design system audit round 1

---

## [0.6.0] — 2026-03-06

The **Karm Feedback** release. Improves developer experience with Storybook documentation, import guides, and migration helpers.

### Added
- **Storybook package labels**: All 41 karm story files and 2 barrel-isolated core stories now display package name and import path in the docs tab via `parameters.docs.description.component`
- **Import Guide**: New Storybook MDX page ("Guides/Import Paths") documenting barrel imports, barrel-isolated components, per-component RSC imports, and karm sub-path exports
- **shadcn/ui Migration Guide**: New Storybook MDX page ("Guides/Coming from shadcn") mapping shadcn variant names to shilp-sutra's two-axis variant+color system
- **Karm README**: Updated with component inventory, module descriptions, and import paths

### Changed
- **Karm README**: Expanded with full component inventory by module, when-to-use guidance, and Tailwind content configuration

---

## [0.5.0] — 2026-03-06

The **Next.js Compatibility** release. Fixes build failures when integrating with Next.js 15 App Router and pnpm strict mode.

### Changed (BREAKING)
- **EmptyState**: `icon` prop changed from `TablerIcon` (component ref) to `React.ReactNode` — use `icon={<MyIcon />}` instead of `icon={MyIcon}`
- **EmptyState**: Default icon is now the Devalok swadhisthana chakra (inline SVG) instead of Tabler's `IconInbox` — zero external dependencies
- **ui barrel**: `DataTable`, `DataTableToolbar`, and all chart components removed from `@devalok/shilp-sutra/ui` barrel export

### Fixed
- **Next.js build failures**: Importing lightweight components (e.g. `Button`) from the `ui` barrel no longer triggers `Module not found` errors for optional peer deps (`d3-*`, `@tanstack/*`, `@tabler/icons-react`)
- **pnpm strict hoisting**: Consumers no longer need `.npmrc` `public-hoist-pattern` overrides for optional peer deps
- **EmptyState RSC**: Component is now fully React Server Component compatible — no `@tabler/icons-react` dependency, `icon` prop accepts `ReactNode` (serializable across server/client boundary)

### Migration Guide

**EmptyState icon prop:**
```diff
- <EmptyState icon={IconError404} title="Not found" />
+ <EmptyState icon={<IconError404 />} title="Not found" />
```

**DataTable / Charts imports:**
```diff
- import { DataTable } from '@devalok/shilp-sutra/ui'
+ import { DataTable } from '@devalok/shilp-sutra/ui/data-table'

- import { BarChart } from '@devalok/shilp-sutra/ui'
+ import { BarChart } from '@devalok/shilp-sutra/ui/charts'
```

## [0.4.2] — 2026-03-06

The **Consistency Audit** release. Aligns variant naming, event handlers, and export completeness across the entire component library.

### Changed (BREAKING)
- **Chip**: `variant="filled"` → `"subtle"`, `variant="outlined"` → `"outline"`, `onDelete` → `onDismiss`
- **SegmentedControl**: `color` prop renamed to `variant` (values `filled`/`tonal` unchanged)
- **Toast**: `color="default"` → `color="neutral"`
- **Card**: `variant="outlined"` → `variant="outline"`

### Fixed
- **Button/Badge/ButtonGroup**: `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop — CI typecheck was failing
- **Button**: `className` was passed inside `buttonVariants()` (silently dropped by CVA) — now separate `cn()` argument
- **Toggle**: Same `className` fix as Button
- **ProjectCard**: Was passing color values (`success`/`info`/`warning`) to Badge `variant` prop instead of `color`
- **AlertDialogHeader/Footer**: Now wrapped in `React.forwardRef` (matches Dialog/Sheet pattern)
- **TaskDetailPanel**: Ref parameter was discarded as `_ref` — now forwarded to `SheetContent`
- **Switch**: `React.ComponentRef` → `React.ElementRef` for consistency
- **DateRangePicker**: Default `formatStr` changed from `'MMM d'` to `'MMM d, yyyy'` to match DatePicker

### Added
- 11 new Props type exports: `AccordionItemProps`, `AccordionTriggerProps`, `AccordionContentProps`, `RadioGroupProps`, `RadioGroupItemProps`, `ToggleProps`, `ToggleGroupProps`, `ToggleGroupItemProps`, `CollapsibleProps`, `SeparatorProps`, `HoverCardContentProps`
- 4 variant/type exports: `inputVariants`, `cardVariants`, `textareaVariants`, `SpacingToken`
- TreeItem now accepts `className` prop
- Karm barrel: admin types (`UserRole`, `AttendanceStatus`, `DayInfo`, etc.) and 14 utility functions re-exported from package root

---

## [0.3.1] — 2026-03-06

### Fixed
- AlertProps / BannerProps: `Omit<HTMLAttributes, 'color'>` to resolve TypeScript conflict with CVA `color` variant
- Badge dismiss button: added 24px touch target (missed in 0.3.0)

### Added
- Storybook Changelog page with formatted release notes and migration guides

---

## [0.3.0] — 2026-03-06

### Added
- Root `"."` export — `import { Button } from '@devalok/shilp-sutra'` now works
- `main` and `module` fields for legacy bundler compatibility
- Per-component exports: `./ui/charts`, `./ui/tree-view`, `./composed/date-picker`
- `useFormField()` hook for automatic aria-describedby wiring
- `SwitchProps`, `SliderProps` type exports
- Switch `error` prop (matches Checkbox API)
- "use client" directives in karm package
- Inter font (WOFF2) replacing Google Sans
- WebP brand assets alongside PNGs

### Changed (BREAKING)
- **Dependencies**: D3, TipTap, TanStack, @tabler/icons-react, date-fns, input-otp, react-markdown are now optional peer dependencies — install only what you use
- **Fonts**: Google Sans replaced with Inter (licensing). All fonts converted from TTF to WOFF2
- **Button**: `variant="primary"` → `variant="solid"`, `variant="secondary"` → `variant="outline"`, `variant="error"` → `color="error"`
- **Badge**: Single `variant` axis split into `variant` (subtle/solid/outline) + `color` (default/info/success/error/...)
- **Alert/Banner/Toast**: `variant` prop renamed to `color` for semantic intent
- **NumberInput/Combobox/Autocomplete**: `onChange` renamed to `onValueChange`
- **NumberInput/Combobox**: Now extend HTMLAttributes — accept all standard HTML props
- **FormField**: Auto-wires `aria-describedby` via context. `getFormFieldA11y()` removed
- **Karm**: Peer dep tightened to `@devalok/shilp-sutra >=0.3.0`

### Fixed
- Karm hooks path rewrite bug (hooks/ was mapped to /ui instead of /hooks)
- Badge solid variant phantom token `text-on-interactive` → `text-on-color`
- Tailwind preset `screens` moved to `theme.extend` (no longer replaces deployer breakpoints)
- All dismiss/close buttons now meet WCAG 2.5.8 minimum 24px touch target
- Spinner/loader animations respect `prefers-reduced-motion`
- Toast close button now always visible (was hidden until hover)
- DialogHeader/Footer, SheetHeader/Footer now support ref forwarding

---

## [0.2.1] - 2026-03-05

### Fixed
- **Tailwind preset** `require` condition added to `./tailwind` export — Tailwind's CJS config loader can now `require('@devalok/shilp-sutra/tailwind')` without an absolute path workaround

---

## [0.2.0] - 2026-03-05

### Added — Next.js App Router Compatibility
- **`"use client"` directive** injected into all client-only components via post-build script — Server Components can now import shilp-sutra without `TypeError: e.createContext is not a function`
- **Per-component exports** for granular imports: `@devalok/shilp-sutra/ui/text`, `./ui/dialog`, `./composed/page-header`, etc. — enables importing server-safe components without pulling in client code
- **Server-safe components** identified and excluded from `"use client"`: Text, Skeleton, Spinner, Stack, Container, Table, Code, VisuallyHidden (ui); ContentCard, EmptyState, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator, StatusBadge (composed)

### Fixed — Type Resolution
- **`@primitives/*` type references** in published `.d.ts` files rewritten to relative paths — consumers no longer need ambient type stubs for 26 vendored Radix packages

### Added — API Improvements
- **Stack** `direction` prop now accepts `"row"` / `"column"` as aliases for `"horizontal"` / `"vertical"`
- **Stack** `gap` prop now accepts numeric values (e.g., `gap={4}` → `gap-ds-04`) in addition to token strings
- **StatCard** `icon` prop now accepts `React.ComponentType` (e.g., `icon={IconBolt}`) in addition to `ReactNode`

### Fixed — API Consistency
- **Text** `as` prop widened to accept any `React.ElementType` — `<Text as="h1">` no longer causes TypeScript errors
- **SearchInput** `inputSize` prop renamed to `size` to match Input API (HTML `size` attribute is `Omit`-ted)
- **Label** children rendering verified and covered by tests — issue was caused by the `@primitives` type leak, not a runtime bug

### Added — Documentation
- JSDoc module comments on `ui/index.ts`, `composed/index.ts`, `shell/index.ts` listing server-safe components and import patterns

---

## [0.1.1] - 2026-03-05

### Fixed — Critical Runtime Issues
- **BreakAdmin** `useMemo` called after conditional return — Rules of Hooks violation causing runtime crashes when loading state toggles
- **InputOTP** `animate-caret-blink` keyframe added to Tailwind preset — caret animation was silently broken
- **RadarChart** `--color-text-muted` replaced with `fill-text-tertiary` — chart axis labels were invisible
- **CorrectionList** invalid `border-1` class replaced with `border` — mobile borders were silently absent
- **AssociateDetail** `h-[auto]` replaced with `h-full` — vertical divider collapsed to 0px
- **LeaveRequest** fragile synthetic `MouseEvent` construction refactored to optional event parameter

### Fixed — Architecture & Compatibility
- **Shell components** decoupled from Next.js — replaced hard `next/link` import with polymorphic `LinkProvider`/`useLink` context; non-Next consumers get plain `<a>` tags by default
- **Brand logos** `resolveColor('auto')` made reactive to dark mode via `MutationObserver` — logo color now updates when `.dark` class toggles
- **Brand** `cn()` extended to cover all 11 `text-ds-*` sizes (was only 3, causing silent merge failures for larger sizes)
- **AppCommandPalette**, **useCalendar** — added missing `'use client'` directives
- **use-color-mode** — added SSR guard to `resolveMode` preventing server-side crashes
- **RichTextEditor** — added content sync effect so editor updates when `content` prop changes externally
- **useToast** — fixed `@/ui/toast` alias to relative import for consistency

### Fixed — Accessibility
- **Autocomplete** `focus:ring` → `focus-visible:ring` — focus ring no longer shows on mouse click
- **SegmentedControl** `tabIndex={0}` → `tabIndex={-1}` on tablist wrapper — fixes double-focus keyboard navigation bug
- **SegmentedControl** removed `!important` override — resolved specificity by restructuring base CVA classes
- **TopBar** search/AI buttons, **NotificationCenter** bell button, **BreakRequest** close button — added `aria-label` for screen readers
- **TopBar** search/AI/avatar buttons, **BottomNavbar** More button — added `type="button"` to prevent form submission
- **Textarea** — added `aria-invalid` for error state (matching Input pattern)

### Fixed — Token Compliance (60+ instances)
- Replaced raw `h-N`/`w-N` with explicit arbitrary values across Badge, Avatar, Skeleton, PageSkeleton, GlobalLoading, Dividers, SegmentedControl, CommandPalette
- Replaced `h-3 w-3` icon sizes with `h-ico-sm w-ico-sm` on NavigationMenu, CommandPalette, Badge icons
- Replaced `leading-none tracking-tight` → `leading-ds-none tracking-ds-tight` in Card
- Replaced `leading-[150%]` → `leading-ds-relaxed` in Code
- Replaced `opacity-[var(--action-disabled-opacity,0.38)]` → `opacity-action-disabled` in Chip
- Replaced `pl-10 pr-9` and icon offsets with explicit arbitrary values in SearchInput
- Replaced `py-12`/`py-16` with `py-ds-09`/`py-ds-10` in NotificationCenter and EmptyState
- Replaced `text-warning` → `text-text-warning` in TaskCard (dark mode contrast fix)
- Replaced `rounded-3xl` → `rounded-ds-3xl` in AssociateDetail
- Replaced ~300 raw Tailwind classes with design system tokens in story files (99% reduction in violations)

### Fixed — Code Quality
- **Chip** converted from `React.createElement` to JSX syntax
- **Karm chat** deduplicated `markdownComponents` into shared `markdown-components.tsx` module
- **Karm** replaced 5 inline SVGs with Tabler icon components (Chip, AttendanceCTA, EditBreak calendar nav)
- **Karm** wrapped 5 dialog components in `forwardRef` for consistency (DeleteBreak, EditBreak, EditBreakBalance, LeaveRequest, TaskDetailPanel)
- **Karm** `renderAdjustmentType` converted from default to named export
- **BreakAdmin** toast `border: 'None'` → `'none'` (valid CSS), `marginBottom` → token spacing
- **CorrectionList** removed hardcoded `Goutham.png` dev placeholder from published package
- **Data-table** fixed `useEffect` exhaustive-deps with proper dependency array
- **Stack** replaced dynamic `gap-${N}` with static lookup map (Tailwind JIT safety)
- **Module boundary** ESLint rules escalated from `warn` to `error`

### Added
- `LinkProvider` and `useLink` exports from `@devalok/shilp-sutra/shell` for framework-agnostic link injection
- `caret-blink` animation keyframe in Tailwind preset
- `./hooks` public export path for `useToast`, `useColorMode`, `useIsMobile`
- 19 missing semantic tokens exposed in Tailwind preset (letter-spacing, line-height, opacity, focus width)
- Lint scripts added to brand and karm packages

---

## [Unreleased]

### Added
- Carbon-inspired productive/expressive motion system with 7 duration tokens and 8 easing curves
- `motion()` and `duration()` TypeScript utilities for programmatic motion access
- Storybook "Foundations/Motion" guide with interactive duration/easing demos
- Motion tokens added to Accordion, Tooltip, Dialog, Sheet, Dropdown Menu, Toast

### Changed
- All motion-using components migrated to new productive/expressive token system (Button, Content Card, Task Card, Board Column, Attendance CTA, Global Loading, Skeleton, Progress, Transitions, Date Picker, Command Palette)

### Removed
- Old duration tokens: `--duration-fast`, `--duration-moderate`, `--duration-slow`, `--duration-deliberate`, `--duration-medium`, `--duration-enter`, `--duration-exit`
- Old easing tokens: `--ease-standard`, `--ease-entrance`, `--ease-exit`
- Old Tailwind duration utilities: `duration-fast`, `duration-moderate`, `duration-slow`, `duration-deliberate`, `duration-medium`, `duration-enter`, `duration-exit`
- Old Tailwind easing utilities: `ease-standard`, `ease-entrance`, `ease-exit`

### Added
- `--size-sm-plus` (36px) and `--size-xs-plus` (28px) sizing tokens
- Chart color tokens (`chart-1` through `chart-8`) in Tailwind preset
- `focus-inset` color token in Tailwind preset
- `rounded-ds-none` border radius token
- `minWidth` scale in Tailwind preset
- `SpacingToken` type union exported from Stack for type-safe gap usage

### Fixed
- **FileUpload** malformed spacing token names causing silent CSS failures
- **BreakAdmin** non-functional text class
- **DashboardHeader/Calendar** invalid Tailwind utilities
- **Badge** primitive color tokens breaking dark mode
- **GaugeChart** hex fallback removed, raw `text-2xl` → `text-ds-2xl`
- `opacity-40` → `opacity-[0.38]` WCAG standardization (7 files)
- Legacy CSS var in `breaks.tsx`
- Hardcoded font family in `leave-request.tsx`
- `window.confirm()` anti-pattern replaced with callback prop in TaskProperties
- `cn()` pattern fix in DailyBrief (template literal → cn utility)
- **Tabs** `TabsListContext` type error — `VariantProps` null handling with explicit coalescing
- **Toaster stories** updated stale `destructive`/`karam` variant references to `error`/`success`
- `calender` → `calendar` CSS class typo in edit-break and admin-dashboard
- Arbitrary `p-[10px_16px_4px_16px]` → `px-ds-05 pb-ds-01 pt-ds-03` in leave-request

### Changed
- Added `forwardRef` to 17 components per CONTRIBUTING.md checklist
- Added `...props` spread to 4 layout components (Sidebar, TopBar, BottomNavbar, NotificationCenter)
- Replaced raw z-index values with semantic tokens (13 instances, 10 files)
- Replaced `rounded-full`/`rounded-none` with `rounded-ds-full`/`rounded-ds-none` (19 instances)
- Replaced raw `h-8`/`w-8` → `h-ds-sm`/`w-ds-sm`, `h-9`/`w-9` → `h-ds-sm-plus`/`w-ds-sm-plus`, `h-7`/`w-7` → `h-ds-xs-plus`/`w-ds-xs-plus` (70+ instances)
- Replaced ~100 raw half-step spacing values with `ds-*` tokens (0.5→ds-01, 1.5→ds-02b, 2.5→ds-03, 3.5→ds-04)
- Replaced `p-[10px]` with `p-ds-03` in admin tables (15 instances)
- Replaced raw `h-10`/`w-10` → `h-ds-md`/`w-ds-md`, `w-12` → `w-ds-lg` across components
- Breadcrumb separator icons `h-3.5 w-3.5` → `h-ico-sm w-ico-sm` (icon token alignment)
- Progress bar `h-1.5` → `h-ds-02b` (exact 6px match)
- Stack `gap` prop type-restricted to `SpacingToken` union (15 ds-* values only)
- Documented intentional arbitrary pixel values in karm/admin (10 comments)
- Replaced all template literal `className` patterns with `cn()` utility (30+ instances, 16 files)
- Replaced `100vh` with `100dvh` in 4 mobile viewport scroll containers for better browser chrome handling
- Replaced ~100 raw CSS `var(--color-*)` / `var(--radius-*)` patterns in story files with Tailwind utilities

### Removed
- Legacy `typography.css` from import chain (all components use `typography-semantic.css`)
- Redundant dark mode layout token declarations (`--max-width`, `--max-width-body`)

---

### Previous Releases

### Added
- **PaginationNav** compound wrapper with `generatePagination` helper for controlled pagination
- **Skeleton** `shape` variants (text, circular, rectangular) and shimmer animation
- **Progress** `size`, `color`, `indeterminate` variants and optional label slot
- **Avatar** CVA size variants (`xs`–`2xl`) and status indicator badge
- 10 new Storybook stories (Autocomplete, Chip, Container, Stack, Transitions, Stepper, Toaster, DataTableToolbar, MemberPicker, SegmentedControl)
- Storybook play() interaction tests on 10 stories (Combobox, Autocomplete, Accordion, Dialog, Tabs, Select, Chip, Toast, Alert, Stepper)
- Variant exhaustiveness matrices on 7 components (Button, Badge, Alert, Avatar, Progress, Banner, Toggle)
- 20 UI accessibility test suites (Button, Badge, Banner, Breadcrumb, Chip, Code, Link, Toggle, ToggleGroup, Spinner, Combobox, NumberInput, SearchInput, Slider, InputOTP, Pagination, StatCard, Text, Popover, HoverCard)
- 6 Karm unit test suites (LeaveRequest, EditBreak, AttendanceOverview, CorrectionList, DashboardHeader, BreakBalance)
- 10 form component test suites (Select, Textarea, Radio, Switch, SearchInput, NumberInput, Slider, Toggle, Label, Pagination)
- 4 integration test suites (BreakAdmin compound, AdminDashboard composition, ChatPanel sheet, DataTable+Toolbar)
- **Total test coverage**: 114 files, 729 tests

### Fixed
- **Slider** `aria-label` now forwarded to thumb element (was only on root container)
- Disabled state opacity standardised to `opacity-[0.38]` across all components (WCAG AA)
- `displayName` added to 22 components that were missing it
- Phantom CSS variable references replaced with valid semantic tokens
- Hardcoded arbitrary spacing values replaced with `ds-*` tokens
- Pagination link padding uses `ds-*` tokens instead of Tailwind arbitrary values
- Typography semibold weight bug, B1 legacy size, and font scaling consistency

### Changed
- **BreakAdmin** converted to compound component pattern (`BreakAdmin.Root` + sub-components)
- **SegmentedControl** standardised sizes, added icon support, cleaned tokens
- CVA size scales standardised across all variant-bearing components
- 86 hardcoded arbitrary values replaced with semantic design tokens
- Sapta Varna categorical color system added (7 cultural color primitives)
- Badge migrated to semantic + category variants (removed `tag-*` dependency)

### Previous (Phase 0–3)

#### Fixed
- Toast now announces to screen readers (`role="status"`, `aria-live`)
- Input sets `aria-invalid` on error state
- Calendar date cells have aria-labels and keyboard support (Enter + Space)
- Table headers have `scope="col"` for screen reader navigation
- Animations respect `prefers-reduced-motion`
- Z-index violations fixed in leave-request tooltips
- ESLint jsx-a11y rules elevated to error level
- `--color-danger` deprecated in favor of `--color-error`

#### Added
- `prefers-reduced-motion` global CSS rule
- `--color-text-interactive` token for WCAG AA text contrast
- Spacing tokens exposed to Tailwind (`p-ds-05`, `gap-ds-03`, etc.)
- Sizing tokens exposed to Tailwind (`h-ds-md`, `w-ico-lg`, etc.)
- Branded gradient tokens (`bg-gradient-brand`)
- Vitest + React Testing Library test infrastructure
- CI quality gates (typecheck, lint, test, build)
- Custom branded Storybook theme
- CHANGELOG.md
- CONTRIBUTING.md
- Design philosophy manifesto

#### Changed
- CustomButton `type` prop renamed to `variant` (`type` deprecated)
- `DashboardSkeleton` in karm/admin renamed to `AdminDashboardSkeleton`

## [0.1.0] - 2026-02-28

### Added
- Initial release: 114 components across ui/, shared/, layout/, karm/ modules
- 3-tier design token system (primitives, semantic, Tailwind)
- Vendored Radix UI primitives (zero @radix-ui runtime deps)
- Dark mode support via `.dark` class toggle
- Storybook 8.6 with 95 stories
- AdminDashboard compound component pattern
- Import boundary enforcement for module architecture
