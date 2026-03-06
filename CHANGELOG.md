# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
