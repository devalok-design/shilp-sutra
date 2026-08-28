# Figma: the components that ship in code and do not exist in the library

**Date**: 2026-08-28
**File**: `bcBO7RgVYR4ulwPr3j2heY`, page **Components**
**Status**: plan. Build follows in the same session; this document is corrected as building teaches it wrong.

Companion docs:
- [`2026-08-19-figma-components-build.md`](./2026-08-19-figma-components-build.md): Phase 3 as built, the mode-chain architecture
- [`2026-08-18-figma-build-playbook.md`](./2026-08-18-figma-build-playbook.md): API traps and the verification protocol
- [`2026-08-27-figma-composability-gap.md`](../audits/2026-08-27-figma-composability-gap.md): what the library cannot express today

Written without em dashes, per Setu's hard ban.

---

## 0. What the research changed

Four things, one of which is a stop-work item. The brief named shadcn, Material 3, Polaris and Radix Themes; those four turned out to be the *least* informative sources, and the reason is worth stating before the useful part.

### 0.1 The four named systems mostly do not answer the question

| System | What is actually there |
|---|---|
| **shadcn/ui** | **There is no official Figma file.** `ui.shadcn.com/docs/figma` is a directory of 3 free and 8 paid *community* kits, with the note "The Figma files are contributed by the community." There is no shadcn-authored architecture to copy |
| **Material 3** | **M3 has no data table.** Not in the kit, not in the spec. Material 2 had one; M3 dropped it and `material-components/material-web` #3867 is closed as not planned. Unanswered questions on the M3 community file: "Hi, I can't find any data tables?" M3 is Compose-first and a data grid is out of scope. They never said so; they left the hole |
| **Shopify Polaris** | **The Figma library that contained a Data table is withdrawn.** `polaris-react` was archived read-only in 2026, the docs page 301s to `shopify.dev`, and Wayback has no capture of the Figma-UI-kit page. Its architecture has never been published. A third-party preservation file exists precisely because "the official files are no longer available" |
| **Radix Themes** | The kit is **unofficial** (Radix's own docs say so), community-made, and last updated **May 2024** |

That is not a null result. It reframes the exercise: **there is no canonical answer to steal, and three of the four biggest systems have quietly given up on modelling a data table in Figma at all.** Building one is therefore a decision to make, not a pattern to copy, and the plan below says so where it is guessing.

Two things the named four *did* yield:

- **Radix Themes' author, asked directly why he uses variants where variables would do**: *"I try to focus on usability over maintainability, and for most users variants are easier to use than variables (most users don't use variables/modes). Variable modes are also not included on free Figma plans."* That is the sharpest published statement of the variant-versus-mode trade, and it lands on the **opposite** side from this library. It does not apply to us at the same strength (we are on Pro, our designers already set Style and Intent modes on every Button), but it is the strongest argument against §2.1 and it should be on the record.
- **Material 3 got list variants from "over 700" down to "about 45"** by constraining which combinations are supported, not by supporting all permutations. That is the only published combinatorics number in this whole space.

### 0.2 The constraint that shapes everything: a slot does not pass component properties through, and Figma says so on purpose

This is the single most important thing the research produced, and it is not a bug report. It is Figma's own answer, from a Figma staffer on the forum:

> "At the moment, component properties (like variants or values) from instances placed inside Slots **can't be controlled or passed through via the Slot itself**. Similarly, **interactions like hover states on nested components may not behave as expected once placed inside a Slot**, even if they work correctly on their own. This is **expected** with how Slots work today… As a workaround, if you're trying to control things like variants or values within slots, **using variables and modes** can help achieve some of that flexibility."

And the help centre states the harder version: **"Component properties cannot be applied to layers from inside a slot."** Moving a layer that already carries a component property into a slot **removes the property**.

Three consequences, all of which the plan below now assumes:

1. **`Table` can never drive row state.** No `Selected rows = 2` property, no density property on the Table set, no anything that reaches down. Row state is set on each row instance, by selecting it. That was already the design; now it is a hard boundary rather than a choice.
2. **The escape hatch Figma names is a variable mode.** That is a direct endorsement of §2.1, from the vendor, for exactly this problem. It substantially outweighs the AG Grid counter-evidence in §0.5, and I would not have known to weigh it that way.
3. **A hover state on a slotted row may not resolve in prototype.** Our sets are static specimens, not prototypes, so this costs us little; it would cost a prototyping team a lot.

**The nesting depth itself is fine, and I had the risk in the wrong place.** Figma's own plugin guidance says: *"Frames nested inside another slot cannot themselves be bound to a slot property."* So **directly** nested slots are impossible, but nesting **through an instance** is the supported path, and that is exactly the shape of `Table` (slot) → `Table row` **instance** → its own `Cells` slot. Bitovi's published table is the same shape and works.

What remains genuinely unverified is narrower, and it still gets a probe (§11.0): whether a *variant switch* on the outer component survives after the inner slot has been modified. One forum report says it does not:

> "nested variants applied to the main component disappear once a slot has been modified."

Since `Table` has no variants, that report may not touch us at all. `Table row` does have variants and does contain a slot, so Q1 tests that case specifically.

### 0.3 The best answer is newer than every kit surveyed, and it is the one I had already drawn

The three-tier native-slot table, **Cell → Row (horizontal items slot, owns hover/zebra/dividers) → Table (vertical items slot of Rows, plus a second slot above for toolbar)**, is Bitovi's 2026 architecture, and it is what §3.2 independently arrives at. Worth saying plainly: **the research did not change the Table shape.** It confirmed it, dated it (only possible since Figma shipped native slots in March 2026), and supplied the failure mode in §0.2.

What it *did* change is the road not taken. Every pre-slots system converged on **column-as-atom** and paid for it:

| System | Atom | Stated reason |
|---|---|---|
| Aviatrix / FlightSuit 2.0 | Column | *"the main issue with row-based table is the inability to change the width of a nested element in a component without detaching cells"* — and they explicitly note the only row-based win is zebra striping, which they do not use |
| Untitled UI | Column | "using columns is a much more flexible approach and easier to manage in the long run" |
| Diligent v1 | Whole table, one component | Failed. Three named reasons below |
| Bitovi (2026) | Row, via slots | "previously tables needed dozens of variants and booleans leading to bloated components" |

Aviatrix's parenthetical is the whole argument: they chose columns *because* they did not need row state. **We do**, striping, selection, selection-plus-hover and expansion are the four things this build exists to make visible. So column-as-atom is disqualified on the brief, and it is disqualified for a reason the source itself names.

Diligent's three published failures from shipping the whole table as one component are worth quoting because they are what happens if the slot probe fails and someone reaches for the old answer:

1. "It required a video explanation", designers detached rather than learn it.
2. "Performance issues… the hidden layers bloated the file and made everything extremely slow to load."
3. "Not transparent", options were reachable only through the instance swapper, so nobody knew what existed.

And the sharpest version of the same lesson, from IBM Design in March 2026 on their own Carbon Data Table, which is a mature component in a mature system:

> "You pull in the Carbon Data Table component. You realize it doesn't quite fit… So you detach it… Then dev handoff comes, and your developer looks at the detached mess and says, 'I need this built with the actual component.' So you rework the entire screen. **Everyone detaches. Everyone reworks. Nobody's happy about it.**"

> "There's nothing wrong with the Carbon Data Table component… The component is trying to serve everyone… And **when you try to build something for everyone, you often end up building something that fully serves no one.**"

Their fix was a **plugin**, not a better component. That is the scoping argument for this entire plan: **a table that cannot be used without detaching is worth less than no table.** It is also the strongest case for shell-plus-slot over anything richer: the shell is small enough to be right for everyone, and the row belongs to the consumer.

Which leads to the one piece of operational advice worth putting straight into the component description, from Bitovi: once a consumer has a `Table row` instance with the columns and widths their project needs, they should **componentize that configured row locally**, and build the rest of the table from *that* main. Then a column change is one edit, not twelve.

### 0.4 Four concrete corrections to how I was going to build it

**a. `preferredValues`, `minChildren` and seeded defaults on every items slot.** Nathan Curtis's published conventions, which this library has not been applying: name it for the items not for "children"; **seed 3 items** by default; set `minChildren: 1` on an items slot (unlike a generic content slot, which may legitimately be empty); set `maxChildren` only where real overflow exists; and set `preferredValues` to the intended child components so the Inspector offers the right thing. Cheap, and it turns a slot from a hole into an affordance.

**b. The empty-slot boolean is the endorsed answer, not a hack. Expect `displayEmptyByDefault` not to help.** I was going to try replacing gap 3's `Show <slot>` boolean with the documented `displayEmptyByDefault: false` setting. The research says do not count on it: the empty-slot minimum height is a **Figma-acknowledged, still-open issue**. A Figma staffer acknowledged and forwarded it on 11 March 2026 with no fix, and a comment dated **today, 28 August 2026** reads *"I just tried to use slots for the first time and was very surprised that empty slots still take up space."* The original poster's stated workaround is verbatim ours: *"I can work around this by adding a boolean property that controls visibility of each slot but this adds clutter to the property controls."*

So the Card `Show footer` and Sidebar `Show header` retrofit is the community-standard fix, not a patch. Q3 still runs, because a two-minute test beats an assumption, but the plan assumes it fails and budgets a boolean per optional slot.

**b2. The existing 20 slots can be retrofitted with `SlotSettings` without a rebuild.** `editComponentProperty` accepts `slotSettings` and `preferredValues` post-GA. Our 20 slots predate the GA settings, so every one of them today has no `minChildren`, no `preferredValues`, and whatever `stretchChildOnInsert` it was created with. Adding `minChildren: 1` to repeating slots and `preferredValues` everywhere is a single scripted pass, and it then gives `slotNode.limitViolations` (`'BELOW_MIN' | 'ABOVE_MAX' | 'HAS_NON_PREFERRED'`) as a **machine-readable audit gate** the pre-publish script does not currently have.

**c. Never put padding on a slot layer.** Curtis: *"Prohibit padding on the slot layer. A component should not control the inset of its slot. If internal padding is required, nest the slot within a containing frame and apply padding there."* Our existing `Card` does the opposite, its `Content` slot carries `[0, 20, 0, 20]`, and that is load-bearing, because zeroing it on an instance is how the composability audit says to get a full-bleed card. So this library has a **deliberate divergence** from the convention, and it should be recorded as one rather than silently repeated. New Table slots follow Curtis: padding on a wrapper, not on the slot.

