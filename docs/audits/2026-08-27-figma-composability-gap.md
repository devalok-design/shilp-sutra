# Figma composability — gap against the code

**Measured 2026-08-27. Revised the same day** — the section on slot limitations
was wrong, and correcting it changed the conclusion of this whole document. See
[The slot mechanism](#the-slot-mechanism-corrected).

Compares what each component can be *composed of* in code against what the Figma
library lets a designer compose.

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

## The slot mechanism, corrected

An earlier version of this document stated:

> Figma slots can only be filled by dragging in the UI. The plugin API cannot set
> slot content.

**That is false**, and it was asserted after trying two mechanisms. A third one
works. The rule in `CLAUDE.md` — *assume a Figma limitation is your ignorance
until three distinct mechanisms have failed* — exists precisely for this, and
this is the sixth time it has been proven right.

What actually holds:

| mechanism | result |
|---|---|
| `setProperties` on the slot property | fails — *"Slot component property values cannot be edited"* |
| `appendChild` onto a slot | **stacks under** the inherited default content |
| **`.remove()` the default children, then `appendChild`** | **works, and persists** |
| `setProperties` on a nested instance inside a slot | works — overrides an existing default item in place |

So slot content is fully authorable from the plugin API. Two rate limits govern
how, and both are invisible until you read a value back:

1. **One `.remove()` per slot per plugin run.** After the first removal, every
   node id inside that slot stops resolving for the remainder of the run — a
   second removal throws `Node with id "…" not found`. Clearing a 3-item slot
   takes three runs.
2. **One `setProperties` per nested slot instance per run.** The call returns
   normally and the write does persist, but it invalidates the whole slot
   subtree, so the next write in that same slot fails. Different instances are
   unaffected — 8 components can each take one write in the same run.

Both writes **persist across runs**, so the work is just sequenced, not blocked.
And after any mutation the slot must be **re-queried** — never cache
`slot.children` across a write.

Consequence for the examples: `Examples — screens` is now built **entirely** from
library components — 0 hand-built frames where a component exists, 0 detached
instances. The earlier claim that containers had to be composed by hand was a
consequence of this misunderstanding, not of Figma.

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

### 3. An unused slot cannot be hidden, and costs its minimum height. **High.**

An empty slot keeps a minimum drop-target height — measured **32px** on Card's
`Footer` — and neither `layoutSizingVertical = 'HUG'` nor `resize()` collapses
it. The only way to remove it is a boolean property wired to the slot's
`visible`, exactly as `Card.Show action` already does.

Of **20 slots, only one** shipped with such a boolean (`Card.Action`). Every
other slot silently costs height when a designer does not use it. A footerless
Card was 40px too tall (32px slot + 8px stack gap).

**Fixed for two, 2026-08-27** — both need a republish:

- `Card` → added **`Show footer`** (`Show footer#529:0`), wired to the `Footer`
  slot on all three vertical variants. Default `true`, so existing instances are
  unchanged.
- `Sidebar` → added **`Show header`** (`Show header#531:0`), wired to the
  `Header` slot on all four variants. Default `true`.

Variable bindings on both slots were re-read after wiring and are intact —
`componentPropertyReferences` does **not** clear bindings the way a raw
`.visible` write does.

**Still open** for the remaining 17 slots. The general fix is a `Show <slot>`
boolean anywhere a slot is legitimately optional.

### 4. `Sheet` has no `Footer`. **Medium.**

`Dialog` has `Content` + `Footer`. `Sheet` has only `Content`, though the code
gives both `SheetHeader` and `SheetFooter`. A sheet with pinned actions — the
common mobile pattern — has to be faked.

**Fix:** add `Footer` to `Sheet`, matching Dialog.

### 5. `Sidebar` expresses 4 of its 23 code parts. **Medium.**

Figma has `Sidebar` (Header / Content / Footer) plus `Sidebar item`
(Label, Icon, Size, State). Code additionally has:

`SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarMenuBadge`,
`SidebarMenuAction`, `SidebarMenuSub`, `SidebarMenuSubItem`,
`SidebarMenuSubButton`, `SidebarInput`, `SidebarRail`, `SidebarSeparator`,
`SidebarMenuSkeleton`.

Most matter little in Figma. Three do, because they change how a sidebar reads:

- **group label** — the small caps section heading. Still hand-drawn inside the
  `Content` slot in the platform example.
- **menu badge** — the count pill on a nav row (the "12 projects" affordance).
- **sub-items** — nested navigation.

**Fix:** add `Show badge` + `Badge` and `Show sub-items` to `Sidebar item`, and a
`Sidebar group label` component.

### 6. `Bottom navbar` has no safe-area affordance. **Medium.** *(new)*

The code's `BottomNavbar` carries `pb-safe`
(`shell/bottom-navbar.tsx:259`), which resolves to
`env(safe-area-inset-bottom)`. The Figma component has no equivalent, so it
measures **64px** where a notched device renders roughly 94px. Any mobile mockup
built from it under-reports the height the bar actually occupies, and content
laid out against it will be wrong at the bottom of the screen.

**Fix:** add a `Safe area` boolean (default off) that adds the inset strip, so
device mockups and in-app frames can both be drawn honestly.

### 7. `Card` has no `Section`. **Low.** *(revised — bleed is expressible)*

The 0.44/0.45 card system added `CardSection` (internal divider) and `CardBleed`
(edge-to-edge content inside a padded card).

**`CardBleed` turns out to be expressible.** Card puts its *vertical* padding on
the root and its *horizontal* padding on each section — `Header`, `Content` and
`Footer` each carry `[0, 20, 0, 20]`. Zeroing the `Content` slot's left/right
padding on an instance gives a true full-bleed row, which is how the "Recent
tasks" table card in the platform example is built. That is a real mechanism, not
a workaround, and it should be **documented** rather than rebuilt.

`CardSection` — the internal divider — genuinely has no equivalent.

### 8. `Breadcrumb` has no ellipsis. **Low.**

Code has `BreadcrumbEllipsis` for collapsed trails. Figma has item + separator
only, so a long truncated breadcrumb cannot be shown.

### 9. `Toast` covers one of three shapes. **Low.**

Figma `Toast` has Title, Description, icon, timer and 6 colours — good. Code
also ships an **upload toast** (per-file rows with progress) and an **undo
toast** (action button). Neither is expressible.

### 10. `AppShell` has no Figma equivalent at all. **New.**

Added to code on 2026-08-27. It is the frame that puts a bar above both the
sidebar and the canvas, with `variant` (flat / inset) and `chrome` (dim /
bright). The arrangements exist as prototypes on `Shell & surface — 26 Aug` but
not as a component.

**Fix:** build `App shell` as a component set with those two axes and
`Bar` / `Sidebar` / `Canvas` slots.

---

## Two numbers worth keeping

**Slot defaults are a UX trade, not a bug.** They show a designer what belongs in
a slot. They also mean every programmatic fill starts with a clear step, and that
an unused slot costs height until gap 3 is closed everywhere. Keeping them is the
right call for the humans; it should be a known cost.

**`defaultVariant` is derived from geometry and is read-only.** Unchanged by this
work, but any re-layout of a set silently changes which variant consumers get.
Re-assert `set.defaultVariant.name` after touching a set's grid.
