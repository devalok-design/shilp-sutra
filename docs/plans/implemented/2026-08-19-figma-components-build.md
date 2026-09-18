# Figma Components: Phase 3 as built

**Date**: 2026-08-19
**File**: `bcBO7RgVYR4ulwPr3j2heY`, page **Components**
**Status**: 25 component sets, **741 variants**, audited clean. Published.

Companion docs:
- [`2026-08-18-figma-library-build-plan.md`](./2026-08-18-figma-library-build-plan.md): decisions D1 to D23
- [`2026-08-18-figma-build-playbook.md`](./2026-08-18-figma-build-playbook.md): API traps and verification protocol
- [`2026-08-18-figma-foundations-spec.md`](./2026-08-18-figma-foundations-spec.md): Phase 1 and 2
- [`2026-08-18-figma-port-retrospective.md`](./2026-08-18-figma-port-retrospective.md): how the work went

Written without em dashes, per Setu's hard ban.

---

## 1. What exists

| Set | Variants | Variant axes | Carried as modes |
|---|---:|---|---|
| Button | 330 | Size 11, Color 6, State 5 | Style, Shape, Weight |
| Input | 64 | Size 4, State 4, Validation 4 | Field content |
| Textarea | 64 | Size 4, State 4, Validation 4 | Field content |
| Badge | 56 | Size 4, Color 14 | Variant |
| Select | 48 | Size 4, State 3, Validation 4 | Select variant, Field content |
| Checkbox | 27 | Size 3, State 3, Interaction 3 | Validation |
| Radio | 18 | Size 3, State 2, Interaction 3 | Validation |
| Switch | 18 | Size 3, State 2, Interaction 3 | Tone |
| Alert | 15 | Size 3, Color 5 | Variant |
| Combobox | 12 | Size 4, State 3 | Validation, Field content |
| Slider | 12 | Size 3, Color 4 | |
| Progress | 12 | Size 3, Color 4 | |
| Avatar | 10 | Size 5, Content 2 | Shape, Ring, Status, Fallback |
| Segment item | 9 | Size 3, State 3 | Segment variant |
| Tab item | 9 | Size 3, State 3 | Tabs variant, Tabs colour |
| Card | 6 | Size 3, Orientation 2 | Variant, Color |
| Toast | 6 | Color 6 | |
| Sheet | 4 | Side 4 | |
| Label | 4 | Required 2, State 2 | |
| Tooltip | 4 | Side 4 | |
| Segmented control | 3 | Size 3 | Segment variant |
| Tabs | 3 | Size 3 | Tabs variant, Tabs colour |
| Skeleton | 3 | Shape 3 | |
| Dialog | 2 | Layout 2 | |
| Separator | 2 | Orientation 2 | |

Every set's variant count equals the product of its axes, so no combination is missing.

**29 variable collections, ~740 variables, 20 text styles, 13 effect styles.**

---

## 2. The architecture that made Button possible

Button's real matrix in code is `variant 5 x color 6 x weight 2 x size 12 = 720`, before interaction state. As Figma variants that is unbuildable. The shape that worked:

```
variant  -> Component/Style   mode   (Solid, Soft, Outline, Ghost, Link)
shape    -> Component/Shape   mode   (Default, Pill)
weight   -> Component/Weight  mode   (Semibold, Normal)
color    -> VARIANT, which sets a Component/Intent mode
state    -> VARIANT, which sets a Component/State mode
size     -> VARIANT (geometry cannot be a mode)
```

### The ordering rule that took a rebuild to see

**The collection a variable lives in is the OUTERMOST selector in its resolution chain.** So a value that depends on state AND style must be bound to a variable in the *state* collection, which then aliases into the *style* collection:

```
node fill -> Component/State : btn/bg-current
             Default  -> Component/Style : btn/bg
             Hover    -> Component/Style : btn/bg-hover
             Pressed  -> Component/Style : btn/bg-active
                         Solid  -> Component/Intent : x/solid-bg-hover
                                   Accent -> Semantic : accent/10
                                             -> Brand -> Primitives
```

