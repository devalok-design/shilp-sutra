# AI-Readable Component Reference (llms.txt) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `llms.txt` and `llms-full.txt` files that ship with the @devalok/shilp-sutra npm package, enabling AI agents to use components correctly on first attempt.

**Architecture:** Two static text files in `packages/core/` — a concise cheatsheet (~200 lines) and an exhaustive reference (~800+ lines). Added to package.json `files` array. No runtime code changes. Karm's CLAUDE.md gets a one-liner pointing to the files.

**Tech Stack:** Plain text (Markdown-flavored), pnpm, npm publish

**Test command:** `pnpm build` (verify files are included in dist)

---

## Task 1: Create `llms.txt` — Concise AI Cheatsheet

**Files:**
- Create: `packages/core/llms.txt`

**Step 1: Create the file**

```text
# @devalok/shilp-sutra

> Radix UI + Tailwind CSS + CVA design system for Devalok apps.
> Built on the same primitives as shadcn/ui but with key API differences.
> Read this file BEFORE writing any UI code. Do NOT guess from shadcn/ui knowledge.

## Install & Setup

pnpm add @devalok/shilp-sutra

// Import components (barrel):
import { Button, Card, Dialog } from '@devalok/shilp-sutra'

// Import per-component (recommended for Server Components):
import { Button } from '@devalok/shilp-sutra/ui/button'
import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'
import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'

// Hooks:
import { useToast } from '@devalok/shilp-sutra/hooks/use-toast'
import { useColorMode } from '@devalok/shilp-sutra/hooks/use-color-mode'

// CSS tokens (import once at app root):
import '@devalok/shilp-sutra/tokens'

// Tailwind preset (in tailwind.config):
import shilpSutra from '@devalok/shilp-sutra/tailwind'

## CRITICAL: Differences from shadcn/ui

If you have shadcn/ui knowledge, these are the differences that WILL trip you up:

| shadcn/ui pattern | shilp-sutra equivalent | Notes |
|---|---|---|
| variant="destructive" | color="error" | Two-axis system: variant=shape, color=intent |
| size="default" | size="md" | All sizes: sm, md, lg (never "default") |
| <Select size="lg"> | <SelectTrigger size="lg"> | Size goes on trigger, NOT root |
| <Chip>text</Chip> | <Chip label="text" /> | Chip uses label prop, NOT children |
| Toast variant="destructive" | Toast color="error" | Toast uses color= not variant= |
| Badge variant="destructive" | Badge variant="solid" color="error" | Two-axis: variant + color |
| Alert + AlertTitle + AlertDescription | <Alert title="..." color="error"> | Single component, not compound |
| Form + FormField + FormItem + FormLabel + FormControl + FormDescription + FormMessage | FormField + Label + Input + FormHelperText + getFormFieldA11y() | Simpler API, manual a11y wiring |
| Pagination | PaginationRoot | Root component name differs |

### The Two-Axis Variant System

Many components use TWO props where shadcn uses one:
- `variant` controls SHAPE/SURFACE: solid, outline, ghost, subtle, filled, etc.
- `color` controls INTENT/SEMANTICS: default, error, success, warning, info, etc.

Examples:
  <Button variant="solid" color="error">Delete</Button>     // red solid button
  <Button variant="outline" color="error">Cancel</Button>    // red outline button
  <Badge variant="solid" color="success">Active</Badge>      // green solid badge
  <Alert variant="filled" color="warning">Warning!</Alert>   // yellow filled alert

Components with two-axis system: Button, Badge, Alert, Chip, Toast, Banner, Progress, StatusBadge

## Component Quick Reference

### Inputs & Controls
- Button: variant(solid|default|outline|ghost|link) color(default|error) size(sm|md|lg|icon) + loading, startIcon, endIcon, asChild
- IconButton: icon(ReactNode, required) shape(square|circle) size(sm|md|lg) + aria-label required
- Input: size(sm|md|lg) state(default|error|warning|success) + startIcon, endIcon
- SearchInput: size(sm|md|lg) + loading, onClear
- NumberInput: value + onValueChange, min, max, step (controlled only)
- Textarea: size(sm|md|lg) state(default|error|warning|success)
- Checkbox: checked, onCheckedChange, error(boolean), indeterminate(boolean)
- Switch: checked, onCheckedChange, error(boolean)
- RadioGroup > RadioGroupItem(value)
- Select > SelectTrigger(size) > SelectValue; SelectContent > SelectItem(value)
- Toggle: variant(default|outline) size(sm|md|lg)
- ToggleGroup > ToggleGroupItem (variant/size propagate from root)
- SegmentedControl > SegmentedControlItem: variant(filled|tonal) size(sm|md|lg)
- Slider: standard Radix slider

### Feedback & Notifications
- Alert: variant(subtle|filled|outline) color(info|success|warning|error|neutral) + title, onDismiss
- Banner: color(info|success|warning|error|neutral) + title, onDismiss
- Toast: color(neutral|success|warning|error|info) — REQUIRES <Toaster> at layout root + useToast()
- Spinner: size(sm|md|lg) — renders with role="status"
- Progress: track size(sm|md|lg), indicator color(default|success|warning|error)

NOTIFICATION SELECTION GUIDE:
  - Alert: inline contextual feedback within a form or page section
  - Banner: persistent page-level notification above content
  - Toast: transient notification triggered by user action (needs Toaster + useToast)

### Data Display
- Badge: variant(subtle|solid|outline) color(default|info|success|error|warning|brand|accent + 7 category colors) size(sm|md|lg) + onDismiss
- Chip: variant(subtle|outline) color(default|primary|success|error|warning|info + 7 category) size(sm|md|lg) label(string, REQUIRED) + onDismiss, onClick
- Avatar: size(xs|sm|md|lg|xl) shape(circle|square|rounded) status(online|offline|busy|away) > AvatarImage + AvatarFallback
- Card: variant(default|elevated|outline|flat) interactive(boolean) > CardHeader > CardTitle, CardDescription; CardContent; CardFooter
- Table > TableHeader > TableRow > TableHead; TableBody > TableRow > TableCell; TableFooter; TableCaption
- Text: variant(heading-2xl|heading-xl|heading-lg|heading-md|heading-sm|heading-xs|body-lg|body-md|body-sm|body-xs|label-lg|label-md|label-sm|label-xs|caption|overline) as(element)
- Code: variant(inline|block)
- Skeleton: variant(rectangle|circle|text) animation(pulse|shimmer|none)
- StatCard: title, value, description, trend, icon

### Overlays
- Dialog > DialogTrigger; DialogContent > DialogHeader > DialogTitle, DialogDescription; [content]; DialogFooter
- AlertDialog > AlertDialogTrigger; AlertDialogContent > AlertDialogHeader > AlertDialogTitle; AlertDialogFooter > AlertDialogCancel, AlertDialogAction
- Sheet: side(top|bottom|left|right) > SheetTrigger; SheetContent > SheetHeader > SheetTitle; [content]; SheetFooter
- Popover > PopoverTrigger; PopoverContent
- Tooltip: requires <TooltipProvider> at layout root > Tooltip > TooltipTrigger; TooltipContent
- HoverCard > HoverCardTrigger; HoverCardContent
- Collapsible > CollapsibleTrigger; CollapsibleContent

### Navigation
- Tabs > TabsList(variant: line|contained) > TabsTrigger(value); TabsContent(value) — variant propagates via context
- Accordion(type: single|multiple) > AccordionItem(value) > AccordionTrigger; AccordionContent
- Breadcrumb > BreadcrumbList > BreadcrumbItem > BreadcrumbLink | BreadcrumbPage; BreadcrumbSeparator
- PaginationRoot > PaginationContent > PaginationItem > PaginationLink(isActive) | PaginationPrevious | PaginationNext | PaginationEllipsis
- DropdownMenu > DropdownMenuTrigger; DropdownMenuContent > DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup > DropdownMenuRadioItem
- ContextMenu > ContextMenuTrigger (right-click); ContextMenuContent > same sub-components as DropdownMenu
- Menubar > MenubarMenu > MenubarTrigger; MenubarContent > same sub-components
- NavigationMenu > NavigationMenuList > NavigationMenuItem > NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink

### Layout
- Stack: direction(vertical|horizontal) gap(SpacingToken|number) align, justify, wrap
- Container: maxWidth(default|body|full)
- Separator: orientation(horizontal|vertical)
- Sidebar: complex — see llms-full.txt for complete tree

### Form Pattern
- FormField: state(helper|error|warning|success) > Label + Input + FormHelperText
- Wire accessibility manually: <Input {...getFormFieldA11y(helperTextId, state)} />
- getFormFieldA11y returns { aria-describedby, aria-invalid }

### Composed Components
- PageHeader: title, subtitle, breadcrumbs[], actions(ReactNode)
- AvatarGroup: users[], max(number), size(sm|md|lg), showTooltip
- StatusBadge: status(active|pending|approved|rejected|completed|blocked|cancelled|draft) color(success|warning|error|info|neutral) size(sm|md)
- ContentCard: variant(default|outline|ghost) padding(default|compact|spacious|none)
- EmptyState: icon, title(required), description, action(ReactNode), compact
- PriorityIndicator: priority(LOW|MEDIUM|HIGH|URGENT) display(compact|full)
- SimpleTooltip: wraps Tooltip compound into single component
- DatePicker, DateRangePicker, DateTimePicker, TimePicker
- RichTextEditor, RichTextViewer
- CommandPalette, MemberPicker
- ErrorDisplay, GlobalLoading
- Loading skeletons: CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton, DashboardSkeleton, etc.

### Shell Components (app-level layout)
- TopBar: pageTitle, user, onNavigate, onLogout, notificationSlot, mobileLogo
- AppSidebar: navigation tree with NavItem[], NavGroup[]
- BottomNavbar: mobile navigation
- NotificationCenter: notifications[], onDismiss, onRead
- AppCommandPalette: search results, user info

### Hooks
- useToast(): returns { toast, toasts, dismiss } — toast({ title, description, color })
- useColorMode(): returns { colorMode, setColorMode, toggleColorMode }
- useMobile(): returns boolean (true if viewport < 768px)

## Server-Safe Components (no "use client")

These can be imported directly in Next.js Server Components:
- UI: Text, Skeleton, Spinner, Stack, Container, Table (and sub-components), Code, VisuallyHidden
- Composed: ContentCard, EmptyState, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator, StatusBadge

Use per-component imports for server components:
  import { Text } from '@devalok/shilp-sutra/ui/text'
  import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'

DO NOT use barrel imports in Server Components — they include "use client" components.

## Common Mistakes -- DO NOT

- DO NOT use variant="destructive" — use color="error"
- DO NOT use size="default" — use size="md" (or sm, lg)
- DO NOT put size on <Select> — put it on <SelectTrigger size="md">
- DO NOT use <Chip>text</Chip> — use <Chip label="text" />
- DO NOT use <Toast variant="..."> — use <Toast color="error">
- DO NOT use color="danger" — use color="error"
- DO NOT call toast() without <Toaster /> mounted at your layout root
- DO NOT use <Alert><AlertTitle>...</AlertTitle></Alert> — use <Alert title="..." />
- DO NOT import from barrel in Next.js Server Components — use per-component imports
- DO NOT use variant="secondary" on Button — use variant="outline" or variant="ghost"
- DO NOT put variant on individual TabsTrigger — put it on TabsList (propagates via context)
```

