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

### 2. `Select` and `Combobox` have no open state. **Half closed 2026-08-29 — `Select` still open.**

Code exposes `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`,
`SelectSeparator` — a whole menu. Figma's `Select` is a closed trigger with a
`Text` prop and nothing else. The open list, which is the part with all the
design decisions in it, cannot be drawn from the library at all.

**`Combobox` is fixed.** It gained `State=Open` (12 → 16 variants), and the list
itself is now expressible:

- `Combobox option` (6 variants — `accent/4` highlight, `accent/11` selected
  label, check glyph)
- `Combobox listbox` (2)
- `Autocomplete option` (4) and `Autocomplete listbox` (3), built at the same
  time since `Autocomplete` had the identical gap

One thing that could **not** be modelled, and is worth knowing before someone
tries: **`Autocomplete`'s matched-substring emphasis is not representable.**
Measured — binding a TEXT property wipes per-range styling, so you can have an
editable label or a bolded match, not both. The editable label won.

**`Select` is still open.** Same fix shape as `Combobox`: a `Select listbox` +
`Select option` pair, or an explicit documented instruction that `Menu` +
`Menu item` is how you draw an open Select.

### 3. An unused slot cannot be hidden, and costs its minimum height. ~~**High.**~~ **CLOSED 2026-08-29.**

An empty slot keeps the space it was created at, and neither
`layoutSizingVertical = 'HUG'` nor `resize()` collapses it. The only way to
remove it is a boolean property wired to the slot's `visible`.

**Every optional slot now has one. 30 wired, 7 deliberately not.**

Three things in the original entry were wrong, and all three were wrong in a
way that made the problem look smaller than it was:

- **"32px minimum" is not a floor, it is the slot's *created* size.** Card's
  `Footer` measured 32px; a `VERTICAL` slot re-measured on 2026-08-29 cost
  **100px**. There is no constant to design around — measure the slot you built.
- **`displayEmptyByDefault: false` does not help.** It round-trips correctly
  (`false` reads back as `false`) and changes nothing about layout: 121px
  component, 121px instance, 100px slot either way. It governs whether the empty
  drop-target is *drawn*, not whether it occupies space. This was the obvious
  cheap fix and it does not exist.
- **The counts were wrong in both directions.** Not 20 slots but **37**, across
  26 components — the 2026-08-29 component build added 17 more. And not one
  already wired but **eight**; `Alert.Action` had one and this document never
  recorded it.

**Measured working, end to end.** A Card instance: 158px → **125px** with
`Content` off → **81px** with `Footer` off too → 158px restored. The mechanism
reclaims space and is reversible.

**Bindings survive.** Per-component before/after counts identical across all 26.
Deep-verified on three by resolving values rather than counting them — Card
**240**, Sidebar **250**, Top bar **84**: **574 resolved, 0 unresolved**
(`Content.paddingLeft = scale/16 → 16`, `surface-fg → #333333`,
`role/pill → 9999`). `componentPropertyReferences` does **not** clear bindings
the way a raw `.visible` write does.

**Seven slots deliberately have no boolean**, because hiding them yields empty
chrome rather than a useful state, and this document's own wording was "anywhere
a slot is *legitimately optional*":

`Menu.Items` · `Tabs.Items` · `Segmented control.Items` · `Breadcrumb.Trail` ·
`Table row.Cells` · `Table footer row.Cells` · `Schedule view.Days`

They were given booleans in the first pass and the booleans were then **deleted**
— a switch that produces a broken component is worse than no switch, and seven
dead toggles in the right panel is a tax every designer pays forever.

Deleting a **BOOLEAN** is safe; deleting a **SLOT** property is not (that
destroys every instance's content, see rule 6). The safe order, used here, is to
rewrite `componentPropertyReferences` to `{ slotContentId }` *first* — dropping
the `visible` reference — and only then `deleteComponentProperty` on the
boolean, so a dangling reference never exists at any point. Piloted on one
component and verified before the other six. All seven: slot count, child count,
`.visible` and binding count identical before and after (Table row alone carries
15 slots and 547 bindings).

One asymmetry worth knowing: `Top bar.Show center` only affects one of its two
variants, because the other has no `Center` slot.

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
