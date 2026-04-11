# World-Class Design System Audit — Design Document

**Date:** 2026-04-12
**Goal:** Audit every layer of shilp-sutra against industry leaders to identify every gap preventing world-class status, produce a prioritized roadmap, and create an implementation plan validated by multiple cross-reference passes.

**Benchmarks:**
- **Tier 1 (API/DX):** shadcn/ui, Radix Themes, Chakra UI, Mantine
- **Tier 2 (Enterprise rigor):** IBM Carbon, Atlassian Design System, Material Design 3, Primer (GitHub)
- **Tier 3 (Craft/polish):** Linear, Vercel/Geist, Stripe, Resend

**Outcome:** Discovery report + prioritized roadmap (P0–P3) + implementation plan + validation audit of the plan itself.

---

## Methodology

### Scoring Rubric

Every foundation and component is evaluated on **5 dimensions**:

| Dimension | What We Measure | Primary Benchmarks |
|-----------|----------------|-------------------|
| **API Design** | Props, composition, consistency, TypeScript, DX | shadcn/ui, Radix Themes, Mantine, Chakra |
| **Visual Quality** | Token usage, spacing, elevation, dark mode, polish | Linear, Stripe, Vercel/Geist, Resend |
| **Accessibility** | WCAG 2.2 AA, ARIA, keyboard, focus, screen reader | WAI-ARIA APG, Carbon, Primer, Material |
| **Engineering** | Bundle size, tree-shaking, SSR, perf, tests | Carbon, Primer, shadcn/ui |
| **Documentation** | Stories, prop docs, examples, llms.txt | Mantine, Chakra, Carbon |

### Rating Scale

- **World-class** — Matches or exceeds the best in the industry
- **Strong** — Solid, minor gaps vs leaders
- **Adequate** — Functional, noticeable gaps
- **Gap** — Missing or significantly behind leaders
- **Critical Gap** — Broken, inaccessible, or fundamentally wrong

Every rating below "World-class" produces a finding with:
1. What it is today
2. What world-class looks like (specific reference to which leader does it right)
3. What needs to change
4. Effort estimate (S / M / L / XL)

### Cross-Reference Rule

Every finding is traced both directions:
- **Forward:** Foundation issue → which components inherit it?
- **Backward:** Component issue → is this a root cause or symptom?
- **Dedup:** 20 components with the same issue = 1 finding with 20 instances

---

## Phase 1: Foundations Audit

### 1a. Color System

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Color space choice | OKLCH vs HSL vs P3 — correctness, gamut mapping, browser support, fallbacks | Material 3 (HCT), Radix Colors (P3-ready HSL), Linear (OKLCH) |
| Scale structure | 12-step — enough? Too many? Step distribution (lightness curve) | Radix Colors (12-step), Tailwind (11-step), Carbon (10-step), Material (tonal palette) |
| Chroma distribution | Taper at extremes — steps 1-3 washed out? Steps 9-10 clip in P3? | Radix Colors (hand-tuned per hue), Material (CAM16 chroma) |
| Semantic mapping completeness | All semantic needs covered? Missing roles? (e.g., no `accent-contrast`?) | Radix Themes (explicit contrast tokens), Mantine (complete semantic layer) |
| Dark mode implementation | Inverted hierarchy, contrast preservation, chroma adjustments | Radix Colors (independent dark scales), Linear (dark-first) |
| Status colors | Contrast ratios, colorblind safety, amber-bright workaround | Material 3 (color roles), Carbon (alert palette), WCAG |
| Category colors | 7-color Sapta Varna — enough? Colorblind distinguishability? | Carbon (14 categorical), Primer (8), Material (extended) |
| Chart palette | 8 colors — sequential/diverging/categorical coverage | Carbon data viz, Material data viz |
| Accent swappability | Consumer retheming ease — what breaks? | Radix Themes (accent prop), Mantine (primaryColor), Chakra (colorScheme) |
| P3 wide gamut | Values outside sRGB? Fallback handling? | Radix Colors (P3 + sRGB fallback), WebKit guidelines |
| Contrast ratios | Every semantic pair — AA compliance (4.5:1 normal, 3:1 large) | WCAG 2.2, APCA |

