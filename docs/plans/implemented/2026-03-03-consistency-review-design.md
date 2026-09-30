# Design: Comprehensive Design System Consistency & Standardization Review

**Date**: 2026-03-03
**Status**: Approved
**Scope**: Full spectrum review of all ~114 components across ui/, shared/, layout/, karm/

## Goal

Ensure consistency and standardization across the entire shilp-sutra design system by:
1. Auditing every component against internal standards (CONTRIBUTING.md checklist)
2. Benchmarking against industry design systems
3. Using expert council deliberation to decide what needs changing
4. Producing a prioritized remediation roadmap

## Phase 1 — Cross-Cutting Analysis (8 parallel agents)

Each agent reviews its dimension across ALL components. Findings rated: Critical/High/Medium/Low.

| # | Agent | Dimension | Checks |
|---|-------|-----------|--------|
| 1 | API Patterns | Component API consistency | forwardRef, displayName, prop spread, className/cn(), naming conventions, compound component compliance |
| 2 | CVA & Styling | Styling patterns | CVA usage on variant/size components, variant naming, Tailwind-only styling, no inline styles |
| 3 | Tokens & Dark Mode | Design token usage | Semantic token usage, hardcoded rgba/hex, dark mode coverage, CSS variable consistency |
| 4 | Accessibility | A11y compliance | ARIA roles/labels, keyboard nav, focus management, reduced-motion, contrast |
| 5 | Test Coverage | Testing quality | Missing tests, vitest-axe assertions, test quality, behavioral testing |
| 6 | Storybook Quality | Documentation | Missing stories, autodocs tags, variant/state coverage, interaction tests |
| 7 | Module & Exports | Architecture hygiene | Import rule violations, circular deps, missing type exports, index.ts completeness |
| 8 | TypeScript Quality | Type safety | `any` types, proper generics, strict mode, exported interfaces |

## Phase 2 — Industry Benchmarking (7 parallel agents)

Compare every component against equivalents from leading design systems:

**Benchmark sources**: Radix Themes, shadcn/ui, Material UI (MUI), Chakra UI, Ant Design, Mantine

Each agent covers a component group and produces:
- API gap analysis (missing props/features vs industry standard)
- Pattern comparison (monolithic vs compound, controlled vs uncontrolled)
- Feature parity (capabilities in 3+ DSs that we lack)
- Over-engineering flags (complexity beyond what major DSs do)

| # | Agent Group | Components |
|---|------------|------------|
| 1 | Core Primitives | Button, Input, Label, Checkbox, Radio, Switch, Select, Textarea, Slider, Toggle |
| 2 | Feedback & Overlays | Dialog, AlertDialog, Sheet, Toast, Tooltip, Popover, HoverCard, Alert, Banner, Spinner |
| 3 | Data Display | Card, Badge, Avatar, AvatarStack, Table, DataTable, Progress, Skeleton, StatCard, Code |
| 4 | Navigation | Tabs, Accordion, Breadcrumb, DropdownMenu, ContextMenu, Menubar, Pagination, NavigationMenu, Sidebar |
| 5 | Shared/Composed | DatePicker, CommandPalette, PageHeader, ContentCard, StatusBadge, EmptyState, RichTextEditor, FileUpload, Combobox, Autocomplete |
| 6 | Layout & Shell | TopBar, BottomNavbar, NotificationCenter, AppCommandPalette, AppSidebar, NotificationPreferences |
| 7 | Karm Domain | KanbanBoard, TaskDetailPanel, ChatPanel, AdminDashboard, DailyBrief, AccentProvider, ProjectCard, ClientPortalHeader |

## Phase 3 — Council Deliberation

4 expert agents debate combined Phase 1 + Phase 2 findings:

| Expert | Perspective |
|--------|------------|
| DS Architect | Structural consistency, API coherence, scalability |
| A11y Specialist | Accessibility gaps, WCAG compliance, inclusive patterns |
| DX Advocate | Developer experience, learnability, documentation quality |
| Brand Strategist | Visual identity preservation, differentiation from shadcn/generic |

**Output**: Verdict for each component — `Keep` / `Improve` / `Rewrite` — with reasoning that respects shilp-sutra's identity and strategic direction.

## Phase 4 — Full Component Spot-Check (ALL components)

Every component reviewed against complete CONTRIBUTING.md checklist:
- [ ] forwardRef with proper element type
- [ ] displayName set
- [ ] className prop via cn()
- [ ] Props spread (...props)
- [ ] CVA for variant/size components
- [ ] Exported prop types interface
- [ ] Unit test with vitest-axe
- [ ] Storybook story with autodocs

Agents split by module:
1. ui/ core (~20 components)
2. ui/ form controls (~15 components)
3. ui/ feedback & overlays (~15 components)
4. ui/ data display & navigation (~20 components)
5. shared/ (~13 components)
6. layout/ (~6 components)
7. karm/ (~43 components)

## Deliverable

Single comprehensive audit: `docs/audit/2026-03-03-design-system-consistency-audit.md`

Contents:
1. Executive summary with health score (1-10)
2. Per-dimension findings tables sorted by severity (Phase 1)
3. Industry benchmark comparison tables (Phase 2)
4. Council verdicts per component with reasoning (Phase 3)
5. Full component compliance matrix (Phase 4)
6. Prioritized remediation roadmap