**Step 2: Commit**

```bash
git add packages/core/llms.txt
git commit -m "docs: add llms.txt AI-readable component cheatsheet"
```

---

## Task 2: Create `llms-full.txt` — Exhaustive Component Reference

**Files:**
- Create: `packages/core/llms-full.txt`

**Step 1: Create the file**

This file contains the full per-component reference. It is long (~800-1000 lines) and organized alphabetically. Each component entry follows this format:

```
## ComponentName
- Import: @devalok/shilp-sutra/ui/component-name
- Server-safe: Yes/No
- Props: [full prop list with types and valid values]
- Defaults: [default values]
- Compound: [sub-component tree if applicable]
- Example: [correct usage code]
- Gotchas: [common mistakes specific to this component]
```

The file must include ALL of the following components with their full verified details from the CVA/props research:

**UI (alphabetical):** Accordion, Alert, AlertDialog, AspectRatio, Autocomplete, Avatar, Badge, Banner, Breadcrumb, Button, ButtonGroup, Card, Checkbox, Chip, Code, Collapsible, Combobox, Container, ContextMenu, DataTable, DataTableToolbar, Dialog, DropdownMenu, FileUpload, FormField, FormHelperText, HoverCard, IconButton, Input, InputOTP, Label, Link, Menubar, NavigationMenu, NumberInput, Pagination, Popover, Progress, RadioGroup, ScrollArea, SearchInput, SegmentedControl, Select, Separator, Sheet, Sidebar (full tree), Skeleton, Slider, Spinner, Stack, StatCard, Stepper, Switch, Table, Tabs, Text, Textarea, Toast/Toaster, Toggle, ToggleGroup, Tooltip, Transitions, TreeView, VisuallyHidden