### 1b. Typography System

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Type scale ratio | Mathematical ratio? Consistency of steps? | Material 3 (major third), Carbon (modular), Geist (custom) |
| Scale completeness | 11 sizes (xs–6xl) — gaps? Is xs (10px) too small? | Mantine (12), Carbon (14), Material (15 roles) |
| Semantic variants | Headings, body, labels, caption, overline — missing roles? | Material 3 (display/headline/title/body/label), Carbon (productive/expressive) |
| Font stack | Inter + Ranade — weight range, variable font, fallback chain | Geist (custom variable), Linear (Inter), Stripe (custom) |
| Line height pairings | Optically correct per size? Heading tightness? Body looseness? | Material 3 (per-size pairings), Butterick's Practical Typography |
| Letter spacing per size | Large sizes tighter? Small sizes looser? | Material 3 (detailed per-size tracking) |
| Responsive typography | Sizes scale on mobile? Fluid type? Viewport-relative? | Utopia (fluid type), Material (breakpoint-adjusted), Carbon (responsive sets) |
| Font loading | FOUT/FOIT, `font-display`, preload, subset? | web.dev best practices, Vercel font optimization |
| Weight distribution | 5 weights (300–700) — is 300 used? Missing 800/900 for display? | Variable font best practice |
| Label convention | Uppercase + wide tracking — accessible? Readable at small sizes? | NNG ALL CAPS research, Material (no forced uppercase) |

### 1c. Spacing System

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Base unit | 4px — correct? Consistency of multipliers? | Material (4/8px), Carbon (8px mini, 2px micro), Tailwind (4px), Primer (4px) |
| Scale gaps | `-b` variants (6px, 20px, 28px) — ad-hoc patches or deliberate? | Carbon (structured), Material (4px increments), Tailwind (complete) |
| Naming convention | Numbered (01–13) vs semantic (xs/sm/md) — intuitive? | Carbon (numbered), Tailwind (numbered), Chakra (named), Mantine (named) |
| Coverage | Jump from 96px to 160px — gap too large? | Tailwind (complete to 384px), Carbon (layout spacing) |
| Component consistency | Do paddings/gaps reference tokens or hardcode values? | Standard: all spacing from tokens, zero hardcoded px |
| Layout spacing | Separate layout scale (page margins, section gaps)? | Carbon (layout: 16, 24, 32, 48, 64, 96), Material (explicit layout) |

### 1d. Surface & Shadow System

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Surface hierarchy | base/sunken/raised/overlay — clear? Missing levels? | Material 3 (5 surfaces + dim/bright), Linear (3-layer), Stripe (2-layer) |
| Shadow realism | Multi-layer — realistic source? Consistent angle? | Material 3 (tonal elevation), Linear (subtle multi-layer), Stripe (refined) |
| Dark mode shadows | 2.5x multiplier — works or too heavy? | Material 3 (tonal replaces shadows), Linear (reduced in dark) |
| Elevation-to-z mapping | Shadow levels map to z-index levels cleanly? | Material 3 (strict mapping), Carbon (layer model) |
| Effect shadows | Glow, brand — used consistently? Accessible? | Linear (glow), Stripe (subtle brand) |
| Disabled surfaces | Contrast with enabled? | WCAG non-text 3:1, Material (38% opacity) |

### 1e. Motion System

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Duration scale | 7 steps (0–700ms) — all interaction types covered? | Carbon (6), Material (extensive), Stripe (4 tiers) |
| Easing philosophy | Productive vs expressive — clear guidelines? | Carbon (invented this split), Material (standard/emphasized) |
| `prefers-reduced-motion` | Respected everywhere? Fallback (instant vs none)? | WAI guidelines, Carbon (instant), Material (reduced/removed) |
| Framer Motion integration | Motion presets consistent with CSS tokens? | Linear (consistent Framer), Resend (polished motion) |
| Entrance/exit patterns | Standardized for overlays, modals, popovers? | Material (container transform), Carbon (productive), shadcn (CSS keyframes) |
| Scroll-triggered motion | Supported? Needed? | Linear (scroll-driven), Stripe (parallax), Vercel (scroll) |
| Animation performance | GPU-accelerated only? No layout thrash? `will-change`? | web.dev best practices |

### 1f. Remaining Tokens

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Border radius scale | 7 levels — missing values? Application consistency? | Material (4), Carbon (4), Tailwind (8) |
| Z-index scale | 9 levels — sufficient? Collisions? | Material (layer model), Carbon (5), Primer (z-index) |
| Component sizing | xs/sm/md/lg/xl — consistent across all components? | Mantine (consistent 5-size), Chakra, Carbon |
| Border width | 3 levels + focus — complete? | Carbon, Material |
| Breakpoints | 5 (640–1536px) — standard? | Tailwind (same 5), Carbon (4), Material (compact/medium/expanded) |
| Opacity tokens | Action state opacities — work for all surface colors? | Material (state layers), Carbon (interaction tokens) |