**d. `'SLOT'` on `addComponentProperty` is documented now, and `CLAUDE.md` says otherwise.** Our note says the typings list only `BOOLEAN`, `TEXT`, `INSTANCE_SWAP` and `VARIANT`, and that `'SLOT'` is undocumented but works. Figma's 2026-06-10 plugin-API update added `SlotNode`, `'SLOT'` on `ComponentPropertyType`, `createSlot()`, `resetSlot()`, `slotNode.limitViolations`, and `slotSettings`/`preferredValues` on all three `*ComponentProperty` calls. The bundled `.d.ts` still lags; the docs do not. Worth correcting so nobody re-derives it.

### 0.5 One finding that challenges §2.1 directly, and is not dismissed

**AG Grid built density as a variable-mode collection and then deleted it.** Their v3.2.0 release note, 26 May 2026: *"Removed the AG-Density collection; density variants (standard, compact, comfort) are no longer maintained as a separate variable collection."*

That is the closest thing to a controlled experiment on the exact decision in §2.1, and it went the other way. Read in context it is part of a wider consolidation, collections 4 to 2, variables 689 to 432 to about 300, motivated by a *different* pain they name explicitly: theme and light/dark lived in two collections and *"required coordinated mode switches."* Density was a third independent axis a designer had to remember to set.

Kept anyway, for three reasons:

1. Our density is genuinely **one CSS custom property cascading to every cell** (`--table-py`, `table.tsx:15`). Modelling it as anything other than an inherited value misrepresents the code.
2. The alternative costs O(rows x columns) designer actions per density change. AG Grid's grids are drawn once and rarely re-densified; ours sit inside Karm screens that get re-densified during review.
3. **A variant cannot reach through a slot and a variable mode can** (§0.2). A `Density` variant on `Table cell` would have to be set on every cell individually, because the row cannot drive it and the table certainly cannot. A mode is not merely tidier here, it is the only mechanism that crosses the slot boundary, and it is the one Figma's own support names.

Point 3 did not exist in my reasoning before the research and it is the one that settles it.

**The escape hatch, written down now so it is not a rebuild later:** if the collection proves annoying in use, `table/cell-py` becomes a plain `Spacing` reference and density becomes a third variant axis on `Table row` and `Table cell` (15 to 45 and 6 to 18 variants). Both sets stay valid either way; only the padding binding changes.

### 0.6 One audit item to steal outright

AG Grid's v3.2.2 hygiene sweep found and cleared *"86 page-level `explicitVariableModes` entries across 47 pages."* This library has already been bitten by exactly that: ten example screens blanket-set `Component/Style = Ghost`, and every Button on every screen rendered as a transparent grey ghost until it was measured. That was caught by hand. **A page-level and frame-level `explicitVariableModes` scan belongs in the Figma audit script**, because it is invisible in the UI and it poisons the mode chain this whole library rests on.

Also worth adding from the same sweep: zombie `boundVariables` references, and character-level `textRangeFills` bindings on TEXT nodes.

### 0.7 Sources

Primary, verified: `ui.shadcn.com/docs/figma`; Obra shadcn/ui Community Edition docs and blog; shadcndesign `/docs/components`; `m3.material.io/components`, the M3 kit launch post, and the Material Design Figma kit changelog (V1.18, V1.21, V1.25); Material's "Unlocking component flexibility with slots in Figma"; `design.google` on the Material Figma kit; `figma.com/@shopify`; the Polaris legacy preservation file; `radix-ui.com/themes/docs/overview/resources` and the kit author's in-thread replies; the AG Grid Design System community file release notes v3.2.0 and v3.2.2; Aviatrix "FlightSuit 2.0"; Diligent's table rebuild write-up; IBM Design, "I built a Figma plugin because the Carbon Data Table workflow was broken"; Bitovi's slots-table article; Untitled UI table docs; the "Columnar tables" article; Handsontable's data-table design guidance; Nathan Curtis, *Implementing Slots in a Figma Library*, *Figma Slots for Repeating Items*, *Configuration Collapse*; Figma help "Use slots to build flexible components", "The difference between slots, instance swaps, and variants", "Create and use variants", and the plans-and-features comparison; Figma release notes (Slots GA, 1 June 2026); the Figma plugin-API changelog; Figma's own `figma-use` agent guidance in `figma/mcp-server-guide`; Figma forum threads on nested-slot property pass-through, empty-slot sizing, and large variant sets; `carbon-design-kit` issue #548.

Numbers taken from primary sources rather than recalled: Professional = **10 modes per collection**, Organization 20, Enterprise unlimited-with-extended-collections; Figma's variant warning fires past **1 000 per set**; Material 3 = **28 UI components / 169 Figma components / 1 984 variants / 429 styles**; Material's list variants went **700+ to about 45**.

Could not be established, stated plainly rather than dressed up: **how Polaris models its Data table** (no public source exists; the fetches that would have shown it 301 or 404); **the internals of any shadcn kit's Table, Command or Combobox** (the per-component doc pages are bare Figma embeds); **whether the Radix Themes kit contains a Table at all**; **whether Atlassian's Figma library contains Table tree or Dynamic Table** (their component docs never mention Figma and the Community file is marked Legacy); **any published variant count for a table component set** in any system; **any numeric limit on slot-through-instance nesting depth**; and **any published reasoning for omitting tree views, master-detail or schedule views** anywhere except Carbon's single deferral note. Two directly on-point Reddit threads, including one practitioner's slots-in-a-table build, were unreachable (403). An empty fetch is not evidence of absence.

---

## 1. What is actually missing

The library has **32 component sets and 7 standalone components**, counted live rather than recalled.

> Counted live on 2026-08-28: **505 variants**, which matches the current `CLAUDE.md`. An earlier draft of this document reported a drift against 780; that was a stale read of the repo guide, already corrected the same day. There is no drift.
>
> The `Examples` page is empty by intent, not by accident: the example-screen pages were deleted deliberately earlier in the session. `2026-08-19-figma-components-build.md` still describes ten screens and 334 instances there, so that section of that document is now historical.

These ship in code and have no Figma counterpart at all:

| Code | Source | Lines | Why it matters |
|---|---|---:|---|
| `Table` | `packages/core/src/ui/table.tsx` | 223 | Nine sub-components, five row states, three densities. Nothing in Figma |
| `DataTable` | `packages/core/src/ui/data-table.tsx` + 6 files | 1 842 | Toolbar, pagination, bulk bar, pinning, expansion, card mode |
| Combobox listbox | `packages/core/src/ui/combobox.tsx:495-615` | 630 total | Figma has the closed trigger only |
| `Autocomplete` | `packages/core/src/ui/autocomplete.tsx` | 302 | Field reuses `Input`; the floating list has no counterpart |
| `TreeView` | `packages/core/src/ui/tree-view/` | 516 | Indent, chevron, checkbox mode, five row states |
| `MasterDetail` | `packages/core/src/composed/master-detail.tsx` | 291 | Two-pane plus a responsive stacked mode |
| `NotificationCenter` | `packages/core/src/shell/notification-center.tsx` | 559 | Three tiers, read/unread, three unread styles |
| `ScheduleView` | `packages/core/src/composed/schedule-view.tsx` | 496 | Day/week grid, six event colours, now-line |

### 1.1 The generated spec is no help here, and that is a finding

`figma-sync-components.mjs <name>` is the documented pre-build step. Run against these eight:

```
combobox           -> OK, axes: size. compound rules: 0
table              -> throws: No cva() call found
autocomplete       -> throws: No cva() call found
data-table         -> throws: No cva() call found
tree-view          -> throws: ENOENT src/ui/tree-view.tsx
master-detail      -> throws: ENOENT src/ui/master-detail.tsx
schedule-view      -> throws: ENOENT src/ui/schedule-view.tsx
notification-center-> throws: ENOENT src/ui/notification-center.tsx
```

**One of eight produces anything**, and what it produces is the closed trigger's size ramp, which is the part Figma already has. Two independent limits:

1. The script hard-requires a `cva()` call. Six of these components carry their variants in plain objects (`densityClasses`, `eventColorMap`, `UNREAD_STYLES`, `TIER_COLORS`, `PILL_TONES`) or in inline conditionals. This is the third and fourth instance of the trap already recorded for Badge and Card, except here it does not report zero rules, it **throws**.
2. The script resolves `src/ui/<name>.tsx` only. Three of these live in `src/composed/` and `src/shell/`.

Consequence for this build: **every axis below was read from the component body by hand.** Nothing is derived from the generated spec, because there is none.

### 1.2 Four bugs found while reading, three of them measured

Reading the source to build from it surfaced defects that the code review of these files did not. They are recorded here and belong in the tracker, not in Figma.

**A. Striped rows hide selection. Measured by compiling the classes.**

`Table` puts striping on the `<table>` as `[&_tbody_tr:nth-child(even)]:bg-surface-panel-hover`; `TableRow` puts selection on the `<tr>` as `data-[state=selected]:bg-accent-4`. Compiled with Tailwind 4.3.3:

```css
.\[\&_tbody_tr\:nth-child\(even\)\]\:bg-surface-panel-hover tbody tr:nth-child(even) { … }   /* (0,2,2) */
.data-\[state\=selected\]\:bg-accent-4[data-state="selected"]                        { … }   /* (0,2,0) */
.data-\[state\=selected\]\:hover\:bg-accent-5[data-state="selected"]:hover            { … }   /* (0,3,0) */
```

`(0,2,2)` beats `(0,2,0)`. **In a striped table, a selected even row renders grey, not accent.** It only reveals itself as selected on hover, because `(0,3,0)` then wins. Selection is invisible on half the rows.

`table.tsx:51` and `table.tsx:113`.

**B. Every pinned column is pinned to the same edge.**

```js
// data-table-context.tsx:285
const leftIndex = left.indexOf(columnId)
if (leftIndex !== -1) {
  return { className: 'sticky bg-surface-panel z-raised', style: { left: 0 } }
}
```

`leftIndex` is computed and then discarded. Two left-pinned columns both resolve to `left: 0` and stack on top of each other. Same for `right`.

**C. A pinned cell repaints the row.**

The same line sets `bg-surface-panel` on the cell. That is correct for occluding scrolled content and wrong for everything else: a selected row's pinned cell stays panel-coloured, and a striped row's pinned cell shows a white notch. Nothing in the pinned style is state-aware.

**D. A pinned column has no edge.**

There is no divider, shadow or ring on the pinned boundary. Unscrolled, a pinned column is indistinguishable from a normal one; scrolled, content slides under it with no seam. This is the one of the four that Figma can and should show, because it is a *design* decision that was never made.

