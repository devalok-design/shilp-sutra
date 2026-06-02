# Components — catalog & decision trees

Catalog of every major component. Use this file to pick the right component before reaching for raw HTML. Per-component deep guides live alongside this file.

## Decision tree — actions

```
User wants to commit / cancel / submit?
  → primary CTA (1 per region)  → <Button variant="solid" color="accent">
  → secondary action            → <Button variant="soft"> (NOT outline — see preference)
  → tertiary / dismissive       → <Button variant="ghost">
  → destructive action          → <Button variant="solid" color="error">
  → link-styled action          → <Button variant="link">

Action has a side-menu / overflow?
  → <SplitButton> — primary + adjacent dropdown trigger.

Action is icon-only?
  → <IconButton> — same as Button, square aspect, aria-label required.

Group of related actions?
  → <ButtonGroup> — attached or not. Propagates disabled / size.
```

## Decision tree — input

```
Single-line text?
  → <Input> — type="text"/"email"/"password"/"number"/"tel"/"url"/"search"
  → For search specifically: <SearchInput> (has clear button + icon)
  → For OTP code: <InputOTP>

Multi-line text?
  → <Textarea>

Pick one from a list?
  → static list ≤7 items     → <Select>
  → static list >7 items     → <Combobox> (searchable)
  → async / large list       → <Autocomplete>
  → enum of 2–4 options      → <SegmentedControl> (always-visible) or <Tabs> (if scoping a section)

Pick many?
  → list with checkboxes     → <Checkbox> per item
  → compact pills            → <ToggleGroup type="multiple">
  → searchable               → <Combobox multiple>

Boolean?
  → <Switch> (settings-style on/off) — instant action
  → <Checkbox> (form field) — confirmed-on-submit
  → <Toggle> (button-like toggled state)

Range / scalar?
  → <Slider> (single or multi-thumb range)
  → <NumberInput> (precise number with steppers)

Date / time?
  → <DatePicker> (single date)
  → <DateRangePicker> (range)
  → <DateTimePicker> (date + time)

Color?
  → <ColorInput> (popover swatch + manual hex)
  → <ColorSwatch> (display-only)

File?
  → <FileUpload> (drag-drop + click)
```

## Decision tree — feedback

```
Permanent inline message?
  → <Alert>     — page-level notice (info / success / warning / error)
  → <Banner>    — full-bleed page banner (system status, announcements)
  → <InfoBlock> — within a form / card (helper context)

Status of an item?
  → <Badge>          — pill label (status / tag)
  → <StatusBadge>    — colored dot + label (discriminated union: status="online"/"away"/...)
  → <StatusDot>      — just the colored dot

Temporary notification?
  → toast.success / error / warning / info (imperative) — must have <Toaster /> mounted

Loading / pending?
  → <Spinner>           — generic
  → <ProgressRing>      — determinate ring
  → <Progress>          — linear bar
  → <Skeleton>          — content placeholder shimmer
  → <PageSkeletons.*>   — pre-built page-level skeletons
  → <GlobalLoading>     — app-wide loading overlay

Empty state?
  → <EmptyState> — icon + heading + body + action
```

## Decision tree — overlays

```
Confirm a destructive action?         → <AlertDialog> or <ConfirmDialog>
Show a form / detailed flow?          → <Dialog>  (auto fullScreen on mobile)
Show a side panel?                    → <Sheet>   (auto bottom-drawer on mobile)
Show a small floating popup on click? → <Popover>
Show a small floating popup on hover? → <HoverCard>
Show a label on hover?                → <Tooltip>
Show a menu from a button?            → <DropdownMenu>
Show a menu from right-click?         → <ContextMenu>
Show a menu in a toolbar?             → <Menubar>
Show a command palette (cmd+K)?       → <AppCommandPalette> (shell) or <CommandPalette> (composed)
```

## Decision tree — navigation

```
Top of every page?
  → <TopBar> (shell)

Side nav (product)?
  → <AppSidebar> (shell) — collapsible, with sections, footer

Tabs within a page?
  → <Tabs>            — horizontal default
  → <Tabs orientation="vertical"> — side-nav within a card

Pages within a flow?
  → <Stepper>         — multi-step wizard, optional clickable

Breadcrumb trail?
  → <Breadcrumb>

Pagination?
  → <Pagination>

Mobile bottom nav?
  → <BottomNavbar>
```

## Decision tree — layout

```
Page wrapper?
  → <Container size="..."> — max-width constraints (sm / md / lg / xl / 2xl / full)

Vertical / horizontal stack?
  → <Stack direction="col|row" gap="ds-*">

A card / panel?
  → <Card> — surface-raised + shadow-raised
  → <Card variant="..."> — tinted by color prop

A grid?
  → use native CSS grid utilities (grid grid-cols-12 gap-ds-05) — no kit primitive for this

Aspect-ratio box?
  → <AspectRatio ratio={16/9}>

Divider?
  → <Separator> (horizontal default; orientation="vertical")

Collapsible section?
  → <Collapsible> (single)
  → <Accordion> (group, single-open or multi-open)
```

## Decision tree — data display