---

## Phase 2: Infrastructure Audit

### 2a. Tailwind Preset

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Namespace strategy | `ds-` prefix — conflicts with defaults? Should some replace instead of extend? | shadcn/ui (replaces), Mantine (no TW), Chakra (theme tokens) |
| Token coverage | Every CSS var has a TW utility? Orphaned tokens? | Cross-ref semantic.css vs preset.ts |
| Naming consistency | Mixed naming across categories? | Tailwind (consistent), Carbon (BEM-like) |
| Composability | Consumers extend without breakage? Override specific tokens? | shadcn/ui (consumers own config), Mantine (theme override) |
| Dark mode utilities | `.dark` toggle complete? Missing dark-only utilities? | Tailwind dark mode, Radix Themes (data-attribute) |
| Custom utilities | `.touch-target`, `.focus-ring`, etc. — complete set? | Carbon (extensive), Material Web (custom properties) |
| Responsive token behavior | Tokens change at breakpoints? Should they? | Material (window size classes), Carbon (responsive spacing) |
| Plugin architecture | Monolith or composable? Import just colors or just typography? | TW plugin best practices |

### 2b. Build Pipeline

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Entry point strategy | Per-component tree-shaking effectiveness? | shadcn (copy-paste), Radix (per-package), Mantine (modular) |
| Chunk strategy | Optimal splitting? | Bundle best practices |
| Bundle size | Total and per-component vs alternatives | shadcn (0KB), Radix Themes (~50KB), Mantine (~200KB) |
| Tree-shaking verification | Single import pulls unrelated code? | Standard: < 5KB gzipped per component |
| `"use client"` correctness | Server-safe annotations all correct? | Next.js RSC, Radix Themes |
| SSR safety | Smoke test coverage, browser API guards, hydration | Next.js/Remix patterns, Mantine SSR |
| CJS/ESM dual package | Conditional exports correct? | Node.js dual package guidelines |
| Source maps | Shipped? Quality? | Library sourcemap standards |
| CSS delivery | Token loading, order sensitivity | TW JIT, Mantine CSS modules, shadcn utilities |
| Dependency externalization | Bundled vs external correct? | Library bundling best practices |
| Post-build pipeline | Fragile? Reliable? | Mantine (tsup), Radix (tsup), Carbon (Rollup) |

### 2c. Storybook Setup

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Organization | Flat vs nested? Naming? Categories? | Carbon SB, Mantine SB, Primer SB |
| Autodocs quality | Prop tables complete? Descriptions? | Mantine docs (gold standard), Chakra, Carbon |
| Story coverage | Every component, variant, state? | 100% industry expectation |
| Interactive controls | Args/controls configured for every prop? | SB best practices |
| a11y addon | Configured? Running on all stories? | SB a11y addon |
| Visual testing | Chromatic or similar? Regression detection? | Chromatic (Linear uses it), Percy |
| Play functions | Interaction testing in stories? | SB interaction testing, Carbon |
| Story patterns | Real-world usage demos, not just prop toggles? | Mantine (recipes), Carbon (usage), Primer (patterns) |
| Dark mode toggle | Mode switch in SB? Side-by-side? | SB dark mode addon |
| Mobile viewports | Viewport addon? Responsive stories? | SB viewport addon |
| MCP server | Useful? Complete? All components covered? | Emerging (innovative — few DS have this) |
| Performance stories | Stress tests? Large lists? | Carbon (DataTable perf stories) |

### 2d. Testing Infrastructure

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Coverage depth | 2100+ tests — line/branch/function coverage? | Standard: 80%+ |
| Test patterns | RTL best practices? User behavior vs implementation? | Testing Library philosophy |
| Accessibility testing | vitest-axe everywhere? Rules? Disabled rules justified? | Deque axe-core, jest-axe |
| Keyboard testing | Tab, Enter, Space, Escape, Arrow tested? | WAI-ARIA APG, Carbon |
| Snapshot testing | Used? Overused? | Industry: minimal snapshots |
| Mock quality | jsdom mocks hiding real bugs? | jsdom limits, Playwright for real browser |
| E2E testing | Playwright/Cypress? | Mantine (Playwright), Carbon (Cypress) |
| Visual regression | Automated screenshots? | Chromatic, Percy, Playwright |
| Performance testing | Render benchmarks? | React Profiler integration |