**E. `MasterDetail`'s active row loses its tint on hover. Third instance of one bug.**

`master-detail.tsx:216` applies `hover:bg-surface-panel-hover` unconditionally and `isActive && 'bg-accent-4'` as a plain conditional class:

```css
.hover\:bg-surface-panel-hover:hover { … }   /* (0,2,0) */
.bg-accent-4                          { … }   /* (0,1,0) */
```

Hover wins. Point at the selected row in a master-detail list and it goes grey.

This is the same fault, from the same cause, that `TreeItem` fixed at `tree-item.tsx:139` (`!isSelected && 'hover:bg-…'`) and `TableRow` fixed at `table.tsx:113` (`data-[state=selected]:hover:bg-accent-5`). Two components carry an explicit code comment explaining the fix; the third never got it. Worth a lint rule rather than a third hand-written guard.

### 1.3 One structural finding: six list rows, three different selected affordances

Porting these exposes that the DS has six "selectable row" components with divergent geometry and, more seriously, divergent selection feedback:

| Component | Padding | Radius | Selected / active |
|---|---|---|---|
| `DropdownMenuItem` | 6 / 8 | control | `bg-accent-4` |
| `SidebarMenuButton` | per size | control | `bg-accent-4` |
| `TreeItem` | 4 / 8 | control | `bg-accent-4 text-accent-11` |
| `MasterDetail.ListItem` | 8 / 12 | none | `bg-accent-4 text-accent-11 font-medium` |
| Combobox option | 8 / 12 | control | **`text-accent-11` only, no background** |
| Autocomplete option | 8 / 12 | none | **`font-semibold` only** |

The last two are the finding. In a Combobox, the *highlighted* option gets `bg-accent-4` and the *selected* option gets a tint on the label plus a trailing check. So a selected option that is not currently highlighted has no fill at all, and reads as an ordinary row. In an Autocomplete it is weaker still: a bold label. Neither is wrong on its own; together with four siblings that all use `bg-accent-4` they are inconsistent.

Figma will reproduce all six faithfully. The divergence goes on the review page, not into the components.

---

## 2. The constraints the model has to live inside

Re-derived from the live file rather than recalled.

| Constraint | Measured value | Consequence here |
|---|---|---|
| Modes per collection | **10**, `addMode` throws past it | Every new mode axis below is 6 or fewer |
| Existing collections | **32** | Four new ones proposed; no ceiling on collections |
| `defaultVariant` | read-only, top-left-most variant | Every new set gets a coordinate swap and an assertion |
| Empty slot | ~32px minimum drop-target height | Every optional slot gets a `Show <slot>` boolean |
| Effect styles | cannot follow variable modes | The pinned-column shadow cannot be theme-aware; use a bound *fill* on a 1px rule instead |
| `.remove()` in a slot | one per slot per run | Seeding a 6-cell row takes six runs, or seed at component-build time |
| Booleans | can only toggle `visible` | Density, pinning and alignment cannot be booleans |
| Layout properties | not variable-bindable | Alignment must be a variant, never a mode |
| `collection.defaultModeId` | **read-only**, and it is `modes[0]` | The mode a designer gets by default is decided by creation order. See §2.2 |
| Variants per set | Figma warns past **1 000**; ~2GB per browser tab | Largest new set here is 24. No risk, but see the cost note below |
| Slot property pass-through | **none, by design** | Nothing on `Table` can drive a row. §0.2 |
| Directly nested slots | **impossible** | Nesting must go slot -> *instance* -> that instance's own slot |

**A cost worth knowing even though nothing here trips it:** Figma imports *every* variant of a set when a file uses one instance. Their words: "When you add an instance with variants to a file, Figma will import every variant in that component set." So Button at 330 variants was a tax on every consuming file, and its collapse to 55 was worth more than the variant count suggests. The largest new sets are 24, 15, 12 and 12: nothing near the ceiling, and nothing expensive to import.

### 2.1 The one decision that carries the whole Table

**Density is a variable mode, not a variant.**

`Table` sets `--table-py` (4 / 8 / 12) once on the `<table>`, and every header and body cell reads it. In Figma, variable modes cascade down a subtree exactly the same way. So:

- Density as a **mode** on a new `Component/Table Density` collection: the designer sets it once on the `Table` instance and forty rows re-pad.
- Density as a **variant** on `Table row` and `Table cell`: the designer changes forty instances, one at a time, and the header separately.

The mode is not a saving of variants (3x on two sets is only 63 variants). It is a saving of *designer actions per density change*, from O(rows x columns) to O(1). That is the same argument that made Style a mode on Button, and it is stronger here because a table has far more instances than a button does.

The mode-chain rule does not bite: cell padding depends only on density, and row background depends only on state. The two axes are independent, so neither needs to alias into the other.

---

### 2.2 A new trap: the default MODE is creation order, and it is read-only

`ComponentSet.defaultVariant` being derived from geometry already cost this project eighteen wrong defaults. **`VariableCollection.defaultModeId` has the same shape and was not documented here.** It is:

```ts
/** The default mode ID for this collection. */
readonly defaultModeId: string
```

It is `modes[0]` at creation. Creating `Component/Table Density` in the obvious order (Compact, Standard, Comfortable) silently hands every consumer **Compact**, when the code default is `standard` (`table.tsx:40`).

That is exactly the "a tidy ascending grid hands consumers the smallest size" failure, one level up, and it is *less* visible because there is no grid to look at.

**Unlike `defaultVariant`, this one has a real fix.** The property has no setter, but the collection object exposes a **`setDefaultMode(modeId)` method**, which is one call and leaves mode order and values untouched:

```js
const col = figma.variables.createVariableCollection('Component/Table Density')
col.renameMode(col.modes[0].modeId, 'Compact')
const standard = col.addMode('Standard')
col.addMode('Comfortable')
col.setDefaultMode(standard)      // <- the whole fix
```

An earlier revision of this document prescribed a rename-and-value-swap, on the reasoning that a read-only property with no reorder API left no other route. That was wrong, and wrong in the direction this project keeps going wrong in: **a missing setter is not proof of a missing capability.** Sixth or seventh instance of the same rule.

**Add to the verification pass on every new collection**: call `setDefaultMode` immediately after the last `addMode`, then assert
`collection.modes.find(m => m.modeId === collection.defaultModeId).name` equals the code default.

All 32 pre-existing collections were swept on 2026-08-28 and every one defaults to `modes[0]` correctly. That is luck, not a check: nothing in the audit script looks at it, and nothing did until this build.

### 2.3 Slot API facts confirmed since the last build, and four new traps

Slots went **GA on 1 June 2026** and that release shipped `SlotSettings`. Facts worth having in one place, all from Figma's own docs or plugin guidance:

```ts
type SlotSettings = {
  stretchChildOnInsert?: boolean
  displayEmptyByDefault?: boolean
  minChildren?: number | null
  maxChildren?: number | null
  allowPreferredValuesOnly?: boolean
}
slotNode.limitViolations  // ('BELOW_MIN' | 'ABOVE_MAX' | 'HAS_NON_PREFERRED')[], read-only
```

- `minChildren` / `maxChildren` / `allowPreferredValuesOnly` are **advisory**. Figma: *"Layer count limits are designed to guide your team, not restrict them."* Enforcement is a label turning orange. Read `limitViolations` if you want a gate.
- **"You cannot bind a slot property to the top level layer of a component."**
- **"There is no limit to the number of layers that can be added to a slot."**
- From an instance you may change a slot's fill, stroke, opacity, effects, name and export settings, but **not its position, auto-layout flow or constraints**.
- Slot properties **work across a variant set** via multi-edit, which is the UI equivalent of the create-before-combine rule.

New traps, none of which are in the playbook yet:

1. **`slotNode.clone()` returns a plain `FrameNode`, not a `SlotNode`.** Cloning a template to make the next variant silently drops the slot.
2. **`ComponentNode`s cannot be appended to a slot.** Nor can widgets or stickies. Append an **instance**; appending the main component fails.
3. **Deleting a slot property is destructive**: every instance's content in that slot is deleted with it. Figma recommends doing it in a branch.
4. **Figma documents our handle-invalidation trap.** Their guidance: *"In narrow cases the original node handle can be invalidated by the append, so if a post-append edit throws `Internal Figma Error: Parent not found`, re-find the sublayer through the slot's children."* That is the same failure our one-remove-per-run rule describes, seen from the other side. Their recommended query is `findAllWithCriteria({types:['SLOT']})`, not `findAll`.

## 3. Table and DataTable

The priority. Eleven components.

### 3.1 What ships in code

| Part | Source | Axes and states |
|---|---|---|
| `Table` | `table.tsx:39` | `density` compact/standard/comfortable -> `--table-py` 4/8/12; `striped` boolean |
| `TableHeader` | `table.tsx:60` | `[&_tr]:border-b border-surface-border-subtle` |
| `TableHead` | `table.tsx:125` | `py-(--table-py) px-ds-04`, `first:pl-` / `last:pr-` = `--table-edge`; `text-body-sm font-medium text-surface-fg-muted`; `numeric` -> `text-right` |
| Sortable header | `data-table-header.tsx:68-132` | button, `hover:bg-surface-panel-hover`, icon `arrow-up` / `arrow-down` / `arrows-sort`; unsorted icon is `surface-fg-subtle`, sorted is `surface-fg-muted` |
| Column filter row | `data-table-header.tsx:146-181` | one `h-ds-xs-plus` input per column, `py-ds-01` |
| `TableRow` | `table.tsx:99` | `border-b border-surface-border-subtle`; hover `bg-surface-panel-hover`; selected `bg-accent-4`; selected+hover `bg-accent-5` |
| `TableCell` | `table.tsx:143` | as `TableHead` minus the type change; `numeric` -> `text-right tabular-nums` |
| Pinned cell | `data-table-context.tsx:277` | `sticky bg-surface-panel z-raised`, `left: 0` / `right: 0` |
| `TableFooter` | `table.tsx:80` | `border-t border-surface-border-subtle bg-surface-panel-hover font-medium` |
| Expanded row | `data-table-body.tsx:183-209` | `colSpan=all`, `bg-surface-sunken`, inner `p-ds-05` (16) |
| Empty row | `data-table-body.tsx:285-301` | `colSpan=all`, `py-ds-07` (32), centred, `text-surface-fg-subtle` |
| Skeleton row | `data-table-body.tsx:214-255` | `Skeleton variant=text animation=pulse`, widths cycling 3/4, 1/2, 2/3, full |
| `TableRowActions` | `table.tsx:181` | `gap-ds-01`, `opacity-0` -> `group-hover/row:opacity-100`; `persist` forces visible |
| Select column | `data-table.tsx:437` | `Checkbox size=sm`, header is a tri-state select-all |
| Expand column | `data-table.tsx:462` | chevron-right button, `rotate-90` when expanded |
| Toolbar | `data-table-toolbar.tsx:113` | search + Columns dropdown + Density cycle button + Export; all `Button variant=outline color=neutral size=sm` |
| Pagination | `data-table-pagination.tsx:234` | "N total rows" / page-size `<select>` / prev / "Page X of Y" / next; `border-t border-surface-border` |
| Bulk bar | `data-table-bulk-actions.tsx:351` | `rounded-overlay bg-surface-overlay shadow-floating`, `px-ds-05 py-ds-03 gap-ds-04`, count + rule + buttons + dismiss |
| Card mode | `data-table-card.tsx` | below `sm`, rows become `Card size=sm variant=outline` |