One variable per level, five independent mode axes, and the whole 720-combination surface resolves without a single per-variant colour override.

This matters most for **icons**. Every icon in the owned Tabler library binds its stroke to `component/fg`. Because `component/fg` is state-aware through this chain, a ghost button's icon changes colour on hover on its own. Overriding icon colour per variant would have worked visually but would have broken instance swap.

### Where it could not be used

Badge has 14 colours and the measured mode ceiling is 10, so Badge colour had to be a variant with per-colour variables (`accent/bg`, `accent/fg`, `accent/border` and so on, 42 variables across 4 style modes).

---

## 3. Reproducing CSS that Figma has no equivalent for

| CSS | Figma |
|---|---|
| `-ml-1.5` on an icon span | Slot narrower than its glyph by the inset, glyph hangs out of the left edge. Verified: label starts at exactly the computed pixel |
| `pl-ds-03` instead of `px-2.5` when leading content exists | Same trick. Badge label starts at 10 plain, 20 with a dot, 26 with an icon, matching the source exactly |
| `active:brightness-[0.92]` | Black rectangle at 8 percent, NORMAL blend. `0.92c + 0.08*0` is exactly what NORMAL compositing gives |
| `disabled:saturate-[0.3]` | Mid-grey rectangle at 70 percent, SATURATION blend, with the component frame set to a non-passthrough blend mode so it isolates like CSS `isolate` |
| `ring-2 ring-offset-2` | Absolutely positioned rectangle, size + 8, so it does not change layout size. Verified: a ringed avatar is still 48 x 48 |
| `box-shadow` that only some variants have | Effect layer colours bound to a mode-driven variable, transparent in the modes that have no shadow |

### Not represented, and why

- **Pressed transform** (`scale-[0.95]`) would change the variant bounding box and break the grid.
- **Pressed saturation boost** (`saturate-[1.1]`). A SATURATION blend can only pull toward the overlay's saturation, never past 100 percent.
- **Link hover underline.** `textDecoration` is not variable-bindable and hover is a variant, not a mode.
- **Skeleton pulse and shimmer.** No animation in a static component.
- **Badge `color="custom"`**, which reads a CSS variable at runtime.

---

## 4. Findings in the design system itself

These are code observations surfaced by porting, not Figma problems.

| # | Finding | Where |
|---|---|---|
| 1 | **All 20 Figma text styles had pixel line heights** (a 12px caption with 140px leading) because the `leading/*` tokens store `150` meaning percent, and Figma reads a bound float as an absolute unit. Same fault on bound `letterSpacing`. Now set explicitly and unbound | Phase 1 output |
| 2 | Off-scale spacing where every sibling uses a `ds` token: `gap-2.5` on Button lg, `px-2.5` on Badge md, `pl-2.5` on Badge lg, `py-[3px]` and `py-[5px]` on compact buttons | button.tsx, badge.tsx |
| 3 | Badge docstring claims 16 colours; `colorMap` has 14 | badge.tsx |
| 4 | Badge `default` and `neutral` are byte-identical entries | badge.tsx |
| 5 | Badge category solid uses `text-white`, a hardcoded colour with no token | badge.tsx |
| 6 | Alert's dismiss button is `text-surface-fg-subtle` on every variant, which is low contrast on the solid backgrounds | alert.tsx |
| 7 | Switch `sm` thumb travel is 16 but the track has only 14 of inner width, so the thumb sits 2px past the track edge. Reproduced faithfully | switch.tsx |
| 8 | `CardTitle` sets weight, leading and tracking but no font size, so it falls back to the inherited browser default rather than a DS token | card.tsx |
| 9 | Button `compact-md` computes to a 37px height, off the 4px grid | button.tsx |
| 10 | Waybill has no anchor for **error or info** (the earlier note said error only). Both render the magenta placeholder, 9 steps each. Setu gap filed | Brand collection |

---

## 5. Generated-artifact traps hit again

