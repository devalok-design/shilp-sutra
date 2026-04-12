# Phase 4: Cross-Cutting Analysis

**Phase:** 4
**Auditor:** Claude
**Date:** 2026-04-12

This analysis synthesizes findings from all 22 Phase 1-3 reports, identifying systemic patterns that no single report could surface.

---

## 4a: Naming Consistency Across CVA Components

### Variant Axis Names

| Axis | Standard Name | Components Using It | Deviations |
|------|--------------|-------------------|------------|
| Visual style | `variant` | Button, Select, Badge, Alert, Card, Input, Tabs, Toggle | SegmentedControl uses `variant` with values `default/accent` (not the standard vocabulary) |
| Color | `color` | Button, Select, Badge, Card, Alert, Banner | Toggle, ToggleGroup, SegmentedControl, Link, Checkbox, Radio, Slider -- **all missing color axis entirely** |
| Size | `size` | Button, Input, Select, Badge, Avatar, Icon, Checkbox, Radio | Combobox, Autocomplete, NumberInput, Slider, InputOTP, Breadcrumb, Pagination, NavigationMenu -- **all missing size axis** |

### Variant Value Vocabulary

**`variant` values across components (inconsistencies bolded):**

| Component | variant values |
|-----------|---------------|
| Button | solid, soft, outline, ghost, link |
| SplitButton | solid, soft, outline (**missing ghost, link**) |
| Select | outline, filled, ghost (**`filled` = Button's `solid`? different name, similar role**) |
| Toggle | default, outline (**`default` is ambiguous**) |
| Alert | soft, outline, filled (**`filled` = Button's `solid`?**) |
| Badge | soft, solid, outline, dot |
| Card | elevated, outlined, filled, ghost |
| Tabs | underline, pill, **default** |

The word "filled" appears in Select, Alert, Card. The word "solid" appears in Button, Badge. These mean the same thing but use different names. `default` appears in Toggle, Tabs, SegmentedControl as a variant value and is semantically empty.

**`color` value vocabulary (consistent where present):**

Button, Select, Badge, Alert, Banner all share: `accent`, `error`, `success`, `warning`, `neutral`. Badge extends with 8 additional category colors. Card adds `info`. This core-5 vocabulary is well-standardized.

**`size` value vocabulary:**

Consistently `xs | sm | md | lg` where present. Some components add `xl` (Spinner). IconButton has only `sm | md | lg` (missing `xs`). Badge uses `sm | md | lg` (no `xs`). This is acceptable variation by component role.

### Event Handler & Boolean Prop Naming

No systemic issues found. Standard React conventions used: `onOpenChange`, `onValueChange`, `onSelect`. Boolean props consistently use adjective form: `disabled`, `required`, `asChild`, `closable`, `dismissible`.

Two deviations worth noting:
- `removable` (Badge) vs `dismissible` (Alert, Toast, Banner) -- same concept, different words
- `loading` (Button) vs `isProcessing` (ButtonProcessing) -- prefix inconsistency

### Summary

| Issue | Severity | Impact |
|-------|----------|--------|
| `solid` vs `filled` for same visual style | P1 | Consumers must remember which word each component uses |
| 12+ components missing `color` axis | P1 | Can't use error/warning toggles, checkboxes, sliders |
| 9+ components missing `size` axis | P0 (form) / P2 (nav) | Can't build visually consistent form rows |
| `default` as variant value | P3 | Semantically empty, works but confusing |

---

## 4b: Composition Patterns

### asChild Support

| Pattern | Components | Notes |
|---------|-----------|-------|
| `asChild` via Radix Slot | Button, Link, NavigationMenu, DropdownMenuItem, etc. | Correct Radix pattern |
| No `asChild` | Card, Alert, Banner, Badge | These are containers, not interactive -- correct exclusion |
| Missing `asChild` | IconButton | Would be useful for icon-as-link pattern |

asChild is consistently applied to interactive elements. No issues.

### Compound Component Patterns

**Three patterns coexist:**

1. **Radix-style dot-notation:** `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content` -- used by all overlay components, Tabs, Accordion, Select
2. **Context-based composition:** `SidebarProvider` + `Sidebar` + `SidebarContent` etc. -- used by Shell, Form, DataTable
3. **Props-only monolithic:** `CommandBar`, `AIConversation`, `RichChatInput` -- 800+ line components that should arguably be compound

Pattern 1 and 2 are well-applied. Pattern 3 is the concern -- `CommandBar` (903 lines), `RichChatInput` (850 lines), `DataTable` (complex enough to warrant decomposition) resist composition.

### Context Usage

17 components use React context. All correctly:
- Provide default values
- Export typed hooks (`useSidebar()`, `useFormField()`, `useCommandRegistry()`)
- Throw meaningful errors when used outside provider

One gap: `MotionProvider` context is opt-in but critical for reduced-motion. Components that consume it work without it but lose accessibility guarantees.

---

## 4c: Form Integration (useFormField Adoption Gap)

This is the most impactful cross-cutting finding. `useFormField()` provides ARIA wiring (aria-describedby for errors, aria-invalid, etc.) but adoption is incomplete:

| Component | Consumes useFormField? | Impact |
|-----------|----------------------|--------|
| Input | Yes | Correct |
| Textarea | Yes | Correct |
| NumberInput | Yes | Correct |
| SearchInput | Partial (no state) | Validation states not forwarded |
| **Select** | **NO** | **Wrapping in FormField shows error text but no ARIA link** |
| **Combobox** | **NO** | **Same gap** |
| **Autocomplete** | **NO** | **Same gap** |
| **DatePicker** | **NO** | **Same gap** |
| **DateRangePicker** | **NO** | **Same gap** |
| **TimePicker** | **NO** | **Same gap** |
| **RichTextEditor** | **NO** | **Same gap** |
| **Slider** | **NO** | **Same gap** |
| **Switch** | **NO** | **Same gap -- Switch often needs error state in forms** |
| **Checkbox** | **NO** | **Same gap** |
| **Radio** | **NO** | **Same gap** |
| ColorInput | Partial | Has own error state but not wired to FormField |
| InputOTP | Partial | Similar |

**12 form controls are completely disconnected from the form infrastructure.** When a consumer wraps `<Select>` in `<FormField state="error">`, the error message appears visually but screen readers cannot associate it with the select trigger. This is an accessibility violation (WCAG 1.3.1 Info and Relationships).

**Priority:** P0 | **Effort:** L (12 components need context consumption wired in)

---

## 4d: Error State Handling Patterns

**Three different error state mechanisms coexist:**

1. **CVA `state` variant:** Input, Textarea, Select use `state="error"` which changes border color to red. Well-implemented where present.
2. **FormField context propagation:** FormField wraps children and provides error state via context. Only works for components that consume `useFormField()`.
3. **No error state at all:** NumberInput, Slider, Combobox, Autocomplete, InputOTP have no visual error indication mechanism.

**Components with no error state support:**

| Component | Has `state` prop? | Consumes FormField? | Result |
|-----------|------------------|---------------------|--------|
| NumberInput | No | Yes (but no visual) | No way to show error |
| Slider | No | No | No way to show error |
| Combobox | No | No | No way to show error |
| Autocomplete | No | No | No way to show error |
| InputOTP | No | Partial | Limited error feedback |

**Error messaging pattern:** Consistent where implemented -- red border + red helper text below input. `error-9` token used uniformly.

**Priority:** P0 (for form inputs without any error mechanism) | **Effort:** M

---

## 4e: Loading State Patterns

**Four different loading patterns exist:**

| Pattern | Components | Implementation |
|---------|-----------|----------------|
| `loading` boolean prop | Button (with ButtonProcessing animation) | Most sophisticated -- disables, shows spinner, icon swap |
| `isLoading` prop | DataTable | Shows skeleton rows |
| Skeleton replacement | LoadingSkeleton, PageSkeletons | Full component swap |
| No loading state | Select, Combobox, TreeView, Charts | Consumer must implement |

**Inconsistency:** Button uses `loading`, DataTable uses `isLoading`. The `is` prefix is non-standard for React (React convention: bare adjective).

**Async feedback pattern:** Button has a complete state machine (idle -> loading -> success/error -> idle) with animated transitions. No other interactive component has this. SplitButton, which often triggers async operations, has no loading state at all.

**Missing loading states (most impactful):**
- Combobox (async search results -- very common pattern)
- Select (loading options)
- TreeView (loading children on expand)

**Priority:** P1 | **Effort:** M per component

---

## 4f: Token Discipline (Hardcoded Value Summary)

Aggregated hardcoded value findings from all 22 reports:

### Spacing (from 01c + component reports)

| Component(s) | Hardcoded Values | Should Be |
|-------------|-----------------|-----------|
| Button (all variants) | `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `-ml-0.5`, `-mr-1` | `gap-ds-01`, `gap-ds-02`, `gap-ds-02b` etc. |
| Badge (all variants) | `px-1.5`, `px-2`, `px-2.5`, `px-3`, `gap-1`, `gap-1.5` | DS spacing tokens |
| Toast, SplitButton, BadgeGroup, IconGroup | Mixed Tailwind defaults | DS spacing tokens |
| AI blocks (9 components) | `gap-3`, `gap-2`, `mt-2`, `mb-1` | DS spacing tokens |
| Sidebar | Various Tailwind defaults | DS spacing tokens |
| **Total**: ~146 occurrences in 57 files | | |

### Typography (from 03p)

| Component | Hardcoded Values | Should Be |
|-----------|-----------------|-----------|
| Message | `text-[13px]`, `text-[11px]` | `text-ds-xs`, `text-ds-sm` |
| Various chat components | Raw px sizes | DS type scale |

### Colors (from 03m, 03n)

| Component | Hardcoded Values | Should Be |
|-----------|-----------------|-----------|
| CommandBar gradient | Hardcoded hex colors | Semantic color tokens |
| DevalokIcon | Hardcoded oklch brand colors | Acceptable (brand-specific) |
| DevalokGrain | Inline oklch | Semantic tokens |

### Sizing (from 03h, 03j)

| Component | Hardcoded Values | Should Be |
|-----------|-----------------|-----------|
| TreeView | `paddingLeft: depth * 20 + 8` px | DS spacing tokens |
| MasterDetail | `masterWidth='280px'` | DS tokens or named presets |
| NotificationCenter | `380px` popover width | Named constant or token |
| ScheduleView | `480px` fixed height | Responsive token |

### Z-Index (from 01f)

| Component | Hardcoded Values | Should Be |
|-----------|-----------------|-----------|
| data-table-bulk-actions.tsx | `z-50` | `z-sticky` or `z-modal` |
| bulk-action-bar.tsx | `z-50` | `z-sticky` |
| image-preview.tsx | `z-50` | `z-modal` |

### Motion (from 01e)

50+ instances of inline `transition={{ duration: X }}` and hardcoded spring configs (`stiffness: 500, damping: 30`) instead of using preset references from `motion.ts`.

### Overall Token Discipline Score

- **Spacing:** 89% adoption (strong, but violations in foundational components)
- **Colors:** ~97% adoption (excellent)
- **Border radius:** ~99% adoption (world-class)
- **Typography:** ~95% adoption (good, chat components are the gap)
- **Z-index:** ~95% adoption (3 violations)
- **Motion:** ~60% adoption (significant drift from centralized presets)
- **Sizing:** ~90% adoption (good)

---

## 4g: Density Modes

**Rating:** Not Implemented

No density mode system exists. No `compact` / `comfortable` / `spacious` toggle. No CSS custom property indirection that would allow per-density spacing adjustment.

**Evidence of need:**
- 01c identified that the same spacing tokens are used for component internals and page layout, making global density adjustment impossible
- Multiple components have ad-hoc compact variants: DataTable has compact row sizing, StatCard needs a `size` axis, Pagination needs `compact` variant
- The `xs` size on Button/Input serves as a de facto compact mode, but there is no system-wide density switch

**World-class standard:**
- Material Design 3: Explicit density system with -1, 0, +1 density multipliers
- Carbon: "Productive" vs "Expressive" modes affecting spacing globally

**Priority:** P2 (layout spacing tokens from 01c are the prerequisite) | **Effort:** L

---

## 4h: Focus Management

### Focus Ring Consistency

**Three focus ring patterns coexist:**

| Pattern | Components | Implementation |
|---------|-----------|----------------|
| `focus-ring` utility class | Most interactive components | `ring-2 ring-accent-9 ring-offset-2 ring-offset-surface-base` |
| `focus-ring-inset` | SplitButton, DataTable cells | `ring-2 ring-inset ring-accent-9` (no offset) |
| Custom focus styles | Link (missing offset), NavigationMenu (custom) | Inconsistent |

Link is missing `ring-offset-2`, which means the focus ring clips against text. This is a P1 bug.

### Focus Restoration

**Correct:** Dialog, AlertDialog, Sheet, CommandPalette all correctly restore focus to the trigger element on close (Radix handles this).

**Incorrect/Missing:**
- BottomNavbar: No focus restore on overlay close (03m finding)
- Popover mobile mode: Falls back to BottomSheet which may not restore focus correctly
- DropdownMenu: Relies on Radix default but no explicit test for focus restoration

### Focus Trap Stacking

**Scenario:** Dialog open -> opens another Dialog (nested) -> inner dialog closes

Radix handles this correctly via its own stacking context. No custom focus trap code exists. All overlay components use Radix primitives which manage trap stacking. **This is correct and well-implemented.**

### Focus Visible vs Focus

All components correctly use `focus-visible:` (via the focus-ring utility) rather than `focus:`, meaning mouse clicks don't show focus rings. One exception: some custom implementations in NavigationMenu use `focus:` directly.

### Keyboard Navigation Gaps (aggregated)

| Component | Gap | Priority |
|-----------|-----|----------|
| TimePicker | No arrow key nav within columns (must tab through 60 buttons) | P1 |
| RichTextEditor toolbar | No roving tabindex (20+ tab stops) | P1 |
| Stepper | Steps not focusable/clickable at all | P1 |
| Tabs | No vertical orientation (ArrowUp/Down) | P1 |
| DropdownMenu | No functional keyboard tests | P1 |
| Slider | Missing keyboard increment tests | P2 |
| ToggleGroup | Missing keyboard roving tabindex test | P2 |
| Charts | Mouse-only tooltips, no keyboard access | P1 |
| Chat Message actions | Hover-only toolbar, invisible to keyboard | P0 |

---

## Summary: Cross-Cutting Priority Matrix

| Area | Rating | Top Priority | Effort |
|------|--------|-------------|--------|
| 4a Naming consistency | Adequate | P1 (solid vs filled, missing axes) | M |
| 4b Composition patterns | Strong | P3 (monolithic components) | L |
| 4c Form integration | **Gap** | **P0** (12 components disconnected) | L |
| 4d Error state handling | **Gap** | **P0** (5 form inputs have no error mechanism) | M |
| 4e Loading state patterns | Adequate | P1 (async Combobox, SplitButton) | M |
| 4f Token discipline | Adequate | P0 (Button/Badge foundational violations) | M |
| 4g Density modes | Not Implemented | P2 (prerequisite: layout spacing) | L |
| 4h Focus management | Adequate | P1 (TimePicker, RTE toolbar, Stepper, Charts) | M-L |