Computed geometry, from `--text-ds-md` 14 / `--leading-ds-relaxed` 1.5 = 21px body line, `--text-ds-sm` 12 -> 18px header line:

| Density | `--table-py` | Body row | Header row |
|---|---:|---:|---:|
| compact | 4 | 29 + 1 border = **30** | 26 + 1 = **27** |
| standard | 8 | 37 + 1 = **38** | 34 + 1 = **35** |
| comfortable | 12 | 45 + 1 = **46** | 42 + 1 = **43** |

Cell inline padding is 12 (`px-ds-04`); first and last cells use `--table-edge`, which is `--card-spacing` when the table sits in a Card (20 at Card `md`) and 12 standalone.

### 3.2 The Figma model

| # | Component | Type | Axes | Variants | Slots | Booleans |
|---|---|---|---|---:|---|---|
| 1 | `Table` | standalone | — | 1 | `Header`, `Rows`, `Footer` | `Show header`, `Show footer` |
| 2 | `Table header cell` | set | `Align` 3 x `Sort` 4 x `Pinned` 2 | **24** | — | — |
| 3 | `Table row` | set | `State` 5 x `Expand` 3 | **15** | `Cells` | `Show select`, `Show actions` |
| 4 | `Table cell` | set | `Align` 3 x `Pinned` 2 | **6** | `Content` | `Show content` (default false) |
| 5 | `Table expanded row` | standalone | — | 1 | `Content` | — |
| 6 | `Table footer row` | standalone | — | 1 | `Cells` | — |
| 7 | `Table empty row` | standalone | — | 1 | — | — |
| 8 | `Table row actions` | standalone | — | 1 | — | — |
| 9 | `Data table toolbar` | standalone | — | 1 | — | `Show search`, `Show columns`, `Show density`, `Show export` |
| 10 | `Data table pagination` | standalone | — | 1 | — | `Show page size` |
| 11 | `Bulk actions bar` | standalone | — | 1 | `Actions` | — |

**45 variants across three sets, plus eight standalone components.**

Slot settings, per §0.4a. Applies to every items slot in this plan, not just the Table's:

| Slot | `minChildren` | `maxChildren` | seeded | `preferredValues` | `stretchChildOnInsert` |
|---|---:|---:|---:|---|---|
| `Table.Rows` | 1 | — | 3 | `Table row` | **true** (vertical: rows fill width) |
| `Table.Header` | 1 | 1 | 1 | — | true |
| `Table.Footer` | 0 | 1 | 1 | — | true |
| `Table row.Cells` | 1 | — | 4 | `Table cell` | **false** (horizontal: a stretched cell grows to row height) |
| `Table cell.Content` | 0 | 1 | 0 | `Badge`, `Avatar`, `Button`, `Progress` | false |
| `Table expanded row.Content` | 0 | — | 1 | — | true |
| `Bulk actions bar.Actions` | 1 | — | 2 | `Button` | false |

`stretchChildOnInsert` on a horizontal slot is the trap already paid for on Card's action row: it applies counter-axis FILL, so a dropped button stretches to the full row height. Every horizontal slot here is `false`.

**No padding on any of these slot layers** (§0.4c). Where a slot needs an inset, the slot sits inside a wrapper frame that carries it. This diverges from `Card`, deliberately and for a stated reason: Card's padding-on-slot is what makes `CardBleed` expressible by zeroing it on an instance, and a table has no bleed case.

New collection: `Component/Table Density`, **3 modes** (Compact, Standard, Comfortable), 2 variables:

```
table/cell-py    Compact 4   Standard 8   Comfortable 12
table/cell-px    12 in all three (constant today; exists so a future density can move it)
```

3 modes against a ceiling of 10. Nothing else in the family needs a mode.

#### Why each axis is what it is

**`Align` is a variant, on both cell types.** It sets `primaryAxisAlignItems` and the text's `textAlignHorizontal`. Neither is variable-bindable, and a boolean can only toggle `visible`. Variant is the only mechanism that can do it. 3 values, matching `ColumnMeta.align` plus `numeric`. (`numeric` and `align: 'right'` produce the same alignment; `numeric` additionally sets `tabular-nums`, which in Figma is an OpenType feature on the text node and rides along with the Right variant.)

**`Sort` is a variant, 4 values.** `Unsortable` renders plain text; `Sortable` renders the button plus the neutral `arrows-sort` glyph in `surface-fg-subtle`; `Ascending` and `Descending` render `arrow-up` / `arrow-down` in `surface-fg-muted`. This is a structural change (a button appears) plus an icon swap plus a colour change, so it cannot be a boolean and should not be a mode: sort state belongs to one column and must never cascade.

**`Pinned` is a variant, not a mode, and not documentation.** It changes one fill. A mode would be tidier arithmetically, but it would have to be set per cell anyway, and a mode set per cell is a right-panel action a designer will not find. As a variant it sits in the same dropdown as `Align`. 2 values.

The counter-evidence is real and worth stating: **Aviatrix does not model pinning at all**, and documents it in a separate "Grid Columns Notes" spec instead. **Carbon's core Data table has no frozen column either**, sticky columns exist only one tier up, in Carbon for IBM Products DataGrid, and carry open bugs there (`ibm-products` #5431, #5558). Every Figma forum thread asking for frozen columns is a *prototyping* question and every one is unresolved. Pinning is not modelled anywhere, by anyone.

It is modelled here for one specific reason, and the reason is narrower than "pinning": **what gets drawn is the divider, not the mechanism.** Handsontable's design guidance puts it exactly right:

> "When columns are pinned to the left or right, the visual divider (a darker or bolder line) represents more than a visual boundary. **Technically, it marks the separation between two independently scrollable regions.** Designing this divider clearly is essential."

Finding D says our code has **no divider at all**, because nobody ever designed one. Documentation records a decision; a variant forces one. The `Pinned` variant exists so that the missing seam becomes visible and someone has to choose it. Two synchronised scroll regions are not modelled and cannot be. If, once the seam is designed and shipped, the variant turns out to be dead weight, deleting it costs 12 variants.

24 = 3 x 4 x 2. Every combination exists, per the library rule that a set's variant count equals the product of its axes.

**`State` on `Table row` is a variant, 5 values**, `Default`, `Hover`, `Selected`, `Selected hover`, `Striped`. `Selected hover` earns its own value because the code needed an explicit rule for it (`table.tsx:113`) and without it the two classes tie. `Striped` is a fifth value rather than a boolean because it paints a background, and a boolean cannot.

`Striped + hover` is not modelled: both resolve to `surface-panel-hover`, so `Hover` already is it.
`Striped + selected` is not modelled as a variant either: per finding A it renders as plain striped grey, which is a bug, and building a variant for a bug bakes it in. It goes on the review page as a specimen instead.

**`Expand` on `Table row` is a variant, 3 values**, `None`, `Collapsed`, `Expanded`. The chevron's 90-degree rotation is geometry, so it cannot be a boolean, and there is no third mechanism. Folding it into `State` would multiply wrongly (a row can be both selected and expanded).

15 = 5 x 3.

**`Show select` is a boolean.** It toggles a fixed 40px leading cell holding a `Checkbox size=sm` instance. Visibility only, which is exactly what a boolean does.

**`Show actions` is a boolean** toggling a trailing cell. The *reveal on hover* behaviour is not modelled; it goes in the description. The `Hover` row state seeds the actions visible so the affordance is at least drawn once.

**`Show content` on `Table cell` defaults to `false`.** A cell's `Content` slot lets a Badge, Avatar or Button live in a cell. An empty slot costs ~32px, which is taller than a compact row (29), so the default must be off or every table silently inflates. This is gap 3 from the composability audit, applied prospectively instead of retroactively.

### 3.3 Composability: how a designer actually assembles a table

```
Card  (existing, Content slot, left/right padding zeroed for full bleed)
└── Table                                     ← set Component/Table Density here, once
    ├── Header   slot ─ 1 x  Table header row frame
    │                    └─ N x Table header cell   (Align, Sort, Pinned per column)
    ├── Rows     slot ─ M x Table row
    │                    ├─ Show select → Checkbox
    │                    ├─ Cells slot ─ N x Table cell
    │                    └─ Show actions → Table row actions
    │                   ( ± Table expanded row after any expanded row )
    └── Footer   slot ─ 1 x Table footer row
```

Above and below the `Table`, in the Card or on the page: `Data table toolbar`, `Data table pagination`, `Bulk actions bar`.

**Column alignment is by duplication, not by structure.** This is the honest trade and it needs saying plainly. Figma auto-layout nests one way. Rows are horizontal stacks of cells; columns are the transpose. You can have row-scoped backgrounds (striping, selection, hover) or column-scoped widths, not both from the structure. Every kit examined solves this the same way: **the row is the atom**, the designer sets cell widths once in the header row, and every body row is a duplicate. Changing a column width is then an N-row edit.

The alternative, a `Table column` component that stacks a header over its body cells, gives free column alignment and makes row striping and row selection unrepresentable. Since row state is exactly what this build exists to make visible, the column-as-atom model is disqualified by the brief.

Mitigation, not a fix: `Table cell` ships at a fixed 160px and the seeded rows are pre-built, so the common case is duplicate-and-retype rather than duplicate-and-resize.

### 3.4 What is deliberately not modelled

