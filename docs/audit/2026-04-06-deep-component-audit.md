# Deep Component Audit — Per-Component Findings

**Date:** 2026-04-06
**Scope:** Every component in the design system (100+ components across 6 categories)
**Benchmarked against:** Mantine v7, Radix Themes v3, shadcn/ui, Chakra UI v3

## Overall Scores by Category

| Category | Components | API | A11y | Tests | Dark Mode | Animation | Industry |
|----------|-----------|-----|------|-------|-----------|-----------|----------|
| Form Controls (19) | B+ | PASS | PASS | WEAK (6 missing) | PASS | NEEDS reduced-motion | Competitive |
| Feedback/Overlays (13) | A- | PASS | PASS | WEAK (7 missing) | PASS | PASS | Competitive |
| Data Display (23) | B | PASS | PARTIAL | CRITICAL (10+ missing) | PASS | PASS | Competitive |
| Navigation (13) | A- | PASS | PASS | WEAK (3 missing) | PASS | PASS | Strong |
| Composed (30) | A- | PASS | PARTIAL | GOOD (1 missing) | PASS | PASS | Strong |
| Shell/Chat/Charts/AI (25+) | B+ | PASS | NEEDS-WORK | CRITICAL (charts 0) | PASS | PASS | Competitive |

## Priority 1: Test Coverage Crisis

30+ components have zero test files. Grouped by effort:

### Quick tests (simple components, <10 tests each):
Label, Separator, AspectRatio, Code, Container, Stack, Text, Chip (deprecated),
Collapsible, Progress, Skeleton, DevalokGrain, IconContext, IconGroup

### Medium tests (interactive, 10-20 tests each):
Avatar, Tooltip, Popover, HoverCard, Banner, AlertDialog, Icon,
Toggle Group, InputOTP, Form/FormField, Autocomplete, ColorInput,
ContextMenu, Menubar, NavigationMenu, StatCard, DataTable, DataTableToolbar

### Complex tests (charts, 5-10 tests each):
BarChart, LineChart, AreaChart, PieChart, GaugeChart, RadarChart, Sparkline

### Motion system:
MotionProvider (springs/tweens snapshot tests)

## Priority 2: Accessibility Fixes

| Issue | Components | Fix |
|-------|-----------|-----|
| No prefers-reduced-motion | All form controls with animation | Check useReducedMotion() |
| Chart no table fallbacks | All 7 chart types | Add hidden accessible table |
| .focus-ring-sm is 1px | Badge dismiss button | Bump to 2px |
| Avatar pulse ignores reduced-motion | Avatar status dot | Add useReducedMotion check |
| Badge dual-button keyboard | Badge (onClick + onDismiss) | Refactor nested role="button" |
| RTE toolbar aria-labels | RichTextEditor | Add aria-label to toolbar buttons |
| NotificationCenter aria-live | NotificationCenter | Add aria-live="polite" |
| WCAG 2.5.8 target sizes | Checkbox (20px), Radio (20px), Switch sm (18px), Slider thumb (16px) | Increase to 24px minimum |

## Priority 3: API Consistency

| Component | Missing | Fix |
|-----------|---------|-----|
| Checkbox | size, variant props | Add size (sm/md/lg), default md |
| Radio | size, variant props | Add size (sm/md/lg), default md |
| Slider | size, color props | Add size (sm/md/lg), color for track |
| NumberInput | uncontrolled mode | Add defaultValue support |
| Form validation | Inconsistent naming | Document convention: Input=state, Select=color, Checkbox=error |

## Priority 4: Industry Benchmark Gaps

| Gap | Industry Leader | Recommendation |
|-----|----------------|----------------|
| DatePicker i18n | Mantine (locale, firstDayOfWeek) | Add locale prop, week start day |
| CommandPalette fuzzy search | cmdk (Vercel) | Add fuse.js or similar |
| Tabs overflow | None built-in (all gap) | Add horizontal scroll with arrows |
| Breadcrumb auto-truncation | Custom (max-items pattern) | Add maxItems prop |
| Tooltip arrow | Mantine, Chakra (withArrow) | Add arrow option |
| Chart accessible tables | WCAG requirement | Add hidden data table per chart |

## Cross-Cutting Strengths

- Dark mode: 96%+ semantic token compliance across all components
- Animation: Framer Motion with well-tuned springs (snappy, smooth, bouncy, gentle)
- API design: Consistent compound component patterns
- Radix primitives: Solid ARIA foundation
- Token system: ds-* spacing used consistently
- Build: SSR smoke test, server-safe annotations, selective use-client

## Deferred (not for this cycle)

- AI streaming support (architectural, separate effort)
- Virtual scrolling for MessageList/NotificationCenter
- Chart types: scatter, funnel, heatmap
- Tree drag-drop reordering
- Responsive text sizing system
