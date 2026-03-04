# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