| Not modelled | Why |
|---|---|
| Virtualisation, the spacer `<tbody>` rows, `measureElement` | Rendering strategy. It has no appearance |
| Tables beyond ~8 rows | A specimen, not a dataset. Figma files with 200-row tables are slow and nobody reads row 137 |
| Sorting, filtering, pagination *behaviour* | Static medium. The controls are modelled; what they do is not |
| `mobileView="card"` | It is `Card size=sm variant=outline` with the cell values stacked. Already expressible; a duplicate component would drift |
| `onRowClick` cursor, `TableRowLink`'s 100vw stretch pseudo-element | Interaction and a CSS trick with no Figma analogue |
| Inline cell editing | One input in one cell. `Input size=xs` dropped into a cell's `Content` slot covers it |
| Column visibility, CSV export | Menu contents and a file download |
| Multiple pinned columns | Reproducing finding B (all pinned columns at offset 0) would bake a bug into the library. The `Pinned` variant models **one** pinned column, correctly |
| Column widths, default visibility, pin order as *data* | Aviatrix ships a "Grid Columns Notes" artefact instead: a written spec listing every column, which are shown by default, which are pinned, and their width ratios. That is the right home for it, and one is added to the Table's `descriptionMarkdown` rather than invented as a component |
| `hideBelow` responsive column hiding | A breakpoint rule. Draw the two widths as two frames if it matters |
| Sticky header | It is `bg-surface-panel` on the header row, which the header row already has. Scroll behaviour is not drawable |

---

## 4. Combobox listbox

### 4.1 What ships in code

`combobox.tsx`. The trigger is already in Figma (12 variants, `Size` 4 x `State` 3). Missing: everything from `PopoverContent` down.

| Part | Source | Detail |
|---|---|---|
| Panel | `:503` | `w-[trigger-width] rounded-overlay bg-surface-overlay shadow-floating`, `overflow-hidden` |
| Search row | `:508` | `border-b border-surface-border px-ds-04`, `gap-ds-02`, search icon `surface-fg-subtle`, input `py-ds-03 text-body-md` |
| List | `:534` | `<ul>` `overflow-auto p-ds-02`, `maxHeight = maxVisible * 36`, default `maxVisible` 6 |
| Option | `:545` | `flex gap-ds-03 rounded-control px-ds-04 py-ds-03 text-body-md` |
| — highlighted | `:551` | `bg-accent-4` |
| — selected | `:552` | `text-accent-11` **only** |
| — disabled | `:553` | `opacity-action-disabled` (0.38), `pointer-events-none` |
| — leading icon | `:576` | `h-ico-sm w-ico-sm` |
| — description | `:588` | second line, `text-body-sm text-surface-fg-muted` |
| — trailing check | `:596` | `IconCheck size=sm`, only when selected |
| Empty | `:530` | `px-ds-04 py-ds-05 text-center text-body-md text-surface-fg-subtle` |
| Trigger open | `:487` | `border-accent-7`, chevron `rotate-180` |
| Pills (multi) | `:56` | `neutral` = `bg-surface-panel-active text-surface-fg`; `accent` = `bg-accent-4 text-accent-11`; max 2 then "+N more" |

### 4.2 The Figma model

| # | Component | Type | Axes | Variants | Slots | Booleans |
|---|---|---|---|---:|---|---|
| 1 | `Combobox option` | set | `State` 3 x `Selected` 2 | **6** | — | `Show icon`, `Show description` |
| 2 | `Combobox listbox` | set | `State` 2 (`Options`, `Empty`) | **2** | `Options` | `Show search` |
| 3 | `Combobox` (existing) | set | add `Open` to `State` | 12 -> **16** | — | — |

`State` on the option is `Default | Highlighted | Disabled`. `Selected` is a second axis rather than a third `State` value because selected and highlighted are **independent** in the code: the currently highlighted option may or may not be the selected one, and the visual result differs (`bg-accent-4` from highlight, `text-accent-11` from selection, both at once when they coincide). Collapsing them into one axis would make the common "selected but not highlighted" case unreachable, which is precisely the case that reveals finding 1.3.

`Show icon` and `Show description` are booleans: both toggle visibility only. The description changes the row from 33px to about 54px, which auto-layout handles by hugging.

`Combobox listbox` is a 2-variant set rather than a standalone with an empty-state slot, because `Empty` **replaces** the list rather than sitting inside it. A mutually exclusive pair is a variant, per the playbook's rule 3.2.

`Pill tone` (`neutral` / `accent`) is a two-value colour change on the chip inside the trigger. It is the textbook mode case, but adding a `Component/Combobox Pill` collection for one variable to serve a `Show chips` boolean that defaults off is not worth a collection. The existing trigger already draws a neutral chip; `accent` goes in the description. **Recorded as a deliberate omission**, not an oversight.

Adding `Open` to the existing published `Combobox` set is the only change to an existing component in this plan. Risks: `defaultVariant` re-derives from geometry after a re-layout, and the set is published so every consumer instance re-resolves. Mitigation: append the four `Open` variants to the right of the existing grid so no existing variant moves, then assert `set.defaultVariant.name === 'Size=md, State=Default'`.

### 4.3 Composability

```
Combobox  (State=Open)
└── Combobox listbox           ← positioned 4px below, matching sideOffset
    ├── Show search → search row
    └── Options slot ─ N x Combobox option
```

The listbox is a **sibling**, not a child. The code renders it in a portal at `z-popover`; in Figma it is a separate instance the designer places under the trigger. Same as `Menu` today, and the same as every kit surveyed. A "Combobox open" composite that welds the two together would need one variant per option count and is not built.

### 4.4 Not modelled

Search filtering, keyboard `aria-activedescendant`, scroll, the `maxVisible * 36` height clamp (a designer sets the frame height), the "+N more" overflow arithmetic, and `renderOption`.

---

## 5. Autocomplete

### 5.1 What ships in code

The field **is** `Input` with `role="combobox"`, so it is already in Figma. `autocomplete.tsx:214`. Only the floating list is missing, and it is **not** the Combobox listbox:

| | Combobox listbox | Autocomplete listbox |
|---|---|---|
| Shadow | `shadow-floating` | `shadow-raised-hover` |
| List padding | `p-ds-02` | none, options run edge to edge |
| Option radius | `rounded-control` | none |
| Search row | yes | no, the input is the search |
| Highlighted | `bg-accent-4` | `bg-accent-4` |
| Selected | `text-accent-11` | `font-semibold` |
| Match emphasis | none | `font-semibold text-accent-11` on the matched substring |
| Loading | none | spinner row + `loadingText` |
| Max height | `maxVisible * 36` | `min(availableHeight, 240)` |

Two listboxes, seven differences. Reproduced faithfully; the divergence goes on the review page.

### 5.2 The Figma model

| # | Component | Type | Axes | Variants | Slots |
|---|---|---|---|---:|---|
| 1 | `Autocomplete option` | set | `State` 2 x `Selected` 2 | **4** | — |
| 2 | `Autocomplete listbox` | set | `State` 3 (`Options`, `Empty`, `Loading`) | **3** | `Options` |

`State` on the option is `Default | Highlighted` (there is no disabled option in `AutocompleteOption`). The **match emphasis** is a mixed text run inside one TEXT node, not a variant: Figma supports per-range fills and weights, and the seeded default demonstrates it on the word fragment. Making it a variant would require one variant per match position.

`Loading` is a third listbox state rather than a boolean because it replaces the list entirely (`autocomplete.tsx:263-270`).

### 5.3 Composability

```
Input  (state as needed)
└── Autocomplete listbox        ← sibling, 4px below (offset(4))
    └── Options slot ─ N x Autocomplete option
```

No new field component. The description on `Autocomplete listbox` names `Input` as its partner and links the source.

### 5.4 Not modelled

Floating-UI flip and shift, the 240px available-height clamp, debounce, and free-text entry (which is the whole point of the component but has no static appearance distinct from `Input`).

---

## 6. TreeView

### 6.1 What ships in code

`tree-view/tree-item.tsx:125`.

| Part | Detail |
|---|---|
| Row | `flex gap-ds-02 py-ds-02 px-ds-02 rounded-control` -> 4 / 8, radius 6 |
| Indent | `paddingLeft: calc(depth * var(--spacing-ds-05b) + var(--spacing-ds-03))` -> **depth x 20 + 8** |
| Hover | `bg-surface-panel-hover`, **only when not selected** (`:139`) |
| Selected | `bg-accent-4 text-accent-11`, hover `bg-accent-5` |
| Disabled | `opacity-action-disabled`, `pointer-events-none` |
| Focus | `ring-2 ring-accent-9` |
| Chevron | `IconChevronRight size=sm`, `rotate-90` when expanded; leaves get a 16px spacer (`:166`) |
| Checkbox | optional, tri-state (checked / indeterminate / unchecked) |
| Icon | optional, `text-surface-fg-subtle` |
| Label | `text-body-sm truncate` |
| Secondary | `ml-auto text-caption text-surface-fg-muted` |
| Actions | `ml-auto gap-ds-01` |
| Group | `grid-rows-[1fr]` / `grid-rows-[0fr]` collapse |

### 6.2 The Figma model

| # | Component | Type | Axes | Variants | Slots | Booleans |
|---|---|---|---|---:|---|---|
| 1 | `Tree item` | set | `State` 5 x `Expand` 3 | **15** | — | `Show checkbox`, `Show icon`, `Show secondary`, `Show actions` |
| 2 | `Tree view` | standalone | — | 1 | `Items` | — |

`State` = `Default | Hover | Selected | Selected hover | Disabled`.
`Expand` = `None | Collapsed | Expanded`, `None` is a leaf and draws the 16px spacer, which is a different node, so it is structural and must be a variant.

**Indent is a variable mode.** New collection `Component/Tree Depth`, **6 modes** (`0`–`5`), one variable:

```
tree/indent   0:8   1:28   2:48   3:68   4:88   5:108      (depth x 20 + 8)
```

Bound to the row's `paddingLeft`. Six modes against a ceiling of ten.

Why not a variant: a `Depth` axis would take the set from 15 to 90 variants for a value that changes one number.
Why not a boolean: booleans toggle visibility only.
Why not a spacer instance: it would need one component per depth, and a designer would have to remember to swap it when re-parenting.

The cascade caveat, stated because it will surprise someone: modes inherit down the tree, so a `Tree item` sitting inside a frame that already declares `Component/Tree Depth = 2` inherits 2. In practice tree rows are flat siblings inside `Tree view`'s `Items` slot, so each row declares its own. The `Tree view` description says so.

### 6.3 Composability

```
Tree view
└── Items slot ─ N x Tree item      each declaring Component/Tree Depth
```

Flat, not nested. Figma has no requirement that a depth-2 row live inside a depth-1 row, and flattening keeps every row a direct sibling so reordering is a drag rather than a re-parent.

