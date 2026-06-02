# Tabs

Switch between sibling views inside a single region. Not for top-level navigation.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@devalok/shilp-sutra/ui/tabs'
```

## When to use

- Sub-sections of a single page / panel that share context (Overview / Activity / Settings on a project).
- Filtered views over the same dataset (All / Mine / Archived).
- Need URL-driven routes per tab? Wire `value` / `onValueChange` to router state.
- Top-level app navigation? Use `<Sidebar>` / `<TopBar>`, not Tabs.
- Multi-step flows? Use `<Stepper>` or a wizard pattern.

## Compound shape

```
Tabs (root — value, defaultValue, onValueChange)
  TabsList (variant, size, orientation)
    TabsTrigger (value)         ← inherits variant/size/orientation from TabsList
  TabsContent (value)           ← rendered inline (not portalled)
```

## TabsList props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'line'\|'contained'` | Default `line`. |
| `size` | `'sm'\|'md'\|'lg'` | Default `md`. |
| `orientation` | `'horizontal'\|'vertical'` | Default `horizontal`. Vertical also changes keyboard nav to ArrowUp/Down. |
| `color` | `'accent'\|'neutral'` | Affects the line-variant active indicator. |

## Variants

| Variant | When |
|---|---|
| `line` (default) | Underline active indicator. Most common — pairs with section headings. |
| `contained` | Pill background per active trigger. Use inside cards or compact toolbars. |

## Root state props (Radix passthrough)

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | Controlled active tab. |
| `defaultValue` | `string` | Uncontrolled initial tab. |
| `onValueChange` | `(value: string) => void` | Fires on tab change. |

## TabsTrigger / TabsContent

Both require a `value: string` prop. The values must match between a trigger and its content.

`TabsTrigger` reads `variant` / `size` / `orientation` from `TabsList` via context. Override per-trigger if needed, but normally don't.

## Examples

**Standard line tabs:**
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <ProjectOverview />
  </TabsContent>
  <TabsContent value="activity">
    <ActivityFeed />
  </TabsContent>
  <TabsContent value="settings">
    <ProjectSettings />
  </TabsContent>
</Tabs>
```

**Contained variant inside a card:**
```tsx
<Card>
  <CardContent>
    <Tabs defaultValue="day">
      <TabsList variant="contained" size="sm">
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
      <TabsContent value="day"><Chart range="day" /></TabsContent>
      <TabsContent value="week"><Chart range="week" /></TabsContent>
      <TabsContent value="month"><Chart range="month" /></TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

**Vertical orientation (settings-style):**
```tsx
<Tabs defaultValue="account" orientation="vertical">
  <Stack direction="horizontal" gap="ds-07" align="start">
    <TabsList orientation="vertical">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
    </TabsList>
    <div className="flex-1">
      <TabsContent value="account"><AccountForm /></TabsContent>
      <TabsContent value="billing"><BillingForm /></TabsContent>
      <TabsContent value="notifications"><NotificationsForm /></TabsContent>
    </div>
  </Stack>
</Tabs>
```

**With icons + badges:**
```tsx
<Tabs defaultValue="inbox">
  <TabsList>
    <TabsTrigger value="inbox">
      <Icon icon={IconInbox} /> Inbox
      <Badge size="xs" color="accent">12</Badge>
    </TabsTrigger>
    <TabsTrigger value="sent">
      <Icon icon={IconSend} /> Sent
    </TabsTrigger>
  </TabsList>
  <TabsContent value="inbox"><InboxList /></TabsContent>
  <TabsContent value="sent"><SentList /></TabsContent>
</Tabs>
```

**Router-driven (Next.js App Router):**
```tsx
'use client'
const router = useRouter()
const pathname = usePathname()
const tab = pathname.split('/').pop() ?? 'overview'

<Tabs value={tab} onValueChange={(v) => router.push(`/projects/${id}/${v}`)}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
</Tabs>
```

## Composability

- **Context cascade:** `TabsList` propagates `variant` / `size` / `orientation` to every child `TabsTrigger`. Don't repeat those props on each trigger.
- **Inline content:** `TabsContent` renders inline (not portalled). Container-scoped queries in tests work.
- **Keyboard:** Roving tabindex via Radix — ArrowLeft/Right (horizontal) or ArrowUp/Down (vertical). Home / End jump to first / last. Don't re-implement.

See `foundations/spacing.md` for the gap between TabsList and TabsContent, `foundations/icons.md` for icon sizing inside triggers.

## Rules

- Put `variant` / `size` / `orientation` on `TabsList`, NOT on `Tabs` root or `TabsTrigger`.
- Every `TabsTrigger` and `TabsContent` needs a `value` — the values must match.
- For top-level app navigation use Sidebar / TopBar, not Tabs.
- Don't stack two Tabs inside the same region — pick one. Nested tabs confuse keyboard nav and section structure.
- For router-bound tabs, keep `value` controlled — don't mix `defaultValue` with router-driven URLs.
- For 5+ tabs that overflow on mobile, consider a Select dropdown on small viewports or wrap in a horizontally scrollable container.
- Icons in TabsTrigger don't auto-size via IconProvider — set explicit `<Icon icon={...} size="sm" />` when the trigger feels off.