**Composed:** AvatarGroup, CommandPalette, ContentCard, DatePicker, DateRangePicker, DateTimePicker, EmptyState, ErrorDisplay, GlobalLoading, LoadingSkeleton (+ page skeletons), MemberPicker, PageHeader, PriorityIndicator, RichTextEditor, RichTextViewer, ScheduleView, SimpleTooltip, StatusBadge

**Shell:** AppCommandPalette, AppSidebar, BottomNavbar, NotificationCenter, NotificationPreferences, TopBar

**Hooks:** useToast, useColorMode, useMobile

For each component, verify the actual prop types and variant values from the CVA definitions and Props interfaces gathered in the research phase. DO NOT guess — use the exact values from the codebase.

The full content is too long to inline here. The implementing agent should:
1. Read `packages/core/llms.txt` for the concise format and data
2. Read each component's source file to verify props
3. Write one entry per component following the format above
4. Cross-reference against the CVA variant data from the design doc

**Step 2: Commit**

```bash
git add packages/core/llms-full.txt
git commit -m "docs: add llms-full.txt exhaustive AI component reference"
```

---

## Task 3: Add files to package.json for npm publishing

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Read current package.json**

Find the `"files"` array in `packages/core/package.json`.

**Step 2: Add llms.txt and llms-full.txt**