### 6.4 Not modelled

The `grid-rows-[0fr]` collapse animation, roving tabindex, `Home`/`End`/arrow navigation, the descendant-scan that computes a parent's indeterminate checkbox, and depths beyond 5.

---

## 7. MasterDetail

### 7.1 What ships in code

`composed/master-detail.tsx`.

| Part | Detail |
|---|---|
| Root | `grid`, `gridTemplateColumns: '<masterWidth> 1fr'`, default 280px |
| List | `overflow-y-auto`, `border-e border-surface-border` (desktop only) |
| Detail | `flex-1 overflow-y-auto`, `role=region aria-live=polite` |
| List item | `flex w-full px-ds-04 py-ds-03 text-body-md text-surface-fg` -> 8 / 12 |
| — hover | `bg-surface-panel-hover` |
| — active | `bg-accent-4 text-accent-11 font-medium` |
| Mobile | below `breakpoint` (default `md` = 768): list hides when something is selected; detail hides when nothing is |
| Back bar | `border-b border-surface-border px-ds-04 py-ds-03`, `Button variant=ghost size=xs` + `arrow-left` |

### 7.2 The Figma model

| # | Component | Type | Axes | Variants | Slots |
|---|---|---|---|---:|---|
| 1 | `Master detail` | set | `Layout` 3 | **3** | `List`, `Detail` |
| 2 | `Master detail item` | set | `State` 3 | **3** | — |

`Layout` = `Desktop | Mobile list | Mobile detail`. Three variants, because the component genuinely renders three different structures: two panes; the list alone; the detail alone with a back bar. This is the same reasoning that gave `Top bar` its `Split` / `Centered` axis.

`State` on the item = `Default | Hover | Active`. `Active hover` is **not** a value: unlike `TableRow` and `TreeItem`, `master-detail.tsx:216` applies `hover:bg-surface-panel-hover` unconditionally and `isActive && 'bg-accent-4'` as a plain class, so hovering an active row **loses the accent tint**. That is the same specificity fault `TreeItem` fixed at `tree-item.tsx:139` and `TableRow` fixed at `table.tsx:113`. Third instance of one bug. Recorded in §1.2 terms as finding E and modelled as *absent*, not reproduced.

TEXT props `Label`, `Secondary`; boolean `Show secondary`.

`masterWidth` is not a variant. It is one number a designer sets by resizing the `List` slot, and the description records the 280px default.

### 7.3 Composability

```
Master detail  (Layout=Desktop)
├── List slot   ─ N x Master detail item
└── Detail slot ─ anything
```

`Show list` / `Show detail` booleans are **not** added: the `Layout` variant already decides which pane is drawn, and a boolean that can contradict the variant is the "two booleans for a mutually exclusive pair" mistake the playbook warns about.

### 7.4 Not modelled

The media query itself, roving focus, `aria-live` announcement, and the `AnimatePresence` slide on selection change.

---

## 8. NotificationCenter

### 8.1 What ships in code

`shell/notification-center.tsx`.

| Part | Source | Detail |
|---|---|---|
| Trigger | `:485` | Bell icon button, `-right-ds-01 -top-ds-01` count badge `bg-accent-9 text-accent-fg`, `h-4 min-w-4 rounded-pill` |
| Panel header | `:383` | `border-b border-surface-border-strong px-ds-05 py-ds-04`; title `text-body-md font-semibold`; count pill `bg-accent-2 text-accent-11 rounded-pill h-5 min-w-5`; "Mark all read" `text-body-sm text-surface-fg-subtle hover:text-accent-11` |
| List | `:416` | `overflow-y-auto max-h-[420px]` desktop, `max-h-[60vh]` mobile |
| Group header | `:438` | `sticky top-0 z-raised bg-surface-overlay px-ds-05 py-ds-02b`, `text-body-sm font-medium text-surface-fg-subtle` |
| Item | `:215` | `flex gap-ds-04 px-ds-05 py-ds-04` -> 12 / 20; hover `bg-surface-panel-hover` |
| — unread wash | `:160` | `tint` = `bg-accent-4`; `strong` = `bg-accent-5`; `none` = nothing |
| — tier dot | `:224` | 8px pill; `INFO` `bg-info-9`, `IMPORTANT` `bg-warning-9`, `CRITICAL` `bg-error-9`; read -> `opacity-20` |
| — title | `:236` | `text-body-md`, `font-semibold` when unread |
| — body | `:244` | `text-body-sm text-surface-fg-subtle line-clamp-2` |
| — meta | `:248` | relative time, middot, project title, all `text-body-sm text-surface-fg-subtle` |
| — actions | `:266` | `Button size=sm`, `solid` when `primary`, else `ghost`; `error` colour when `danger` |
| — dismiss | `:296` | absolute `right-ds-03 top-ds-03`, `hidden` -> `group-hover:flex` |
| Empty | `:420` | inbox glyph in a `h-ds-lg w-ds-lg rounded-pill bg-surface-panel-hover`, two lines of copy |
| Footer | `:472` | `border-t border-surface-border-strong px-ds-05 py-ds-03` |

### 8.2 The Figma model

| # | Component | Type | Axes | Variants | Slots | Booleans |
|---|---|---|---|---:|---|---|
| 1 | `Notification item` | set | `Tier` 3 x `State` 4 | **12** | — | `Show body`, `Show project`, `Show actions`, `Show dismiss` |
| 2 | `Notification center` | set | `State` 2 (`Items`, `Empty`) | **2** | `Items` | `Show footer`, `Show count` |
| 3 | `Notification group header` | standalone | — | 1 | — | — |

`Tier` = `Info | Important | Critical`. Three values, and each maps to a different `-9` step. It is a per-notification semantic, so variant, not mode, by the same rule that made Badge and Toast colours variants.

`State` = `Unread | Unread hover | Read | Read hover`. Four values because read/unread changes three things at once (wash, title weight, dot opacity) and hover changes a fourth. 3 x 4 = 12.

**`unreadStyle` is a variable mode.** New collection `Component/Notification Unread`, **3 modes**:

```
notification/unread-bg   Tint: accent/4   Strong: accent/5   None: transparent
```

Set once on the `Notification center` instance; every item inside re-washes. As a variant it would be 36 variants for one fill, and the designer would change every row. Exactly the Table-density argument at smaller scale.

`Notification center` is a 2-variant set because `Empty` replaces the list.

### 8.3 Composability

```
Notification center  (State=Items)
├── Show count → header count pill
├── Items slot
│   ├── Notification group header  ("Today")
│   ├── Notification item  x N
│   ├── Notification group header  ("Yesterday")
│   └── Notification item  x N
└── Show footer → footer bar
```

The bell trigger is **not** a new component. It is an existing `Button` in the `icon-md` size with an `Avatar`-style count dot; the description says so and points at `Badge indicator`. Building a fourth notification-badged icon button would duplicate what `Avatar`'s `Show notification dot` and `Show count` already do.

The mobile presentation (`Sheet side=bottom`) is not a variant either: the existing `Sheet` set already has `side=bottom`, and the panel drops into its `Content` slot.

### 8.4 Not modelled

The sticky behaviour of group headers, infinite scroll and `onFetchMore`, relative-time computation, `line-clamp-2` overflow (Figma clamps by `maxLines`, which is close but not the same), and the read/unread transition.

---

## 9. ScheduleView

Lowest priority and the one with the largest gap between what the code does and what Figma can hold.

### 9.1 What ships in code

`composed/schedule-view.tsx`.

| Part | Detail |
|---|---|
| Root | `rounded-surface border border-surface-border-strong bg-surface-panel`, height default 480 |
| Time column | hour labels, `startHour` 8 to `endHour` 18 default |
| Day header | `border-b border-surface-border-strong py-ds-02 text-center text-body-sm font-semibold`; today -> `bg-accent-4 text-accent-11`, else `bg-surface-panel text-surface-fg`; only shown in `week` view |
| Slot lines | `min-h-ds-06` (24), alternating `border-surface-border-strong` (even) / `border-surface-border-subtle` (odd); interactive slots add `hover:bg-surface-panel-hover` and a focus ring |
| Event | `absolute rounded-control-inner px-ds-02 py-ds-01 text-body-xs font-medium`; top/height/inset in percent |
| — colours | `accent` `bg-accent-2 text-accent-11`; `success`/`warning`/`error`/`info` `bg-*-3 text-*-11`; `neutral` `bg-surface-panel-hover text-surface-fg-muted` |
| — selected | `ring-2 ring-accent-9` |
| — dot | 8px pill, `bg-*-9`, `bg-surface-fg-subtle` for neutral |
| Now line | `h-ds-01` (2px) `bg-error-9` full width, plus a pulsing `Dot color=error size=lg` |
| Overlap | greedy interval colouring, side-by-side columns |

Note the colour map is inconsistent with itself: `accent` uses step **2** while the other four intents use step **3**. `schedule-view.tsx:71`. Reproduced faithfully; flagged.

### 9.2 The Figma model

| # | Component | Type | Axes | Variants | Slots | Booleans |
|---|---|---|---|---:|---|---|
| 1 | `Schedule event` | set | `Color` 6 x `Selected` 2 | **12** | — | `Show dot` |
| 2 | `Schedule day column` | set | `Header` 2 (`None`, `Day`) x `Today` 2 | **4** | `Events` | — |
| 3 | `Schedule time column` | standalone | — | 1 | — | — |
| 4 | `Schedule now indicator` | standalone | — | 1 | — | — |
| 5 | `Schedule view` | set | `View` 2 (`Day`, `Week`) | **2** | `Days` | — |

`Color` is a variant, 6 values, for the same reason Badge, Toast and Alert colours are: per-instance semantics that must be visible and must not cascade. It is under the 10-mode ceiling, so a mode is *possible*; it is rejected on the library's own rule, not on arithmetic.

`Schedule day column` carries `Header` x `Today` = 4 because the day header only exists in week view, and today's header inverts to accent. Both are structural or fill changes on a node that some variants do not have.

### 9.3 Composability

```
Schedule view  (View=Week)
└── Days slot
    ├── Schedule time column
    └── Schedule day column  x 7      (one with Today=Yes)
        └── Events slot ─ N x Schedule event, positioned by hand
            + Schedule now indicator
```

**Event placement is manual and that is the whole compromise.** The code positions events at `top: (startMinutes / totalMinutes) * 100%` with a column-partition pass for overlaps. Figma has no arithmetic. The `Events` slot is an absolute-positioning layer over the drawn slot lines; a designer drags an event to the right slot and resizes it to its duration. The slot lines are on a 24px grid at the default 30-minute slot, so dragging snaps usefully.