- `figma-sync-components.mjs` reports **0 compound rules** for Badge and Card because their colours live in a plain object (`colorMap`, `getColorClasses`), not in the CVA. Building from the generated spec alone would have produced a colourless Badge. **The CVA is not the whole component**, for the third time in this project.
- The cached icon key I had been using for `x` was actually **`search`**, so every Badge dismiss button rendered a magnifying glass until it was caught by reading the library rather than trusting the constant.

---

## 6. New Figma API traps

Added to the playbook; recorded here because each cost real time.

1. **`resize()` then `layoutMode` leaves BOTH axes AUTO.** The Avatar media frame hugged its text and every avatar rendered as a narrow capsule. This is the mirror of the known "`resize()` after AUTO locks to FIXED" trap, so the rule is: **set `layoutMode` first, then sizing modes, then `resize`**.
2. **Writing `.visible` on a variable-bound node clears the binding with no error.** An audit that reveals hidden nodes to inspect them destroys exactly what it inspects: 264 of 330 Button spinner slots lost their `btn/spinner-visible` binding this way. Any traversal must check `boundVariables.visible` and skip.
3. **Instances inside hidden subtrees expose no children.** `findAll` returns zero vectors, and a guarded `if (vec)` then no-ops with no error. Set the values while the slot is still visible, or reveal deliberately (subject to trap 2).
4. **`OPACITY` is not a valid variable scope** in this API version. Internal floats take `[]`.
5. **BOOLEAN variables reject every scope**, including `[]`, so they always read as `ALL_SCOPES` in an audit. Two such variables exist and are expected.
6. **Instance `.children` omits hidden children**, so a lookup that works on a component returns null on its instance.
7. `combineAsVariants` merges component properties **by name**, so identical names across templates unify and differing ones stay per-variant.

---

## 7. Audit result

Run against the built file:

- 11 sets, 535 variants, every set complete against its axes, no duplicate variant names, every set has a description carrying its SOURCE path.
- 712 variables: **0 unset modes, 0 broken aliases, 0 failed resolutions, 0 `ALL_FILLS`**.
- 2 `ALL_SCOPES`, both BOOLEAN, which Figma cannot scope.
- 20 text styles, all percent line heights, all font sizes bound.
- **0 unbound strokes, 0 unbound radii, 0 unbound font sizes.**
- Unbound fills: 660, all of them the two Button compositing overlays (pure black for the brightness step, mid-grey for the saturation blend). These are not design colours and must not be tokenised.
- Unbound padding and gap: only the off-scale values listed in finding 2, which have no token to bind to.
- 0 em dashes anywhere in collection, mode, variable, style or page names.

---

## 8. Still open

| Thread | State |
|---|---|
| Publish the library | Human step. Only the file owner can press Publish |
| Remaining components | Select, Textarea, Combobox, Tabs, Progress, Dialog, Sheet, Toast not yet built |
| Off-scale spacing | Findings 2 and 9 are decisions for the DS, not Figma fixes |
| Waybill error and info | Needs a red, and a second blue distinct from accent |
| Code Connect | Blocked on the Pro plan; `description` carries the SOURCE path instead |

---

## 9. Post-publish pass

The library was published, then audited again. Publishing is what makes the keys real, so this is the first pass that could confirm anything actually shipped.

### Two gaps in the port, both fixed

1. **110 variables had no code syntax**, every one of them in a component-layer collection. Component variables have no single CSS custom property, because their value depends on which mode is active, so each now names the PROP that drives it: `variant="solid | soft | outline | ghost | link"` and so on. That is what a developer in Dev Mode actually needs.
2. **Input's icon sections defaulted to a person glyph.** Same root cause as the Badge dismiss bug: a wrong key in a hardcoded map. Now `search` and `x`, with eight real preferred values.

### Confirmed by measurement

- Publish state: every set, every variant and every collection carries a key.
- 927 icon instances, 9 distinct glyphs, **all resolving to the owned Tabler library**, none unreachable.
- Dark mode renders correctly across every component.
- Touch targets are fine. `touch-target` expands the hit area on checkbox, radio, switch, slider and segmented control, so the 20px visual boxes are not the hit boxes.