### 2e. Linting & Type Safety

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| TypeScript strictness | Escape hatches? `@ts-ignore` count in non-vendored? | Standard: zero |
| Exported types | Every component exports props? Discriminated unions? | Mantine, Chakra, Radix |
| ESLint config | Rules? React? a11y? Import ordering? | Carbon (custom rules), Airbnb |
| Module boundaries | Enforced by ESLint? Violations? | Nx, ESLint import restrictions |
| Generic constraints | Select\<T\>, Combobox\<T\> where needed? | Mantine (generics), react-select |

### 2f. CI/CD Pipeline

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| Pipeline completeness | What's missing from typecheck→lint→test→build→deploy? | Carbon, Mantine, Primer pipelines |
| PR checks | What gates must pass? | Standard: all of typecheck, lint, test, build, bundle size |
| Changesets integration | Automated changelog and versioning? | Changesets, semantic-release |
| Bundle size tracking | CI check for regressions? | bundlesize, size-limit, Lighthouse CI |
| Visual regression in CI | Chromatic on PRs? | Standard for DS |
| Publish automation | Manual vs automated? Canary releases? | npm CI publish, Changesets GH Action |
| Branch protection | Required reviews, status checks? | GH branch protection |

### 2g. Design Token Interoperability

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| W3C Design Token format | Tokens exportable to standard format? | W3C Design Token Community Group spec |
| Figma sync | Tokens available in Figma? Sync mechanism? | Tokens Studio, Style Dictionary, Figma Variables |
| Style Dictionary | Pipeline to generate multi-platform output from single source? | Amazon Style Dictionary, Salesforce Theo |
| Designer handoff | Designers can access token values without reading CSS? | Mantine (token docs), Carbon (token page), Material (theme builder) |

### 2h. Consumer DX

| Audit Item | What We Check | Benchmarked Against |
|------------|--------------|-------------------|
| First-use experience | Install → first component rendered — steps, friction, errors | shadcn/ui CLI (best DX), Mantine (docs quality), Chakra (provider setup) |
| Error messages | What happens when tokens not loaded? Wrong TW version? Missing transpilePackages? | Mantine (clear errors), Material (diagnostics) |
| Upgrade experience | Breaking changes caught at build time or runtime? | Codemods (Carbon, Material), deprecation warnings |
| TypeScript DX | Autocomplete quality? Error messages helpful? | Mantine (excellent TS DX), Chakra |
| Bundle debugging | Can consumers diagnose what's pulling in what? | Webpack/Vite bundle analyzer compatibility |

---

## Phase 3: Component-by-Component Audit

### Per-Component Rubric (10 axes)

Every component evaluated on:

| # | Axis | Specifics |
|---|------|-----------|
| 1 | **API Design** | Props, naming, composition, `asChild`, controlled/uncontrolled, generic types, ref forwarding, `cn()` |
| 2 | **Variant Completeness** | CVA axes, standard variants present, missing combinations vs peers |
| 3 | **Visual Quality** | Token usage, spacing, alignment, border, elevation, hover transitions, polish |
| 4 | **Dark Mode** | Full support, contrast, no hardcoded light-only values, bg/fg pairs |
| 5 | **Accessibility** | ARIA role/pattern (APG), keyboard, focus visible, focus trap, screen reader, contrast, touch target |
| 6 | **Responsive** | All breakpoints, mobile behavior, touch-friendly, no overflow |
| 7 | **Motion** | Token usage, entrance/exit, `prefers-reduced-motion`, Framer vs CSS consistency |
| 8 | **Bundle** | KB gzipped, heavy deps, lazy-loadable, SSR safe |
| 9 | **Tests** | Exists, variant coverage, keyboard, axe, edge cases |
| 10 | **Stories** | Exists, all variants, controls, composition demos, edge cases, dark mode |

### Component Groups (audit order)

#### Group A: Actions (8)
Button, IconButton, ButtonGroup, SplitButton, Toggle, ToggleGroup, SegmentedControl, Link

**Benchmarks:** Linear (polish), Stripe (states), shadcn/ui (API), Mantine (variant matrix)
**Cross-check:** Same `variant`/`color` vocabulary? Same size scale? Same focus ring? Same disabled treatment?

#### Group B: Form Inputs (13)
Input, Textarea, SearchInput, NumberInput, ColorInput, InputOTP, Select, Combobox, Autocomplete, Checkbox, Radio, Switch, Slider