```
Tabular data?
  → <Table>      — simple, hand-roll rows/cells
  → <DataTable>  — full-featured (sort, paginate, select, filter, export, density, mobile-card)

Key-value display?
  → <StatCard>          — single big stat
  → 4 StatCards in a row → use <Stack direction="row" gap="ds-05">

Activity / event log?
  → <ActivityFeed>      — vertical timeline with dots

User avatars?
  → <Avatar>           — single
  → <AvatarGroup>       — stack with overflow

A list of selectable members?
  → <MemberPicker>

A chart?
  → BarChart / LineChart / AreaChart / PieChart / RadarChart / GaugeChart / Sparkline (from /ui/charts)

Code?
  → <Code> inline
  → <MarkdownViewer> for rendered markdown
```

## Component catalog by category

### Actions
| Component | Subpath | Purpose |
|---|---|---|
| Button | `/ui/button` | Primary action element. |
| IconButton | `/ui/icon-button` | Icon-only square button. |
| ButtonGroup | `/ui/button-group` | Visually attached group. |
| SplitButton | `/ui/split-button` | Action + dropdown. |
| OAuthButton | `/ui/oauth-button` | Brand-aware social login button. |
| Toggle | `/ui/toggle` | Toggled-state button. |
| ToggleGroup | `/ui/toggle-group` | Group of toggles (single / multiple). |
| Link | `/ui/link` | Themed anchor. |

### Inputs
| Component | Subpath |
|---|---|
| Input | `/ui/input` |
| Textarea | `/ui/textarea` |
| Select | `/ui/select` |
| Combobox | `/ui/combobox` |
| Autocomplete | `/ui/autocomplete` |
| SearchInput | `/ui/search-input` |
| NumberInput | `/ui/number-input` |
| InputOTP | `/ui/input-otp` |
| Checkbox | `/ui/checkbox` |
| Radio | `/ui/radio` |
| Switch | `/ui/switch` |
| Slider | `/ui/slider` |
| FileUpload | `/ui/file-upload` |
| ColorInput | `/ui/color-input` |
| ColorSwatch | `/ui/color-swatch` |
| DatePicker | `/composed/date-picker` |
| Label | `/ui/label` |
| Form / FormField | `/ui/form` |
| SegmentedControl | `/ui/segmented-control` |

### Overlays
| Component | Subpath |
|---|---|
| Dialog | `/ui/dialog` |
| AlertDialog | `/ui/alert-dialog` |
| Sheet | `/ui/sheet` |
| Popover | `/ui/popover` |
| HoverCard | `/ui/hover-card` |
| Tooltip | `/ui/tooltip` |
| DropdownMenu | `/ui/dropdown-menu` |
| ContextMenu | `/ui/context-menu` |
| Menubar | `/ui/menubar` |

### Feedback
| Component | Subpath |
|---|---|
| Alert | `/ui/alert` |
| Banner | `/ui/banner` |
| Toast / Toaster | `/ui/toast`, `/ui/toaster` |
| Spinner | `/ui/spinner` |
| Progress | `/ui/progress` |
| ProgressRing | `/ui/progress-ring` |
| Skeleton | `/ui/skeleton` |
| Badge | `/ui/badge` |
| StatusBadge | `/composed/status-badge` |
| StatusDot | `/ui/status-dot` |
| EmptyState | `/composed/empty-state` |

### Layout
| Component | Subpath |
|---|---|
| Container | `/ui/container` |
| Stack | `/ui/stack` |
| Card | `/ui/card` |
| AspectRatio | `/ui/aspect-ratio` |
| Separator | `/ui/separator` |
| Accordion | `/ui/accordion` |
| Collapsible | `/ui/collapsible` |

### Navigation
| Component | Subpath |
|---|---|
| Tabs | `/ui/tabs` |
| Breadcrumb | `/ui/breadcrumb` |
| Pagination | `/ui/pagination` |
| Stepper | `/ui/stepper` |
| NavigationMenu | `/ui/navigation-menu` |
| Sidebar (AppSidebar) | `/shell/sidebar` |
| TopBar | `/shell/top-bar` |
| BottomNavbar | `/shell/bottom-navbar` |

### Data display
| Component | Subpath |
|---|---|
| Table | `/ui/table` |
| DataTable | `/ui/data-table` |
| StatCard | `/ui/stat-card` |
| ActivityFeed | `/composed/activity-feed` |
| Avatar | `/ui/avatar` |
| AvatarGroup | `/composed/avatar-group` |
| Text | `/ui/text` |
| Code | `/ui/code` |
| Charts (bar / line / area / pie / radar / gauge / sparkline) | `/ui/charts/*` |

## Common props across components

| Prop | Type | Where |
|---|---|---|
| `className` | string | All. Use sparingly. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | Button, Input, Select, Card, Alert, Badge, Tabs, Checkbox, Radio, Slider, etc. Not all sizes exist on every component. |
| `color` | `'accent' \| 'error' \| 'success' \| 'warning' \| 'info' \| 'neutral'` | Button, Badge, Card, Tabs (subset), Alert. |
| `variant` | varies | Button (`solid|soft|outline|ghost|link`), Card, Alert, Badge, Select, etc. |
| `disabled` | boolean | All interactive. Propagates from ButtonGroup. |
| `loading` | boolean | Button, IconButton, OAuthButton, async-aware components. |

## Per-component guides

See `components/{button|card|input|dialog|badge|select|tabs|toast|form|table|dropdown-menu|popover|text|stack|icon}.md` for prop tables, examples, and rules.