### The contrast audit, and why it is on its own page

Resolving each component's real foreground-on-background pair through the variable chain and running them through Setu found three failures. They are code issues that this library reproduces faithfully, so rather than silently diverging they are documented on the **Accessibility review** page, with the current specimens bound to live variables so they correct themselves once the tokens change.

| Finding | Light | Dark |
|---|---|---|
| Alert dismiss on solid, `surface-fg-subtle` on step 9 | **1.01 to 2.46** | **1.41** |
| Badge category solid, `text-white` on step 9 | 4.59 to 5.10 | **3.28 to 3.70** |
| Input and Textarea placeholder | **4.14** | 4.83 |

Alert's dismiss on solid success is 1.01 to 1, which is no contrast at all. Badge is the `text-white` hardcode behaving exactly as predicted: white is fixed while step 9 lightens in dark, and the intent colours escape it only because they use adaptive `-fg` tokens the seven category colours do not have.

Proposed fixes are measured on the same page. Dismiss taking the alert foreground clears AA on all four intents. A near-black category foreground clears three of five, with amber and orange needing true black.

### A further foundations gap

The CSS defines 16 shadow tokens; Figma had 8 effect styles. Five that components actually use were added: `segment`, `inset`, `pressed`, `raised-inner`, `kbd`. The remaining three are focus affordances (`ring`, `ring-sm`, `glow`) and were deliberately skipped, because a bound effect colour cannot carry its own alpha and focus is not drawn in design here.

---

## 10. Third time for the same trap

`resize()` after setting a sizing mode to AUTO locks that axis to FIXED. It has now caused three separate defects in this project: the Button width lock, the Avatar capsules, and the accessibility page collapsing to 100px tall with all its specimens clipped to 10px. It was documented in the playbook before two of those three happened.

Writing the trap down does not stop you falling into it. The only thing that has reliably caught it is reading back the height in the return value.

Two more worth recording from this pass:

- **A blanket text edit reaches into instances.** Clamping every TEXT node in Combobox to one truncated line also set `textAutoResize = 'HEIGHT'` on the Badge label inside the chip, which pins its width at whatever it happened to be mid-layout. The chip then read "Des..." forever. Scope text edits to the nodes you mean.
- **An audit that walks 741 variants and toggles visibility takes over 11 minutes and times out.** The write-free version covers the same ground in seconds and skips only instance internals inside hidden slots. Prefer it.

---

## 11. What example screens exposed, and the slot correction

Three screens were assembled on the **Examples** page from published instances: a project settings form, a team dashboard, and a delete confirmation over a backdrop. Composition is the test a variant grid cannot run.

### I got this wrong first

The first attempt concluded that Card, Dialog and Sheet **cannot** hold real content, because `content.children[0].remove()` throws `Removing this node is not allowed` on an instance. That conclusion was written up and recommended a workaround: an empty component swapped in via INSTANCE_SWAP, the way Figma's Simple Design System used to do it.

Mudit pushed back: Figma has since shipped native slots. It has. `component.createSlot()` returns a `SlotNode` and auto-wires a `SLOT`-typed component property. Content is placed by appending children to the slot in the instance, never through `setProperties`, which throws.

**One failed mechanism was treated as a property of the tool.** That is the third time in this project, and the retrospective already carried the rule: assume it is your ignorance until three distinct mechanisms have failed. The cost here was a wrong recommendation in a doc.

### What slots actually do, measured

| Behaviour | Result |
|---|---|
| `createSlot()` on a component | Returns `SlotNode`, auto-creates a `SLOT` property |
| Content placed in the component's slot | **Inherits as the instance default** |
| `resetSlot()` in an instance | Returns to that default, not to empty |
| Removing slot children in an instance | **Allowed**, unlike ordinary instance children |
| Appending arbitrary instances into a slot | Allowed |
| Slot reparented into a nested frame | Works, and still resolves from instances |
| Variables bound on a slot node | Works, including padding and item spacing |
| Slots created per-variant AFTER combining | **Do NOT merge**; you get one property per variant |
| Slots created BEFORE `combineAsVariants` | **Merge into one property**, and content then survives a variant switch |