**Benchmarks:** Mantine (form suite), Chakra (form integration), Carbon (form patterns), Radix (primitives)
**Cross-check:** Consistent height at same `size`? Same border/error/focus treatment? RHF integration consistent?

#### Group C: Form Infrastructure (3)
Form, Label, FormSection

**Benchmarks:** Mantine (useForm), react-hook-form, Carbon (form patterns)
**Cross-check:** `useFormField()` ARIA wiring correct everywhere?

#### Group D: Data Display (10)
Text, Code, Card, StatCard, Badge, BadgeIndicator, BadgeGroup, StatusDot, DeadlineIndicator, PriorityIndicator

**Benchmarks:** Radix Themes (Text), Linear (cards), Stripe (stats), Carbon (tag/badge)
**Cross-check:** Same `color` vocabulary? Size scale consistent?

#### Group E: Media & Icons (6)
Icon, IconButton, IconGroup, IconContext, Avatar, AvatarGroup

**Benchmarks:** Primer (Octicons), Carbon (icons), Linear (avatars)
**Cross-check:** Icon sizing vs text sizes? Avatar sizes vs component sizes?

#### Group F: Feedback (8)
Alert, Banner, Toast, Toaster, Spinner, Progress, ProgressRing, Skeleton/LoadingSkeleton

**Benchmarks:** Mantine (notifications), Carbon (inline vs toast), Stripe (loading), Linear (shimmer)
**Cross-check:** Same `color` axis? Same icon auto-selection? Consistent dismiss pattern?

#### Group G: Overlays (10)
Dialog, AlertDialog, ConfirmDialog, Sheet, Popover, HoverCard, Tooltip, SimpleTooltip, DropdownMenu, ContextMenu

**Benchmarks:** Radix (primitives), Mantine (overlay API), shadcn/ui (composition), Linear (animation)
**Cross-check:** Consistent animation? Same backdrop? Same focus trap? Same escape? Z-index correct?

#### Group H: Navigation (6)
Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar, Stepper

**Benchmarks:** Carbon (tabs), Primer (navigation), Material (nav), Mantine (stepper)
**Cross-check:** Active state consistent? Keyboard nav patterns consistent?

#### Group I: Layout (7)
Stack, Container, Separator, AspectRatio, Accordion, Collapsible, MasterDetail

**Benchmarks:** Chakra (Stack), Carbon (grid), Mantine (layout)
**Cross-check:** Spacing token usage? Responsive behavior?

#### Group J: Data-Heavy (4)
DataTable, DataTableToolbar, DataTableBulkActions, FilterBar

**Benchmarks:** TanStack Table, Carbon DataTable, Mantine DataTable, AG Grid
**Cross-check:** Selection, bulk actions, filter, sort, pagination integration?

#### Group K: Charts (3)
AreaChart, BarChart, ChartContainer

**Benchmarks:** Recharts, Carbon Charts, Tremor, Nivo
**Cross-check:** Color tokens? Responsive? Accessible (patterns not just colors)?

#### Group L: Content (7)
MarkdownViewer, RichTextEditor, RichChatInput, FileUpload, FilePreview, EmojiPicker, InlineEdit

**Benchmarks:** TipTap, Linear (editing), Notion (composition), Mantine (file upload)
**Cross-check:** Toolbar consistency? File handling?

#### Group M: Shell (8)
Sidebar, TopBar, BottomNavbar, AppCommandPalette, CommandPalette, CommandRegistry, NotificationCenter, NotificationPreferences

**Benchmarks:** Linear (shell), Stripe Dashboard, Vercel (sidebar), Carbon (UI shell)
**Cross-check:** Shell components work together? Responsive? Mobile adaptation?

#### Group N: AI (15)
Conversation, CommandBar, AICommandProvider, BlockRenderer, DevadootIcon, + 10 blocks

**Benchmarks:** Vercel AI SDK, ChatGPT UI, Claude UI, Copilot patterns
**Cross-check:** Block extensibility? Streaming? Loading? Error recovery?

#### Group O: Utilities & Composed (20+)
useColorMode, useMobile, useToast, useTouchDevice, useViewportHeight, VisuallyHidden, DevalokGrain, ResponsiveOverlay, GlobalLoading, EmptyState, ErrorBoundary, PageHeader, PageSkeletons, BulkActionBar, MemberPicker, MultiSelectPopover, ContentCard, ScheduleView, StatusBadge, ActivityFeed

**Cross-check:** Hook API consistency? Utility component quality?

---

## Phase 4: Cross-Cutting Audit

### 4a. Naming Consistency

