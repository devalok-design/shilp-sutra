# Shell, AI & Utilities Audit -- Phase 3, Groups M+N+O

**Phase:** 3m + 3n + 3o
**Auditor:** Claude
**Date:** 2026-04-12

## Group M — Shell: Overall Rating: Strong (Sidebar/CommandPalette excellent, Karm-specific code in DS)
## Group N — AI: Overall Rating: Strong (Impressive block plugin architecture, CommandBar is 903 lines)
## Group O — Utilities: Overall Rating: Strong (Clean hooks, solid composed components)

---

## GROUP M — SHELL

| Component | Score | Key Finding |
|-----------|-------|-------------|
| **Sidebar (ui)** | 8.6 | Excellent compound component (20+ parts). layoutId may conflict with multiple active items |
| **AppSidebar** | 8.3 | Rich props-driven nav. Inline SVGs should use Icon component |
| **TopBar** | 8.1 | Good compound pattern. hasCenter detection breaks with wrapped children |
| **BottomNavbar** | 8.2 | Purpose-built mobile. Unused `user` prop. No focus restore on overlay close |
| **AppCommandPalette** | 7.9 | **Karm-specific routes hardcoded** (buildDefaultPageItems, computeFallbackRoute) |
| **CommandRegistry** | 8.4 | Clean context+provider pattern |
| **NotificationCenter** | 8.2 | Rich features. **No mobile adaptation** (380px popover overflows) |
| **NotificationPreferences** | 7.5 | Hardcoded channel types (IN_APP, GOOGLE_CHAT) |
| **CommandPalette** | 8.6 | Gold standard. Excellent ARIA, stagger animations, configurable keybindings |

### Critical: Karm-Specific Code in DS
`AppCommandPalette` hardcodes Karm routes (Dashboard, Attendance, Breaks, Devsabha, Admin, Lokwasi, Onboarding) and URL patterns (`/projects/${id}`, `/teammates`). These belong in the consumer app.
**Priority:** P0 | **Effort:** M

---

## GROUP N — AI

| Component | Score | Key Finding |
|-----------|-------|-------------|
| **AIConversation** | 8.3 | aria-live, processing steps, IntersectionObserver auto-scroll. Good. |
| **CommandBar** | 8.2 | Three variants (hero/inline/floating). 903 lines. Gradient uses hardcoded hex. |
| **AICommandProvider** | 8.4 | Clean context. Stable empty refs. |
| **BlockRenderer** | 8.4 | Plugin architecture: built-in → context → prop priority chain. FallbackBlock for unknowns. |
| **DevadootIcon** | 7.9 | Premium animation (gradient breathing, glow pulse). All colors hardcoded (brand-specific, acceptable). |
| **AI Blocks (9)** | 8.2 avg | All have tests. All respect useMotion() reduced motion. SuccessBlock undo countdown is excellent. |

### Block Extensibility: Well-Designed
`customBlocks` with instance → context → built-in priority. Unknown types get FallbackBlock (no crash, shows JSON). `BlockComponentProps<T>` generic allows typed block data.

### Gap: No StreamingTextBlock
TextBlock renders full content at once. Consumer must manage incremental string for streaming AI responses.
**Priority:** P2 | **Effort:** M

---

## GROUP O — UTILITIES & COMPOSED

### Hooks (all Strong)
| Hook | Score | Notes |
|------|-------|-------|
| useColorMode | 8.0 | light/dark/system, localStorage+cookie, SSR guard |
| useIsMobile | 8.2 | MediaQuery-based, SSR-safe |
| useToast | 8.7 | Deprecated re-export (clean migration) |
| useTouchDevice | 8.0 | ontouchstart + maxTouchPoints |
| useViewportHeight | 8.2 | Visual Viewport API with fallback |

### Composed Components
| Component | Score | Key Finding |
|-----------|-------|-------------|
| **VisuallyHidden** | 9.2 | @server-safe. Perfect. |
| **DevalokGrain** | 8.4 | Creative noise texture. Inline oklch (not tokenized). |
| **EmptyState** | 8.2 | **Floating icon animation ignores useReducedMotion()** |
| **ErrorBoundary** | 8.5 | Class component (correct). Status code detection. |
| **PageHeader** | 8.9 | @server-safe. Breadcrumbs use raw `<a>` (can't use useLink in server component). |
| **PageSkeletons** | 7.9 | **Karm-specific layouts** (dashboard, project list, task detail). Should be in consumer. |
| **BulkActionBar** | 8.5 | Excellent ARIA toolbar with roving tabindex. |
| **MultiSelectPopover** | 8.2 | Missing role="listbox"/role="option" on items container. |
| **ContentCard** | 8.9 | @server-safe. Clean CVA variants. |
| **ScheduleView** | 8.0 | Day/week view. Fixed 480px height. Week cramped on mobile. |
| **StatusBadge** | 8.5 | AnimatePresence morph on status change. |
| **ActivityFeed** | 8.2 | Timeline dots, groupBy time, renderItem override. |

---

## ALL FINDINGS (Priority Order)

### P0

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 1 | **Karm-specific routes hardcoded** in AppCommandPalette | AppCommandPalette | M |

### P1

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 2 | NotificationCenter no mobile adaptation (380px popover) | NotificationCenter | M |
| 3 | EmptyState floating icon ignores useReducedMotion() | EmptyState | S |
| 4 | MultiSelectPopover items missing role="listbox"/role="option" | MultiSelectPopover | S |
| 5 | Hardcoded channel types (IN_APP, GOOGLE_CHAT) | NotificationPreferences | S |

### P2

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 6 | PageSkeletons are Karm-specific layouts | PageSkeletons | S |
| 7 | CommandBar gradient uses hardcoded hex colors | CommandBar | M |
| 8 | CommandBar/CommandPalette filtering logic duplicated | CommandBar | L |
| 9 | TopBar hasCenter detection breaks with wrapped children | TopBar | S |
| 10 | No StreamingTextBlock for incremental AI responses | AI blocks | M |

### P3

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 11 | Sidebar layoutId may conflict with multiple active items | Sidebar | S |
| 12 | BottomNavbar user prop unused | BottomNavbar | S |
| 13 | AppSidebar inline SVGs instead of Icon component | AppSidebar | S |
| 14 | DevadootIcon brand colors not tokenized | DevadootIcon | S |
| 15 | PageHeader breadcrumbs use raw `<a>` tags | PageHeader | S |

## Cross-Group Composition: Good
LinkContext correctly shared. Module boundaries respected. Shell components compose naturally (SidebarProvider → Sidebar + TopBar + BottomNavbar + CommandPalette). No AppShell wrapper exists but composition is clean enough.

## Top 3 Actions

1. **P0 — Remove Karm-specific code from AppCommandPalette** (M effort): Extract routes to consumer, use CommandRegistryProvider exclusively.
2. **P1 — Add mobile adaptation to NotificationCenter** (M effort): Switch to Sheet/bottom-drawer on mobile.
3. **P1 — Fix EmptyState reduced motion violation** (S effort): Add useReducedMotion() check on floating icon animation.