Add both files to the `"files"` array so they ship with `npm publish`:

```json
"files": [
  "dist",
  "llms.txt",
  "llms-full.txt",
  ... (existing entries)
]
```

**Step 3: Verify build includes files**

```bash
cd packages/core
pnpm build
pnpm pack --dry-run
```

Expected: `llms.txt` and `llms-full.txt` appear in the pack output.

**Step 4: Commit**

```bash
git add packages/core/package.json
git commit -m "chore: include llms.txt and llms-full.txt in npm package files"
```

---

## Task 4: Verify end-to-end

**Step 1: Run full build**

```bash
pnpm build
```

Expected: Clean build, no errors.

**Step 2: Verify pack contents**

```bash
cd packages/core
pnpm pack --dry-run 2>&1 | grep llms
```

Expected: Both `llms.txt` and `llms-full.txt` listed.

**Step 3: Spot-check llms.txt accuracy**

Read `packages/core/llms.txt` and verify at least these claims against source:
- Button defaults: variant=solid, color=default, size=md
- Toast uses `color` not `variant`
- Chip requires `label` prop
- SelectTrigger has `size`, Select does not
- Server-safe list matches inject-use-client.mjs exclusions

**Step 4: Commit all together if any fixes were needed**

```bash
git add -A
git commit -m "docs: finalize llms.txt accuracy after verification"
```

---

## Verification Checklist

After completing all tasks:

```bash
# 1. Build must succeed
pnpm build

# 2. Files must be in pack
cd packages/core && pnpm pack --dry-run | grep llms

# 3. Typecheck (no changes to TS, but sanity check)
pnpm typecheck

# 4. Tests still pass
pnpm test --run
```