### 9.4 Not modelled

Time-proportional placement, the overlap column algorithm, the live now-line tick, `scrollIntoView` on mount, roving slot navigation, `startHour`/`endHour`/`slotDuration` as anything other than the default 8-to-18 at 30 minutes, and any view other than day and week.

---

## 10. Totals and the ceiling check

| Family | New sets | New standalone | New variants | New collections | Modes |
|---|---:|---:|---:|---|---:|
| Table / DataTable | 3 | 8 | 45 | `Component/Table Density` | 3 |
| Combobox listbox | 2 | 0 | 8 | — | — |
| Combobox trigger (edit) | 0 | 0 | +4 | — | — |
| Autocomplete | 2 | 0 | 7 | — | — |
| TreeView | 1 | 1 | 15 | `Component/Tree Depth` | 6 |
| MasterDetail | 2 | 0 | 6 | — | — |
| NotificationCenter | 2 | 1 | 14 | `Component/Notification Unread` | 3 |
| ScheduleView | 3 | 2 | 18 | — | — |
| **Total** | **15** | **12** | **117** | **3** | max 6 |

Library after: **47 sets, 19 standalone, ~897 variants, 35 collections.**

Every new collection is at 6 modes or fewer against a measured ceiling of 10. No existing collection gains a mode.

### 10.1 A sanity check on whether all of this should exist

Material 3's flagship Figma kit is **28 UI components, 169 Figma components, 1 984 variants**, and it contains **no data table, no tree view, no master-detail and no schedule view.** Carbon has a tree view. Nobody surveyed has a master-detail or a schedule view.

Two honest readings of that. One: those three are not design-system components, they are application layouts, and shipping them is scope creep. Two: our code ships them, consumers use them, and a design system that cannot draw what its own code renders has a hole regardless of what Google does.

The plan takes the second reading for TreeView and MasterDetail, which are small and heavily used in Karm, and takes the first reading *partially* for ScheduleView, which is why it is last and why §9.4 is the longest not-modelled list in the document.

Carbon supplies the only published precedent for doing this cleanly. Their tree-view Figma issue shipped single-select and states, in the issue itself: *"Multi-select, we are deferring multi-select to a later date. It still needs development work."* **Say what you are not shipping, in the component, where a designer will read it.** That is the discipline this plan adopts: every §x.4 "not modelled" list goes verbatim into the component's `descriptionMarkdown`, not just into this document.

---

## 11. Build order, effort, and the riskiest decision in each

Ordered by the brief's priority, and within that by what unblocks what.

| # | Item | Effort | Riskiest structural decision |
|---|---|---|---|
| **0** | **Slot probe. Nothing else starts until this passes** | S | See §11.0. Two-level slot nesting is reported broken; `displayEmptyByDefault` is unverified; mode cascade through two slots is unverified. All three are load-bearing and all three are cheap to test on throwaway components |
| 1 | `Component/Table Density` collection | S | **Default mode is `modes[0]` and read-only (§2.2).** Already created and already wrong: it defaults to Compact. Repair before anything binds to it |
| 2 | `Table cell`, `Table header cell` | M | 24 header variants x a slot each. Slots must be created **before** `combineAsVariants` or the property does not merge. The `Content` slot on the cell must default hidden or every table inflates by 32px per row |
| 3 | `Table row` | M | The `Cells` slot is horizontal, so `stretchChildOnInsert` must be **false** or dropped cells stretch to the row height. This is the exact trap recorded for Card's action row |
| 4 | `Table`, `Table expanded row`, `Table footer row`, `Table empty row` | S | Three optional slots on `Table` need three `Show` booleans wired to `componentPropertyReferences.visible`, never a raw `.visible` write |
| 5 | `Data table toolbar`, `Data table pagination`, `Bulk actions bar`, `Table row actions` | M | Nothing structural. These are compositions of existing Button, Input and Icon instances. Risk is the wrong icon key, which has bitten three times |
| 6 | `Combobox option`, `Combobox listbox` | S | Whether `Selected` is a second axis or a third `State` value. Getting it wrong makes "selected but not highlighted" unreachable, and that is the state that exposes the missing background |
| 7 | `Combobox` gains `Open` | S | **Editing a published set.** Append to the right of the grid so nothing moves, then assert `defaultVariant.name` |
| 8 | `Autocomplete option`, `Autocomplete listbox` | S | The match-emphasis mixed text run: `setRangeFills` needs the font loaded for the range, and a blanket text edit reaches into instances |
| 9 | `Component/Tree Depth`, `Tree item`, `Tree view` | M | Depth as a mode. If mode cascade turns out to make sibling rows share a depth, the fallback is manual `paddingLeft` per row, and 15 variants stay valid either way |
| 10 | `Master detail`, `Master detail item` | S | Three `Layout` variants where two hide a slot. A hidden slot must be hidden by a boolean-wired reference, not a raw write |
| 11 | `Component/Notification Unread`, `Notification item`, `Notification center`, `Notification group header` | M | 12 variants x 4 booleans is 12 nodes to wire per boolean. The dismiss button is absolutely positioned, so `constraints` bake against the parent width at the moment they are set |
| 12 | `Schedule event`, `Schedule day column`, `Schedule time column`, `Schedule now indicator`, `Schedule view` | L | The `Events` slot being an absolute-positioning layer. Slots are auto-layout by default and `layoutMode` must be set before any sizing, or it throws. If absolute children inside a slot turn out not to persist, the fallback is a plain frame and no slot |

Rough total: **three to four working days** at the rate the original port ran, assuming the per-component bug count holds at the measured four-to-ten silent defects each. Add a day if step 0 fails and the Table falls back to one slot level.

### 11.0 Step 0: the probe, in full

Three throwaway components on the `Components` page (deleted at the end of the run; a component left anywhere in the file publishes to consumers). Each question gets a **read-back**, not a call that did not throw.

**Q4 is the important one.** Q1 to Q3 are cheap insurance; Q4 is the load-bearing assumption.

**Q1. Does a variant switch survive a modified nested slot?**
Build `Probe outer` (2 variants, `V=A|B`) containing a slot holding an instance of `Probe inner` (itself 2 variants, containing its own slot). Modify the inner slot's content. Then switch `Probe outer` from A to B and **read back** the resolved variant name and the inner slot's children. Reported failure: the outer variant stops switching once the inner slot is touched. Note `Table` has no variants, so this only bites `Table row`.

**Q2. Does a nested instance's own variant state resolve two levels down?**
Put a `Button` at `State=Hover` two slot levels down and read back its resolved fill. Reported failure is prototype-only ("hover and pressed states show the placeholder values"), so a static read may well pass while a prototype would not. Record which was tested.

**Q3. Does `displayEmptyByDefault: false` collapse an empty slot?**
Create a slot with `slotSettings: { displayEmptyByDefault: false }`, remove its children, **read back the parent frame's height**. **Expected to fail**, see §0.4b, the underlying issue is open at Figma and someone complained about it today. Two minutes to be sure, then move on and use booleans.

**Q4. Does a variable mode set on the outermost instance resolve on a node two levels down, through two slot boundaries?**
Bind `table/cell-py` to a frame's `paddingTop` inside a `Cells` slot, inside a row instance, inside a `Rows` slot, inside a table instance. Set `Component/Table Density` on the outer instance only. Read the resolved number in all three modes. **Pass condition: 8, 4, 12.**

This is the whole basis of §2.1, it has never been tested across a slot boundary in this file, and it is the thing Figma's own support recommends *because* properties do not cross that boundary. If modes do not cross it either, the density argument collapses entirely.

**If Q1 or Q2 fails**, the Table becomes one slot level: `Table` keeps its `Rows` slot; `Table row` holds its cells as ordinary auto-layout children, seeded with six, and a designer adds a seventh by duplicating one. Row state survives, which is the point of the build; per-cell composability is what is lost.

**If Q4 fails**, density reverts to the variant axis described in §0.5, `Component/Table Density` is **deleted rather than left as a decoy**, and `Table row` goes 15 to 45 and `Table cell` 6 to 18.

Cleanup: delete every probe component in the same session. A component left on any page publishes to consumers.

### 11.1 Verification, per component, before it counts as built

From the playbook, plus two specific to this batch:

- [ ] `set.defaultVariant.name` equals the code default
- [ ] `[...new Set(variants.map(v => v.width))].length > 1` where labels vary
- [ ] Every bound value read back, opacity especially (percent, not 0 to 1)
- [ ] `node.width > 0` on every TEXT node
- [ ] Placed in a real scenario with varied copy, not a grid
- [ ] `descriptionMarkdown` records the SOURCE path and every divergence
- [ ] **Density mode resolved on a cell three levels deep, in all three modes**, the whole Table model rests on this
- [ ] **No component left outside the `Components` page**, since Figma publishes from every page

---

## 12. Build log

### 2026-08-29: BUILT. 20 new components, 3 new collections, audited clean.

Final audit against the live file: **66 top-level components (47 sets + 19 standalone), 641 variants, every one on the `Components` page.** Every new set complete against its axes, every `defaultVariant` correct, every component carrying `descriptionMarkdown` with a SOURCE path, no duplicate variant names. **Zero problems.**

Nothing is published. That stays a human step.

| Component | Node | Kind | Variants |
|---|---|---|---:|
| **Data table** section | `725:366` | | |
| Table cell | `725:427` | set | 6 |
| Table header cell | `726:498` | set | 24 |
| Table row | `727:658` | set | 15 |
| Table | `728:514` | standalone | |
| Table expanded row | `729:564` | standalone | |
| Table footer row | `729:567` | standalone | |
| Table empty row | `729:581` | standalone | |
| Data table toolbar | `730:576` | standalone | |
| Data table pagination | `731:595` | standalone | |
| Bulk actions bar | `731:617` | standalone | |
| Table row actions | `731:655` | standalone | |
| **Listboxes** section | `733:637` | | |
| Combobox option | `733:689` | set | 6 |
| Combobox listbox | `734:673` | set | 2 |
| Autocomplete option | `737:671` | set | 4 |
| Autocomplete listbox | `737:689` | set | 3 |
| Combobox *(existing, edited)* | `169:806` | set | 12 to **16** |
| **Tree and panels** section | `740:665` | | |
| Tree item | `740:866` | set | 15 |
| Tree view | `741:675` | standalone | |
| Master detail item | `744:715` | set | 3 |
| Master detail | `744:767` | set | 3 |
| **Notifications** section | `748:727` | | |
| Notification item | `748:1234` | set | 12 |
| Notification group header | `750:727` | standalone | |
| Notification center | `750:774` | set | 2 |
| **Schedule** section | `752:749` | | |
| Schedule event | `752:804` | set | 12 |
| Schedule time column | `753:749` | standalone | |
| Schedule now indicator | `753:770` | standalone | |
| Schedule day column | `753:889` | set | 4 |
| Schedule view | `754:1045` | set | 2 |