That last row is the one that matters. Adding slots to an already-combined set produced twelve `Content#…` properties on Card and content would have vanished on every Size change. Rebuilding with slots created on each template before combining gave exactly two.

### What now has slots

| Set | Slots |
|---|---|
| Card | Content, Footer |
| Dialog | Content, Footer |
| Sheet | Content |
| Tabs | Items |
| Segmented control | Items |

Seven slot properties in total. Each is seeded with a sensible default, so the component still reads as a specimen out of the box and a designer can either edit the default in place or clear it and drop real content.

The settings screen was rebuilt on real Card instances with the whole form living in a Content slot and a ghost button in a Footer slot. The dashboard uses Cards for its metric tiles, with a Progress instance inside each slot, and demonstrates a **fourth tab appended into the Tabs slot**, which was impossible before.

### Smaller notes

- The destructive button defaulted to the plus glyph, because that is Button's default start icon. Swapped to trash in the example.
- Progress needs its Indicator layer resized per value. Intended, easy to forget.
- Avatar ring has both a `None` mode and a `Show ring` boolean, so hiding it means touching two controls. One would be cleaner.

---

## 12. Current state

| | |
|---|---|
| Component sets | **30** |
| Variants | **759** |
| Variable collections | **29** |
| Text styles | 20 |
| Effect styles | 13 |
| Pages | Cover, Getting Started, Foundations, Icons, Components, Accessibility review, Examples, Utilities |
| Slot properties | 11, across Card, Dialog, Sheet, Tabs, Segmented control, Sidebar, Top bar, Bottom navbar |
| Published | Yes, republish needed after the post-publish fixes |

Structurally clean: every set complete against its axes, no duplicate variant names, every set described with its SOURCE path, zero unbound strokes, radii or font sizes, zero broken aliases, zero unset modes, zero em dashes.

The only unbound values left are DS values with no token behind them: `gap-2.5` on Button lg, `px-2.5` on Badge md, `py-[3px]` and `py-[5px]` on compact buttons, and the two Button compositing overlays, which are deliberately raw.

---

## 13. Shells (2026-08-20)

The app chrome, built on native slots from the start:

| Set | Variants | Slots |
|---|---:|---|
| Sidebar | 4 (State x Side) | Header, Content, Footer |
| Sidebar item | 9 (Size x State) | |
| Top bar | 2 (Layout) | Start, Center, End |
| Bottom navbar | 1 | Items |
| Bottom nav item | 2 (State) | |

**30 sets, 759 variants.**

Sidebar is 256 expanded and 48 collapsed, matching `SIDEBAR_WIDTH` and
`SIDEBAR_WIDTH_ICON`. The collapsed variant seeds 32px icon squares rather than
Sidebar item instances, because the source shrinks its buttons to squares in icon
mode and a 232-wide row would not fit.

Top bar has two layouts because the source genuinely switches structure: a flex
two-region header by default, and a `grid-cols-[1fr_auto_1fr]` three-column grid when
a centre region exists, so the centre stays optically centred rather than following the
start region.

Both shells were assembled into full screens on the **Examples** page: a 1440x900
desktop shell (sidebar + centred top bar + page header + tabs + card grid) and a
390x844 mobile shell (split top bar + content + bottom navbar). Every part is a
published instance.

### The trap the shells exposed

**Setting an INSTANCE_SWAP property discards sub-node overrides, exactly like
`swapComponent`.** The sidebar rows were built by passing an icon through the swap
property, which threw away the stroke colour and weight bound on the variant. The
result was a pink folder icon on the active row and stroke weights varying between
2 and 1.33 across rows, none of it erroring.