- Variant axis names consistent across all CVA components?
- Color axis values — same set everywhere or per-component divergence?
- Size axis values — universal scale or inconsistent?
- Boolean prop naming convention (`disabled` vs `isDisabled`)?
- Event handler naming (`onChange` vs `onValueChange`)?
- Slot naming (`Header/Footer/Content` consistent)?
- Ref forwarding + `displayName` universal?

### 4b. Composition Patterns

- Compound component threshold (8 props / 2+ sections) applied consistently?
- `asChild` support — who has it, who should?
- Customization points — render props, slots, children, className — consistent approach?
- Context usage — leaking? Nested issues?
- Polymorphic `as` vs `asChild` — consistent?
- Children API — string vs ReactNode vs render function expectations consistent?

### 4c. Form Integration

- `useFormField()` wiring correct in every input?
- Controlled/uncontrolled both supported everywhere?
- Error display consistent across all inputs?
- Disabled state consistent (opacity, cursor)?
- Required indicator consistent?
- Form reset works on all inputs?

### 4d. Error State Handling

- Form error visual treatment, ARIA, position consistent?
- EmptyState used consistently or ad-hoc?
- Async failure fallback pattern?
- ErrorBoundary placement?
- Network error patterns?

### 4e. Loading State Patterns

- Skeleton vs LoadingSkeleton vs PageSkeletons — clear hierarchy?
- Button loading consistent across Button, IconButton, SplitButton?
- Async content state machine consistent?
- Spinner vs Progress vs ProgressRing vs Skeleton — clear guidance?
- AI streaming partial content rendering?

### 4f. Token Discipline

Full sweep of component source code:
- Hardcoded `#hex`, `rgb()`, `oklch()` instead of tokens?
- Hardcoded `px` instead of spacing tokens?
- Tailwind defaults (`text-sm`) instead of DS tokens (`text-ds-sm`)?
- Tailwind shadows (`shadow-md`) instead of DS shadows (`shadow-raised`)?
- Tailwind radius (`rounded-lg`) instead of DS radius (`rounded-ds-lg`)?
- Tailwind z-index (`z-50`) instead of DS z-index (`z-overlay`)?

### 4g. Density Modes

- Design philosophy claims Comfortable and Compact — implemented?
- If implemented: every component responds to density context?
- If not: what would it take? Which components need it most?
- Benchmark: Material 3 (3 density levels), Carbon (condensed/normal), Mantine (compact via sizes)

### 4h. Focus Management System-Level

- Dialog → DropdownMenu → Popover nesting — focus restoration chain works?
- Multiple overlays open simultaneously — z-index and focus trap stacking correct?
- Focus return after overlay close — returns to correct trigger?
- Tab trap boundaries — no escape from modals?
- Auto-focus on mount — consistent pattern?
- Focus management for dynamic content (items added/removed)?

---

## Phase 5: Plan Validation

### 5a. Cross-Reference Pass

- Every Phase 1 finding → trace forward: which components affected?
- Every Phase 3 finding → trace backward: token/infra root cause or component-specific?
- Deduplicate: same issue across N components = 1 finding with N instances

### 5b. Gap Analysis

- Any audit item produced zero findings? Verify — genuinely world-class or insufficient analysis?
- For every feature in Carbon/Material/Mantine: did we check if shilp-sutra has it or consciously excluded it?
- Missing components: what do leaders offer that shilp-sutra doesn't? (e.g., DatePicker, TreeView, Drawer, etc.)

### 5c. Prioritization

| Priority | Criteria |
|----------|----------|
| **P0 — Blocking** | Prevents "world-class" claim. Must fix. (WCAG failures, broken keyboard, inconsistent APIs) |
| **P1 — Significant** | Noticeable gap vs leaders. Should fix. (Missing variants, dark mode gaps, bundle outliers) |
| **P2 — Polish** | Refinement, not a gap. (Micro-animations, advanced stories, perf optimization) |
| **P3 — Aspirational** | Beyond current leaders. Differentiator. (Innovative features) |

### 5d. Implementation Sequencing

1. Foundation fixes first (token changes cascade to all components)
2. Infrastructure fixes (build, test, Storybook)
3. Component fixes grouped by dependency and effort
4. Cross-cutting fixes
5. Polish pass

### 5e. Second-Pass Audit

Re-read entire plan:
- Did we miss any component?
- Did we miss any axis for any component?
- Is every priority assignment defensible?
- Does the sequence account for all dependencies?
- Would a new engineer reading this plan know exactly what to do?
