# Design: AI-Readable Component Reference (llms.txt)

**Date:** 2026-03-07
**Purpose:** Enable AI coding agents to use @devalok/shilp-sutra correctly by providing machine-readable component documentation that ships with the npm package.

---

## Problem

AI agents (Claude, Cursor, Copilot) building apps with @devalok/shilp-sutra consistently produce incorrect code because:

1. **No context available** — Karm's CLAUDE.md has zero shilp-sutra guidance
2. **Pattern-matching from shadcn/ui** — AI defaults to shadcn conventions from training data
3. **Garbage-in-garbage-out** — existing AI-generated Karm code has the same mistakes, so AI copies them
4. **Silent failures** — many wrong usages (e.g., `size` on Select root, `children` on Chip) produce no TypeScript error

Common AI mistakes:
- Uses `variant="destructive"` instead of `color="error"`
- Uses `size="default"` instead of `size="md"`
- Puts `size` on `<Select>` instead of `<SelectTrigger>`
- Uses `<Chip>text</Chip>` instead of `<Chip label="text" />`
- Generates `<Toast variant="destructive">` (doesn't exist)
- Misses `<Toaster>` mount + `useToast()` setup for toast notifications
- Doesn't know about the two-axis variant system (variant + color)
- Doesn't know which components are server-safe

## Solution

Create two reference files that ship with the npm package:

### `llms.txt` (~200 lines)
Concise cheatsheet for AI context windows. Contains:
1. Package overview and import patterns
2. **"If you know shadcn/ui" translation table** — the critical differences
3. Component quick reference — one-liner per component with key props and valid values
4. Common mistakes (DO NOT list)

### `llms-full.txt` (~800-1000 lines)
Exhaustive per-component reference. Contains:
1. Every component alphabetically
2. Description, import path, all props with types and valid values
3. Correct usage example
4. Compound sub-component trees
5. Server-safe flag

### Karm integration
Add to Karm's `CLAUDE.md`:
```markdown
## UI Components -- @devalok/shilp-sutra

Before writing ANY UI code, read the design system reference:
- Quick reference: node_modules/@devalok/shilp-sutra/llms.txt
- Full reference: node_modules/@devalok/shilp-sutra/llms-full.txt

Do NOT guess component APIs from shadcn/ui knowledge. This library
has critical differences. Read the reference first.
```

## File Locations

- `packages/core/llms.txt` — concise reference (published in npm package)
- `packages/core/llms-full.txt` — exhaustive reference (published in npm package)
- `packages/core/package.json` — add files to `"files"` array so they ship with npm

## llms.txt Structure

```
# @devalok/shilp-sutra
> Radix UI + Tailwind + CVA design system for Devalok apps.
> Similar to shadcn/ui with key differences below.

## Install & Import
- pnpm add @devalok/shilp-sutra
- Barrel: import { Button } from '@devalok/shilp-sutra'
- Per-component: import { Button } from '@devalok/shilp-sutra/ui/button'
- Tokens: import '@devalok/shilp-sutra/tokens'
- Tailwind preset: import shilpSutra from '@devalok/shilp-sutra/tailwind'

## If You Know shadcn/ui -- READ THIS FIRST
Table of every difference:
- variant="destructive" -> color="error" (Button, Badge)
- size="default" -> size="md" (all components)
- Two-axis system: variant controls shape, color controls intent
- Chip uses label= not children
- Select size goes on SelectTrigger
- Toast uses color= not variant= (color="error" not variant="destructive")
- Pagination root is PaginationRoot (not Pagination)
- Alert is a single component (no AlertTitle/AlertDescription sub-components)
- FormField + getFormFieldA11y() instead of shadcn's 7-part Form

## Component Quick Reference
One-liner per component organized by category:
- Inputs: Button, IconButton, Input, SearchInput, NumberInput, Textarea, ...
- Feedback: Alert, Banner, Toast/Toaster, Spinner, Progress
- Overlays: Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard
- Data Display: Badge, Chip, Avatar, Card, Table, Code, Skeleton, Text
- Navigation: Tabs, Accordion, Breadcrumb, Pagination, DropdownMenu, ...
- Layout: Stack, Container, Separator, Sidebar
- Form: FormField, FormHelperText, Label, Checkbox, RadioGroup, Switch, Select

## Common Mistakes -- DO NOT
- DO NOT use variant="destructive" -- use color="error"
- DO NOT use size="default" -- use size="md"
- DO NOT put size on <Select> -- put it on <SelectTrigger>
- DO NOT use <Chip>text</Chip> -- use <Chip label="text" />
- DO NOT use <Toast variant="..."> -- use color= prop
- DO NOT call toast() without <Toaster> mounted at layout root
- DO NOT import from barrel in Server Components -- use per-component imports
```

## llms-full.txt Structure

```
# @devalok/shilp-sutra -- Full Component Reference

Per component (alphabetical):

## Button
- Import: @devalok/shilp-sutra/ui/button
- Props: variant (solid|default|outline|ghost|link), color (default|error),
  size (sm|md|lg|icon|icon-sm|icon-md|icon-lg), loading, loadingPosition,
  startIcon, endIcon, asChild
- Defaults: variant=solid, color=default, size=md
- Server-safe: No
- Example: <Button variant="outline" color="error" startIcon={<Icon />}>Delete</Button>
- Note: "destructive" is an alias for variant="solid" + color="error"

## Card
- Import: @devalok/shilp-sutra/ui/card
- Props: variant (default|elevated|outline|flat), interactive (boolean)
- Compound: Card > CardHeader > CardTitle, CardDescription; CardContent; CardFooter
- Server-safe: No
- Example:
  <Card variant="elevated" interactive>
    <CardHeader><CardTitle>Title</CardTitle></CardHeader>
    <CardContent>Content</CardContent>
  </Card>

[... every component ...]
```

## Data Sources (verified from codebase)

### CVA Variant Definitions
| Component | Axes | Values | Defaults |
|-----------|------|--------|----------|
| Button | variant, color, size | solid/default/outline/ghost/destructive/link, default/error, sm/md/lg/icon/icon-* | solid, default, md |
| Badge | variant, color, size | subtle/secondary/solid/outline/destructive, 14 colors, sm/md/lg | subtle, default, md |
| Alert | variant, color | subtle/filled/outline, info/success/warning/error/neutral | subtle, info |
| Card | variant | default/elevated/outline/flat | default |
| Toggle | variant, size | default/outline, sm/md/lg | default, md |
| Toast | color | neutral/success/warning/error/info | neutral |
| Chip | variant, color, size | subtle/outline, 13 colors, sm/md/lg | subtle, default, md |
| Avatar | size, shape | xs/sm/md/lg/xl, circle/square/rounded | md, circle |
| Input | size | sm/md/lg | md |
| Textarea | size | sm/md/lg | md |
| SelectTrigger | size | sm/md/lg | md |
| Skeleton | variant, animation | rectangle/circle/text, pulse/shimmer/none | rectangle, pulse |
| Text | variant | 16 typography scales | body-md |
| Banner | color | info/success/warning/error/neutral | info |
| Tabs (list+trigger) | variant | line/contained | line |
| Progress | size (track), color (indicator) | sm/md/lg, default/success/warning/error | md, default |
| SegmentedControl | size, variant | sm/md/lg, filled/tonal | md, tonal |
| Sheet | side | top/bottom/left/right | right |
| StatusBadge | status, color, size | 8 statuses, 5 colors, sm/md | md |
| ContentCard | variant, padding | default/outline/ghost, default/compact/spacious/none | default, default |

### Server-Safe Components (no "use client")
- UI: Text, Skeleton, Spinner, Stack, Container, Table, Code, VisuallyHidden
- Composed: ContentCard, EmptyState, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator, StatusBadge

### Custom Props (not in shadcn)
| Component | Prop | Type | Note |
|-----------|------|------|------|
| Button | loading | boolean | Shows spinner |
| Button | loadingPosition | 'start' \| 'center' | Spinner placement |
| Button | startIcon, endIcon | ReactNode | Prefix/suffix icons |
| IconButton | icon | ReactNode | Required, renders icon-only button |
| IconButton | shape | 'square' \| 'circle' | Button shape |
| Input | state | 'default' \| 'error' \| 'warning' \| 'success' | Validation coloring |
| Input | startIcon, endIcon | ReactNode | Decorative icons |
| SearchInput | loading | boolean | Shows spinner |
| SearchInput | onClear | () => void | Clear button |
| Chip | label | string | Required, NOT children |
| Chip | onDismiss | () => void | Shows x button |
| Card | interactive | boolean | Hover lift effect |
| Avatar | status | 'online' \| 'offline' \| 'busy' \| 'away' | Presence dot |
| Alert | title | string | Alert heading |
| Alert | onDismiss | () => void | Shows x button |
| Badge | onDismiss | () => void | Shows x button |
| Checkbox | indeterminate | boolean | Dash state |
| Checkbox | error | boolean | Error border |
| Switch | error | boolean | Error state |
| Text | as | ElementType | Polymorphic element override |
| Stack | direction | 'vertical' \| 'horizontal' | Flex direction |
| Stack | gap | SpacingToken \| number | Gap size |

### Compound Component Trees
All documented in agents' output — Dialog, AlertDialog, Sheet, Card, Table, Select, Tabs, Accordion, Breadcrumb, Pagination, DropdownMenu, ContextMenu, Menubar, NavigationMenu, RadioGroup, ToggleGroup, FormField, Toast/Toaster, Tooltip, Popover, HoverCard, Collapsible, Sidebar, SegmentedControl.

## Maintenance Strategy

- `llms.txt` and `llms-full.txt` live in `packages/core/` (next to package.json)
- Added to package.json `"files"` array so they ship with npm publish
- Updated whenever components are added/modified
- CI check (future): script that verifies llms-full.txt mentions every exported component

## Success Criteria

- AI agent working on Karm can read `node_modules/@devalok/shilp-sutra/llms.txt` and produce correct component usage on first attempt
- No more `variant="destructive"`, `size="default"`, or `<Chip>children</Chip>` in AI-generated code
- Toast setup pattern (Toaster + useToast) correctly generated
- Select size correctly placed on SelectTrigger