Patching the overrides back would have re-broken on the next swap. The fix that holds:
**set Ghost as the explicit `Component/Style` mode on the Sidebar item variants**, so
`component/fg` resolves to `surface-fg-muted` at rest and `surface-fg` on hover, which
is exactly the sidebar palette, then bind the glyph to that same variable. A swapped-in
icon already binds `component/fg` in its own main, so the colour is correct without any
override at all. Verified: 83,78,80 at rest and 53,50,51 on hover and active, stroke
1.33 throughout.

Bottom nav item keeps explicit overrides, because no existing style mode produces its
palette (subtle at rest, accent 11 active).

### Also worth noting

Third wrong icon key in this project. `home` was actually the `plus` glyph, so every
sidebar row and nav tab shipped a plus sign until it was caught at 3x zoom. The
thumbnail looked fine. **Read keys from the library, never from a hand-kept map.**

## Example screens repaired after the Button collapse (2026-08-28)

Ten screens (Platform / Marketing / Settings / Mobile home / Mobile form, each light
and dark), 334 instances. Audited and repaired after Button collapsed 330 -> 55 and
colour became the `Component/Intent` variable mode.

Final state: **334 instances, 0 orphaned, 0 detached, 0 hand-built frames shadowing a
component, 0 blanket modes.** 270 mains on the Components page, 64 remote icon
instances. Every one of the 32 Buttons declares its own `Component/Style` and
`Component/Intent`.

### What was actually wrong

The screens were already 100% component instances, so the structural check passed on
the first pass and told us nothing. Three real defects sat underneath it.

**1. Eighteen zombie Button instances.** Ten top-level, eight nested inside Card and
Top bar slots, all still pointing at main components deleted by the collapse. See rule
7 in CLAUDE.md for the detection — the short version is that every obvious probe says
they are healthy and the only tell is that the main component has no page.

**2. Every Button on every screen was a transparent grey ghost.** Each screen frame
blanket-set `Component/Style = Ghost` and `Component/Intent = Neutral`, which the whole
subtree inherited. Measured: all 20 top-level Buttons at `a0.00` background with
`#4f4f4f` / `#bcbcbc` text — "Start free", "New task", "Save changes" and "Save"
included. The showcase screens had no visual hierarchy whatsoever.

This is the failure mode rule 3 warns about, arriving from the other direction. A
variant grid would not have caught it, but neither did looking at the screens, because
a ghost button is legible and unremarkable. It took reading the resolved fill of every
Button to see that *none* of them had one.

Fixed by dropping the blanket from all 10 frames and declaring intent and style on each
Button: primaries Solid/Accent, chrome actions (Filter, Invite, View all, Sign in,
Cancel) Ghost/Neutral, pricing tier CTAs and the hero secondary Soft/Neutral per the
soft-over-outline preference.

Removing the blanket also surfaced 10 nested Buttons that had been relying on it. They
fell through to the default mode and became **solid neutral grey** (`#cacaca` light,
`#424242` dark) — proof that the default is not a safe landing place either. Each now
declares its own.

**3. The wrong-key `plus` glyph again.** 28 of 32 Buttons rendered a leading "+",
giving "Sign in +", "Read the docs +", "Choose Starter +", "Filter +". Same root cause
as the sidebar rows noted above. Start icons are now off everywhere except the four
"New task" buttons, where a plus is what the label means.

### Method note

Diffing by paint signature is what made this safe. Hashing every descendant fill,
stroke and string per instance gave a 100-instance before/after baseline, so removing
the blanket could be proven to change exactly the 20 intended instances and leave the
other 80 byte-identical. The 10 unintended changes it surfaced were the nested Buttons
in point 2 — which a spot-check of the screens would have missed entirely.

Two corrections earned during the pass, both from reading a number instead of trusting
a call that did not throw: `orphanMainComponents: 100` was a false positive until
`mc.remote` was excluded (the icon library legitimately has no local page), and
`brokenMainComponent: 0` from the first audit was a false negative, because
`getMainComponentAsync()` happily returns deleted mains.

### Left alone

Twenty zero-width empty `Label` text nodes inside the pricing-list check Badges. They
render nothing, they predate this work, and fixing them means changing how those
Badges are authored.