Collections, all with `setDefaultMode` called and the default read back:

| Collection | Id | Modes | Default |
|---|---|---|---|
| `Component/Table Density` | `712:2` | Standard, Compact, Comfortable | Standard |
| `Component/Tree Depth` | `739:2` | Depth 0 to Depth 5 | Depth 0 |
| `Component/Notification Unread` | `746:2` | Tint, Strong, None | Tint |

### The step 0 probe, run and settled

Four throwaway components, all deleted afterwards, document re-swept to assert zero remained.

| | Result |
|---|---|
| **Q1** variant switch survives a modified nested slot | **PASS** |
| **Q2** nested instance variant state resolves two slots deep | **PASS** |
| **Q3** `displayEmptyByDefault:false` collapses an empty slot | **FAIL** |
| **Q4** variable mode cascades through two slot boundaries | **PASS, exactly** |

**Q4, and then again on the real components.** Probe structure was `Table instance / Rows slot / row instance / Cells slot / cell instance`, cell at depth 4. Setting `Component/Table Density` on the **outer instance only**:

| Mode | probe cell padding | real cell h | real header h | real table h |
|---|---:|---:|---:|---:|
| Standard | 8 | **37** | 34 | 145 |
| Compact | 4 | **29** | 26 | 113 |
| Comfortable | 12 | **45** | 42 | 177 |

Those cell heights are the CSS values computed in section 3.1 to the pixel, and one mode switch re-padded all 12 body cells and 4 header cells. **Section 2.1 is confirmed by measurement, and section 0.5's escape hatch was not needed.**

**Q1, in mechanism.** Appended a second cell into a row instance's `Cells` slot, then called `setProperties({State:'B'})` on that same instance. Read back: variant `B`, both cells still present, B's fill still bound to `accent/4`, untouched sibling still `A` with zero fills. The forum report that nested variants break after a slot edit **does not reproduce** in this file.

**Q2, in mechanism.** `Button / Size=md, State=Hover` at page top level and two slot levels deep both resolve to bound fill `VariableID:114:10`, RGB `[176,23,95]`, 78x40. The chain `Component/State` to `Style` to `Intent` to `Semantic` to `Brand` to `Primitives` survives two slot boundaries. Static resolution only; the reported breakage is prototype-mode, which was not tested and is not relied on.

**Q3, in mechanism, and what it rules out.** A component holding one 21px text plus one empty `VERTICAL` slot measured **121px**: the empty slot costs **100px**, not the 32px measured on Card. The cost is the slot's own created size, so it varies by how the slot was made rather than being a fixed minimum. Setting `displayEmptyByDefault:false` via `editComponentProperty` **round-trips correctly** (reads back as `{stretchChildOnInsert:false, displayEmptyByDefault:false, minChildren:null, maxChildren:null, allowPreferredValuesOnly:false}`) and changes **nothing**: component 121px, instance 121px, slot 100px in both. `layoutSizingVertical='HUG'` does not collapse it either.

So `displayEmptyByDefault` governs whether the empty drop-target is *drawn*, not whether it occupies space. **It rules out the cheap fix for gap 3.** A boolean wired to the slot's `visible` remains the only mechanism, section 0.4b's pessimism was right, and the remaining 17 slots in the existing library each still need their own `Show <slot>` boolean. Every optional slot built here has one.

### Six API findings, all measured, none previously in the playbook

1. **`collection.defaultModeId` is read-only, but `collection.setDefaultMode(modeId)` exists.** One call, leaves mode order and values untouched. An earlier revision of this document prescribed a rename-and-value-swap on the reasoning that no setter existed. That was wrong, and wrong in this project's characteristic direction: **a missing setter is not proof of a missing capability.** All three new collections use it and all three defaults were read back.
2. **`createSlot()` is a `ComponentNode` method only.** It does not exist on `FrameNode` (`no such property 'createSlot' on FRAME node`). To place a slot inside a nested frame, create it on the component and then `appendChild` it into the frame. `Master detail`'s `Detail` slot is built that way.
3. **`appendChild` into a slot nested inside another slot invalidates the intermediate INSTANCE handle for the rest of the run**, not just the slot node. Re-fetching the outer instance and re-walking to the row still returned `Node with id "..." not found`. This is the ancestor-level twin of the known one-remove-per-slot-per-run limit, and it applies to `appendChild`, which was previously believed unlimited. The write persists; only the handles die. **Sequence as: append, return immediately, read in the next run.**
4. **`rotation` cannot be set on an instance nested inside another instance**: `This property cannot be overridden in an instance: relative-transform`. The rotate-a-glyph trick is therefore unavailable inside a Button's icon slot. Import the correctly oriented glyph instead.
5. **A TEXT component property wipes per-range text styling.** Applying `setRangeFontName` / `setRangeFills` and then binding a TEXT property re-renders the string uniformly. Autocomplete's matched-substring emphasis is therefore not representable alongside an editable label. The label won.
6. **A SLOT left at `layoutMode: 'NONE'` can be absolutely positioned and stretched**, giving a free-placement overlay. That is how `Schedule day column`'s `Events` slot sits on top of its grid lines. Slots only need a `layoutMode` if you want `HUG` or `FILL` sizing.

Also confirmed: the documented **add-a-slot-to-an-already-combined-set** recipe works exactly as `CLAUDE.md` describes it. `Notification center` gained its `Footer` slot after combining; two orphan per-variant properties were created and deleted, leaving one merged `Footer#750:13`.

### Deliberate divergences shipped, each recorded in the component's own description

- `Table row` has no `Striped + Selected` state: in code that renders as plain striped grey (finding A), so building it would bake a bug into the library.
- `Table cell` models **one** pinned column, not several, because the code pins every one to offset 0 (finding B).
- `Master detail item` has no `Active hover`: the code loses the accent tint on hover (finding E), so the state would be pixel-identical to `Hover`.
- `Notification item` **keeps** `Unread hover` despite the same fault, because it still differs from `Read hover` in dot opacity and title weight.
- Expanded chevrons use `chevron-down` rather than a rotated `chevron-right` (API finding 4).
- The density toolbar button ships without its `text-resize` glyph, and the notification empty state uses `bell` where the code uses `inbox`. Neither glyph is in the imported icon set.
- `Schedule event` reproduces the `accent/2` versus step-3 inconsistency in the source colour map.

## 13. Fallout for other documents and scripts

Not part of this build, but produced by it. Each is a one-line change somewhere else.

| Where | Change |
|---|---|
| `CLAUDE.md`, Figma section | `'SLOT'` on `addComponentProperty` is **documented** as of Figma's 2026-06-10 plugin-API update, not undocumented. Only the bundled `.d.ts` lags |
| `CLAUDE.md`, Figma section | Add: **`VariableCollection.defaultModeId` is read-only and is `modes[0]`.** Mode-level twin of the `defaultVariant` geometry trap (§2.2) |
| `packages/core/scripts/figma-sync-components.mjs` | It resolves `src/ui/<name>.tsx` only and hard-requires a `cva()`. Seven of eight target components make it **throw**. Either widen it to `src/{ui,composed,shell}/` and degrade gracefully to "no CVA, read the body", or stop describing it as the mandatory pre-build step |
| The Figma audit script | Add a scan for **page-level and frame-level `explicitVariableModes`**. AG Grid's sweep found 86 across 47 pages; this library shipped ten screens of ghost Buttons from exactly that, caught only by hand |
| The Figma audit script | Add **zombie `boundVariables` references** and **character-level `textRangeFills`** on TEXT nodes, from the same sweep |
| `docs/audits/2026-08-27-figma-composability-gap.md` gap 3 | Record that the boolean workaround is **Figma-endorsed and the community standard**, not a patch: the underlying empty-slot issue is acknowledged-and-open at Figma as of today. Finish the remaining 17 slots |
| The Figma audit script | Retrofit `SlotSettings` on the existing 20 slots via `editComponentProperty` (no rebuild needed), then gate on `slotNode.limitViolations` |
| `CLAUDE.md` / playbook | Four new slot traps: `slotNode.clone()` returns a plain `FrameNode`; `ComponentNode`s cannot be appended to a slot (append an instance); deleting a slot property **deletes every instance's content in it**; Figma documents our handle-invalidation trap and recommends re-finding through `slot.children` |
| `CLAUDE.md` | Headline counts are stale: **505 variants, not 780** (§1). Button collapsed 330 to 55 |
| `docs/deviations.md` | Padding-on-slot: `Card` puts its inset on the slot layer, against Curtis's published convention, because that is what makes `CardBleed` work. Currently unrecorded |
| Issue tracker | Findings A to E in §1.2. A, B, C are `Table`/`DataTable`; E is `MasterDetail` and is the third instance of one specificity fault, which argues for a lint rule over a third hand-written guard |

## 14. Republish list

**Publishing is a human step and nothing here is published.** Only the file owner can press Publish.

Everything below is built, audited and waiting:

- **20 new components** across five new sections on the `Components` page (`Data table`, `Listboxes`, `Tree and panels`, `Notifications`, `Schedule`).
- **3 new variable collections** (`Component/Table Density`, `Component/Tree Depth`, `Component/Notification Unread`). A collection is invisible to subscribing files until the library is published.
- **1 edited existing set**: `Combobox` went from 12 to 16 variants by gaining `State=Open`. Its `defaultVariant` is unchanged (`Size=md, State=Default`), so existing instances keep resolving to what they resolved to before, but the new state only reaches consumers on republish.

Two things to know about what happens after Publish:

1. **Subscribing files hold their own snapshot of a published variable.** Republishing this library does not refresh them. A file that already imports `Component/Style` and now wants `Component/Table Density` has to import it, and a file holding a stale snapshot of anything needs `importVariableByKeyAsync` inside that file. See the published-variable-is-a-separate-object rule in `CLAUDE.md`.
2. **Figma publishes components from every page.** The audit asserted zero `COMPONENT` / `COMPONENT_SET` nodes outside `Components`, and zero probe or throwaway nodes anywhere, so a publish now ships exactly the 66 intended components and nothing else.
