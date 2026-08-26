# Figma composability — gap against the code

**Measured 2026-08-27.** Compares what each component can be *composed of* in
code against what the Figma library lets a designer compose.

Figma: **39 components, 20 slots across 13 of them.** The other 26 are leaves
with no slot, which is correct for most of them.

This is not a list of bugs. Most gaps are deliberate simplifications. It is a
list of places where a designer cannot express something an engineer can build —
which is where handoff silently diverges.

---

## Closed — Figma matches the code

| component | code parts | Figma |
|---|---|---|
| **Card** | Header, Content, Footer, Title, Description, Action | `Content`, `Footer`, `Action` slots + Title/Description text props |
| **Top bar** | Left, Center, Right | `Start`, `Center`, `End` slots |
| **Dialog** | Header, Content, Footer, Title, Description | `Content`, `Footer` slots |
| **Accordion** | Item, Trigger, Content | `Content` slot on Accordion item |
| **Popover** | Trigger, Content, Anchor | `Content` slot |
| **Alert** | single component + action | `Action` slot |
| **Segmented control** | single | `Items` slot + Segment item |
| **Bottom navbar** | single | `Items` slot + Bottom nav item |
| **Breadcrumb** | List, Item, Link, Page, Separator | `Trail` slot + item + separator |
| **Tooltip** | Trigger, Content | single component |

`Menu item` is better than expected: it carries `Indicator` (None / Leading /
Trailing), `Show submenu`, `Show shortcut` and `Shortcut` text — so checkbox and
radio menu items, shortcuts and submenu affordances are all expressible.

---

## Open gaps

Ordered by how likely a designer is to hit them.

### 1. `Tabs` has no panel. **High.**

Code has `TabsContent` — the panel a tab reveals. Figma's `Tabs` has only an
`Items` slot, so a designer can lay out the tab strip but cannot show what any
tab contains. Every tabbed screen has to fake the panel outside the component.

**Fix:** add a `Panel` slot to `Tabs`.

### 2. `Select` and `Combobox` have no open state. **High.**

Code exposes `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`,
`SelectSeparator` — a whole menu. Figma's `Select` is a closed trigger with a
`Text` prop and nothing else. The open list, which is the part with all the
design decisions in it, cannot be drawn from the library at all.

`Combobox` is the same, and worse, since its whole value is the filtered list.

**Fix:** either give them a `Menu`-shaped open state, or document that `Menu` +
`Menu item` is the intended way to draw an open Select and make that explicit.

### 3. `Sheet` has no `Footer`. **Medium.**

`Dialog` has `Content` + `Footer`. `Sheet` has only `Content`, though the code
gives both `SheetHeader` and `SheetFooter`. A sheet with pinned actions — the
common mobile pattern — has to be faked.

**Fix:** add `Footer` to `Sheet`, matching Dialog.

### 4. `Sidebar` expresses 4 of its 23 code parts. **Medium.**

Figma has `Sidebar` (Header / Content / Footer) plus `Sidebar item`
(Label, Icon, Size, State). Code additionally has:

`SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarMenuBadge`,
`SidebarMenuAction`, `SidebarMenuSub`, `SidebarMenuSubItem`,
`SidebarMenuSubButton`, `SidebarInput`, `SidebarRail`, `SidebarSeparator`,
`SidebarMenuSkeleton`.

Most matter little in Figma. Three do, because they change how a sidebar reads:

- **group label** — the small caps section heading. I had to hand-draw it in the
  platform example.
- **menu badge** — the count pill on a nav row (the "12 projects" affordance).
- **sub-items** — nested navigation.

**Fix:** add `Show badge` + `Badge` and `Show sub-items` to `Sidebar item`, and a
`Sidebar group label` component.

### 5. `Card` has no `Section` or `Bleed`. **Low.**

The 0.44/0.45 card system added `CardSection` (internal divider) and `CardBleed`
(edge-to-edge content inside padded card). Neither exists in Figma. A designer
drawing a card with a full-bleed image or a divided body is improvising.

### 6. `Breadcrumb` has no ellipsis. **Low.**

Code has `BreadcrumbEllipsis` for collapsed trails. Figma has item + separator
only, so a long truncated breadcrumb cannot be shown.

### 7. `Toast` covers one of three shapes. **Low.**

Figma `Toast` has Title, Description, icon, timer and 6 colours — good. Code
also ships an **upload toast** (per-file rows with progress) and an **undo
toast** (action button). Neither is expressible.

### 8. `AppShell` has no Figma equivalent at all. **New.**

Added to code on 2026-08-27. It is the frame that puts a bar above both the
sidebar and the canvas, with `variant` (flat / inset) and `chrome` (dim /
bright). The arrangements exist as prototypes on `Shell & surface — 26 Aug` but
not as a component.

**Fix:** build `App shell` as a component set with those two axes and
`Bar` / `Sidebar` / `Canvas` slots.

---

## A constraint worth recording

**Figma slots can only be filled by dragging in the UI. The plugin API cannot
set slot content** — `setProperties` on a slot property returns *"Slot component
property values cannot be edited"*, and `appendChild` on an instance's slot
*adds to* the component's default content rather than replacing it, because
those defaults are inherited and not removable on the instance.

Consequence: any script that builds screens from library components must either
compose containers itself, or accept default placeholder content stacked under
whatever it adds. The examples on `Examples — screens` take the first route —
every leaf is a real instance, containers are composed from tokens.

This also means **slot defaults are a UX trade**: they help a designer see what
belongs in a slot, and they block programmatic composition. Keeping them is the
right call for the humans, but it should be a known cost, not a surprise.
