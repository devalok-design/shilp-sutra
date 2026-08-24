# Figma Build Playbook — mechanics, traps and verification

**Date**: 2026-08-18
**Companion to**: [`2026-08-18-figma-library-build-plan.md`](./2026-08-18-figma-library-build-plan.md) — that doc holds *decisions*, this one holds *how to actually build without shipping something quietly wrong*.
**Status**: derived from building Button end-to-end as a spike. Every item below was measured, not assumed.

Read this before building any component. Most entries exist because something looked correct and wasn't.

---

## 1. The meta-lesson

**A variant grid hides bugs. A real scenario exposes them.**

Building Button as a 5×5 grid produced 25 buttons that all looked right. Dropping the same component into a dialog, a form footer and an empty state immediately exposed that every button was locked at a fixed width — because in a grid every label is the same length, so nothing ever needed to grow.

Corollary: **measure, don't eyeball.** Several bugs read as fine at a glance and only fell out of `absoluteBoundingBox` arithmetic — the focus ring was 32px too narrow while looking plausible, and an icon bound "correctly" rendered at 0.9% opacity.

Build order that works:

```
read the source  →  build one component  →  drop it into 3–4 real scenarios
       →  measure geometry against the CSS  →  sweep the permutations  →  only then scale
```

---

## 2. Plugin API traps

Each of these cost real time. Symptom first, since that's how you'll meet them.

### resize() silently resets sizing mode
**Symptom:** every instance is the same width; long labels clip.
**Cause:** `resize()` sets `primaryAxisSizingMode = 'FIXED'`. Calling it *after* setting `'AUTO'` undoes the AUTO.
**Fix:** `resize()` first, then set sizing modes. Verify with `[...new Set(children.map(c => c.width))]` — if a variant set returns a single width, it isn't hugging.

### OPACITY-scoped variables are percent, not 0–1
**Symptom:** an element bound to an opacity variable is invisible, but the API reports the binding as present and correct.
**Cause:** `node.opacity` is 0–1. A variable scoped `OPACITY` is **0–100**. Setting `0.9` resolves to an opacity of `0.009`.
**Fix:** store `90`, not `0.9`. Always read back `node.opacity` after binding.

### Constraints bake against the parent's size at the moment you set them
**Symptom:** an absolutely-positioned overlay tracks the parent but with a constant wrong offset.
**Cause:** `STRETCH` preserves the insets that existed when it was applied. Sizing the child before the parent has settled its width bakes in garbage.
**Fix:** `appendChild` → `layoutPositioning='ABSOLUTE'` → `constraints` → `resize(parent.width + n)` → position. Size from the parent's *current* width, never a literal.

### createAutoLayout() frames clip by default
**Symptom:** anything overflowing a container is cut off — focus rings, overflowing icons, shadows.
**Cause:** new frames default to `clipsContent = true`.
**Fix:** `clipsContent = false` on any frame whose children intentionally overflow, **including test harnesses**. A clipped harness will make you debug a component that is fine.

### ALL_FILLS is exclusive — and primitives should have no scopes at all
**Symptom:** `in set_scopes: If ALL_FILLS is set, other fill scopes cannot be set` — thrown, not normalised.
**Cause:** `ALL_FILLS` already covers `FRAME_FILL`, `SHAPE_FILL` and `TEXT_FILL`. Adding any of them alongside it is invalid.
**Scale of the near-miss:** `figma-build-foundation.mjs` emitted `['ALL_FILLS','TEXT_FILL','STROKE_COLOR','EFFECT_COLOR']` for all 179 primitives and `['TEXT_FILL','ALL_FILLS']` for 15 semantics — **194 of 358 variables would have thrown**, and since scripts are atomic the whole Phase 1 build would have failed.
**Fix (applied):** primitives get `scopes: []` — hidden from every picker, because the semantic layer is the public API and designers should never reach a raw ramp step. Semantics get role-targeted scopes, driven by the 12-step purposes documented in `src/tokens/generate-scale.ts`:

```
1–2  app / subtle background     FRAME_FILL, SHAPE_FILL
3–5  component bg / hover / active
6–8  borders                     STROKE_COLOR
9–10 solid / solid hover         FRAME_FILL, SHAPE_FILL
11–12 low / high contrast text   TEXT_FILL
*-fg, *-fg-muted …               TEXT_FILL
*-border*                        STROKE_COLOR
shadow/*                         EFFECT_COLOR
```

Result after the fix: 179 primitives at `[]`, 66 fills, 26 text, 20 stroke, **zero illegal combinations**.

### Pages load lazily — `page.children` lies until you visit the page
**Symptom:** an audit reports a page as empty when it demonstrably has content.
**Cause:** Figma loads pages on demand. `page.children` is `[]` for any page that has not been made current in this script run.
**Fix:** read by node id (`getNodeByIdAsync` works regardless of page), or fan out one `use_figma` call per page. Do **not** loop `setCurrentPageAsync` inside one script to work around it.
**Why it matters:** this reads as "the content is missing", which is exactly the panic-inducing false negative an audit should never produce.

### BOOLEAN variables cannot be scoped at all
**Symptom:** `in set_scopes: Invalid scope for this variable type`, even when assigning `[]`.
**Cause:** Figma does not support scopes on BOOLEAN variables. They also report `ALL_SCOPES` permanently, which a naive hygiene check flags as a violation forever.
**Fix:** skip `resolvedType === 'BOOLEAN'` in any scope-setting or scope-auditing pass.

### FLOAT variables are f32 — never compare them exactly
**Symptom:** a value written as `0.19` reads back as `0.1899999976158142`, so every untouched token looks changed.
**Fix:** compare at the precision the source file writes (hue 1dp, chroma 4dp, corrections 3dp). An exact or `1e-9` comparison reports the whole palette as drifted.

### Deleting a component removes its instances — snapshot ids first
**Symptom:** `Error: in get_name: The node with id "X" does not exist` while iterating children.
**Fix:** snapshot `{id, name}` up front, then re-fetch with `getNodeByIdAsync` and guard on `node.removed`.

### componentPropertyReferences rejects null
Use `{}` to clear, not `null`, despite what the typings imply.

### Variant children can't expose componentPropertyDefinitions
Only the **set** can. `deleteComponentProperty` must be called on the set, not on a variant.

### layoutWrap requires HORIZONTAL
`layoutWrap = 'WRAP'` throws on a VERTICAL auto-layout.

### INSTANCE_SWAP defaultValue is a node id; preferredValues take keys
`addComponentProperty(name, 'INSTANCE_SWAP', component.id, { preferredValues: [{type:'COMPONENT', key}] })`. Passing `.key` as the default value throws "Property value is incompatible".

### Failed scripts are atomic
A thrown error means **nothing** was applied. Fix and re-run; there is no partial state to clean up.

---

## 3. Layout tricks that make "impossible" things possible

Twice a mapping looked unrepresentable and wasn't. Assume a trick exists before accepting a divergence.

### Negative margins → an overflowing slot
CSS `-ml-1.5` on an icon has no Figma equivalent. But an icon slot **narrower than its glyph**, with the glyph overflowing, reproduces it exactly:

```
slot width = iconSize − inset        glyph local x = −inset   (start icon)
                                     glyph local x =  0       (end icon)
```

Measured against the CSS at md (pad 16, gap 8, icon 18, inset 6): icon start 10, icon end 28, label start 36 — **identical**. Hide the slot and padding returns to a clean 16, so a plain BOOLEAN drives it.

Requires `clipsContent = false` on the slot. Slot width is conveniently **12px at every size tier** (14−2, 16−4, 18−6, 20−8).

The earlier failed attempt centred the glyph in the slot, which does break the icon↔label gap. Right-aligned, it doesn't.

### Mutually exclusive props → a state variant, not two booleans
Two booleans can always both be on. If the code says "A replaces B", a boolean pair cannot express it. Make it a **state variant** and drop the competing property's reference inside that variant — then the illegal combination is structurally unreachable, not merely discouraged.

### A variant that needs a mode-driven value → set the mode on the variant
A variant component can call `setExplicitVariableModeForCollection` on itself. That is the bridge between "designer picks from a dropdown" and "value comes from a mode": Colour is a variant in the UI, but each Colour variant carries its Intent mode internally. Explicit for the designer, no cascade risk, zero extra variables.

---

## 4. What maps to what

| Code concept | Figma mechanism | Why |
|---|---|---|
| Union prop that changes colour only | **Mode** | Zero variant cost; cascades for theming |
| Union prop with semantic meaning (intent) | **Variant** | Must be visible on the instance; must not cascade |
| Union prop that changes structure | **Variant** | Modes can't add or remove children |
| Interactive state | **Variant** | Exclusive by nature; often changes several properties at once |
| Optional child (icon) | **BOOLEAN + INSTANCE_SWAP** | The canonical pair; there is no single "optional instance" type |
| Prop that only changes layout sizing (`fullWidth`) | **Nothing** — document it | Designers set the instance to Fill container |
| Behaviour (async, processing, transitions) | **Nothing** — document it | Not representable statically |
| Browser-owned state (`focus-visible`) | **Nothing** | Code handles it; designers don't mock it |

**Booleans can only toggle `visible`.** They cannot change padding, colour, size or radius. If a prop needs any of those, it is a variant or a mode.

---

## 4b. Parsing the token CSS — three traps that silently drop tokens

All three were live in `figma-sync-tokens.mjs` and each one lost data without erroring.

**A selector can appear more than once.** `semantic.css` has **four** `:root` blocks. `css.indexOf(selector)` or a non-global regex reads the first and stops, which dropped **25 real tokens** including every `--border-width-*` and `--border-focus-*`. Those then never reached Figma. Collect *all* matching blocks and merge.

**`.dark` appeared first inside a comment.** Line 34 reads ``The `.dark { }` block below overrides…``. An unanchored `indexOf` matched the comment and parsed its braces, so **all 50 dark-mode overrides silently vanished** and `darkOverrides` came back empty. Anchor the selector to a line start.

**Colour tokens are not in `:root`.** This is Tailwind 4: they live in `@theme { }`. A parser reading `:root` for colours returns nothing and reports "no changes" rather than failing.

The shape of all three is the same: a parser that finds nothing returns `{}`, and `{}` reads as "no differences". **Any script that compares two sources must assert it compared a plausible number of things** and fail loudly when it did not. `verify-parity.mjs` has a `MIN_EXPECTED` guard for exactly this, added after it reported "in parity" while comparing zero values.

## 4c. Ramp step numbers are not always contiguous

`amber-bright` has steps **2,3,4,5,6,7,9,10,11** — nine values, but not 1–9. A payload generator using `.filter(Boolean)` collapsed the gaps and shifted every value onto the wrong step number, which looks completely normal in a swatch grid. Check `steps.length === 12 && steps[0] === 1` before assuming a ramp is standard.

## 5. Per-component pre-build audit

Do all of this **before** writing any `use_figma`.

1. **Regenerate the spec** — `node packages/core/scripts/figma-sync-components.mjs <name>`. The cached JSON goes stale: Button's was missing 5 compound rules and pointed at superseded radius and text tokens.
2. **Read the component body**, not just the CVA. The CVA gives appearance per variant; the body gives prop *interactions*. For Button those were: spinner replaces icon, loading implies disabled, icons dim to 90%, spinner is a size smaller than the icon.
3. **Resolve the real token values** — chase aliases to hex, and note where the pattern breaks. `solid+neutral` uses `neutral-5`, not step-9; `ghost` ignores intent entirely. Never assume a formula.
4. **Check the base class string** for state and a11y rules (`disabled:`, `focus-visible:`, `active:`) — they don't appear in the CVA axes.
5. **List what won't be modelled** and why, then put it in the component `description`.

---

## 6. Verification protocol

After building, before declaring done:

- [ ] Widths vary with label length — `[...new Set(variants.map(v => v.width))].length > 1`
- [ ] Geometry measured against the CSS, not eyeballed — compare `absoluteBoundingBox` offsets to the computed values
- [ ] Every bound value read back — especially opacity, which fails silently
- [ ] Placed in 3–4 realistic scenarios with **varied** copy
- [ ] Permutation sweep over the interacting props, with the illegal combinations attempted
- [ ] Test harness has `clipsContent = false`
- [ ] `description` records the source path and every known divergence

---

## 7. Icon system mechanics

Full reasoning in the plan doc (D7). The operational facts:

- Icon colour must live in the icon's **main component**. An instance override cannot survive a swap to an icon with a different number of vectors — and 39 of our 48 most-used icons are multi-path.
- This is only possible because we own an **editable, flattened copy** (`Vst4WnV0LYfRZdC1dc7qv6`, 4,962 components, uniformly one vector each). The public community library is not flattened and cannot work.
- Cross-file binding needs the source library **published first** — variables can only be imported from a published library, and both files must sit in the same team.
- **Resizing scales geometry, not stroke.** Set `strokeWeight` explicitly per size tier. This override is safe here only because every icon has exactly one vector.
- Rendered stroke is `tierStroke × size / 24`, since Tabler keeps `viewBox="0 0 24 24"` and only changes width/height.
- Fill-based icons exist — 332 of 4,962 are filled variants needing their **fill** bound rather than a stroke. Audit for both.

---

## 8. Known non-representable things

Record these in component descriptions rather than faking them:

| Code | Why Figma can't |
|---|---|
| `saturate(0.3)` on disabled | No saturation filter on nodes |
| `transition` / `duration` / easing | Static medium |
| `active:scale-[0.95]`, `brightness`, async feedback | Behavioural |
| `pillPaddingClass` delta | Padding varies by Size variant; a mode can't express a delta |
| Spinner inset when no icon was present | One combination out of four; 6px |

---

## 9. Session log — what this cost

Ten issues found while specifying a single component. Listed so the next person budgets realistically:

fixed-width instances · icon inset wrongly declared impossible · stale cached spec · loading modelled as a boolean · `dimIcon` missed · spinner sized as the icon · opacity variables in percent · focus ring sized against a stale parent · pill ring radius not following shape · test harness clipping.

Four of them (**loading, dimIcon, spinner size, opacity percent**) were silent — the build looked correct and was not. Assume a comparable count per component until proven otherwise, and assume the grid won't show them.

---

## Phase 3 traps (added 2026-08-19)

Symptom first, as above. Every one of these produced output that looked plausible.

### Every avatar renders as a narrow vertical capsule

`resize()` and then `layoutMode` leaves **both axes AUTO**, so the frame hugs its
content instead of keeping the size you just gave it.

**Corrected 2026-08-20 — the order below is what I first wrote here, and it is wrong.**
Measured on the live API:

| Sequence | `primaryAxisSizingMode` after |
|---|---|
| set `'AUTO'`, then `resize()` | **`'FIXED'`** |
| `resize()`, then set `'AUTO'` | `'AUTO'` |
| set `layoutSizingVertical='HUG'`, then `resize()` | **`'FIXED'`** |

`resize()` resets the axis modes **and** the `layoutSizing*` shorthand. So the one
safe order is layout, then resize, then sizing:

```js
frame.layoutMode = 'HORIZONTAL'        // 1. layout mode first: nothing else applies before it
frame.resize(w, h)                     // 2. resize SECOND, with real values (never 0 or 1)
frame.primaryAxisSizingMode = 'AUTO'   // 3. sizing modes LAST, so they survive
frame.counterAxisSizingMode = 'FIXED'
```

Order only looks irrelevant when every axis ends up `FIXED`, which is why the wrong
version appeared to fix the Avatar bug. It silently breaks any axis meant to hug.

### An audit destroys the thing it is auditing

Writing `.visible` on a node whose visibility is bound to a variable **silently
clears the binding**. A traversal that reveals hidden slots so it can inspect them
will therefore un-bind them all. 264 of 330 Button spinner slots lost
`btn/spinner-visible` this way, and nothing errored.

Any walk must check first and skip:

```js
if (!child.visible && child.boundVariables && child.boundVariables.visible) continue
```

### `findAll` returns zero vectors and the guarded write no-ops

**Instances inside a hidden subtree expose no children.** `instance.children` is
empty, so `findAll(n => n.type === 'VECTOR')` finds nothing and the usual
`if (vec) vec.strokes = ...` guard turns into a skip you never see.

Set values while the slot is still visible (build the slot, write the glyph, hide
it afterwards), or reveal deliberately, subject to the trap above.

Related: **instance `.children` omits hidden children entirely**, so a lookup that
works against a component returns `null` against its instance. A probe that reported
`MISSING` for a spinner slot was measuring this, not a real fault.

### `in set_scopes: Invalid scope for this variable type`

`OPACITY` is not a valid scope in this API version. Internal floats take `[]`.

**BOOLEAN variables reject every scope, including `[]`**, so they always report as
`ALL_SCOPES`. Guard the assignment rather than trying to clear it, and expect those
entries in any scope audit.

### Percentage tokens cannot be bound at all

Figma reads a float bound to `lineHeight` or `letterSpacing` as an **absolute unit**.
Binding a `leading/relaxed = 150` token produced a **150 pixel** line height on a
12 pixel caption, across all 20 text styles, and looked fine in the layer panel.

Leading and tracking must be set explicitly as `{unit:'PERCENT', value}`. Font size
binds correctly, because it is already absolute.

### Icons come back the wrong glyph

Component keys held in a constant drift. The key being used for `x` was in fact
`search`, so every Badge dismiss button was a magnifying glass. Read the library and
look names up rather than trusting a hardcoded map:

```js
const all = figma.root.findAllWithCriteria({ types: ['COMPONENT'] })
```

`swapComponent` also **resets sub-node overrides**, so re-apply stroke colour and
weight after every swap.

### Naming

`combineAsVariants` merges component properties **by name**. Identical names across
templates unify into one property on the set; differing names stay per-variant. Name
deliberately.

---

## Native slots (added 2026-08-20)

### Symptom: "instances cannot hold content"

`instance.children[0].remove()` throws `Removing this node is not allowed`, so a
component's baked body looks unreplaceable. It is not. Figma has native slots.

```js
const slot = component.createSlot()   // returns a SlotNode, auto-creates a SLOT property
slot.name = 'Content'
slot.layoutMode = 'VERTICAL'          // GRID is rejected on slots
```

In an instance, find and fill them:

```js
const slot = instance.findAllWithCriteria({ types: ['SLOT'] }).find(n => n.name === 'Content')
for (const k of [...slot.children]) k.remove()   // ALLOWED inside a slot
slot.appendChild(anything)
```

`instance.setProperties({ [slotKey]: ... })` throws. Slot content is set by
appending, never through properties.

### The trap that costs a rebuild

**Slots created on variants AFTER `combineAsVariants` do not merge.** Each variant
gets its own property, so Card ended up with twelve `Content#…` / `Footer#…`
properties, and dropped content would vanish on every Size change.

Create the slot on each template **before** combining. Then they merge by name into
one property, and content survives a variant switch.

```js
// per template, before combineAsVariants
const slot = tmpl.createSlot(); slot.name = 'Content'
...
figma.combineAsVariants(templates, page)   // one SLOT property, not N
```

### Useful behaviours

- Content placed in the **component's** slot becomes the **instance default**, so a
  slotted component still reads as a specimen out of the box.
- `slotNode.resetSlot()` returns to that default, not to empty.
- A slot can be reparented into a nested frame and still resolves from instances.
- Variables bind on slot nodes, including padding and item spacing.
- `findAllWithCriteria({types:['SLOT']})` works on plain components and instances. It
  returned 0 on a variant whose slot had been reparented, so prefer creating the slot
  in its final parent.

---

## The default variant is geometry, not a setting (added 2026-08-20)

`componentSet.defaultVariant` is **read-only**. Figma derives it from position: it is
the **top-left-most variant, spatially**. That variant is what every consumer gets
when they drag your component out of the Assets panel.

Which means **your grid layout silently decides your library's public default**, and
a tidy ascending grid gets it wrong. Ours did. Eighteen of twenty-five sets handed
the designer the smallest size, because `xs` and `sm` sort first:

| Set | Was | Should be |
|---|---|---|
| Button | `Size=xs, Color=accent, State=Default` | `Size=md, …` |
| Input, Textarea, Select, Combobox, Badge, Avatar | `Size=xs, …` | `Size=md, …` |
| Checkbox, Radio, Switch, Slider, Progress, Alert, Card, Tabs, Tab item, Segment item, Segmented control | `Size=sm, …` | `Size=md, …` |

The fix is a **position swap**, not a re-sort: exchange the coordinates of the target
variant and whatever currently sits at the minimum (x, y). Two cells move, the grid
stays readable, and the default becomes correct.

```js
let topLeft = null
for (const v of set.children)
  if (!topLeft || v.y < topLeft.y || (v.y === topLeft.y && v.x < topLeft.x)) topLeft = v
const want = set.children.find(v => v.name === TARGET)
const wx = want.x, wy = want.y
want.x = topLeft.x; want.y = topLeft.y
topLeft.x = wx;     topLeft.y = wy
```

**Add this to the verification pass on every set**: assert
`set.defaultVariant.name === expectedDefault`. It is silent, it is visible to every
consumer, and no other check catches it.

---

## Probe results, 2026-08-20

Run against the live file. These settle things the docs left open.

**`SlotSettings` round-trips exactly**, via `addComponentProperty(..., {slotSettings})`
and via `editComponentProperty` after `createSlot()`:

```js
{ stretchChildOnInsert, displayEmptyByDefault, minChildren, maxChildren, allowPreferredValuesOnly }
```

- `stretchChildOnInsert` applies **counter-axis FILL** to inserted content. Right for a
  vertical content slot, **wrong for a horizontal action row** (buttons stretch tall).
- `minChildren` / `maxChildren` are **advisory**: violations surface in
  `slotNode.limitViolations`, they never throw.
- `preferredValues` works on SLOT properties and takes `{type:'COMPONENT_SET', key}`.
- Slots also take their own `description`, which is the only per-property prose field
  Figma offers for any property type.

**`documentationLinks` is narrower than our docs claimed.** Both failures are hard errors:

```
[{uri, label}]        -> Property "documentationLinks" failed validation:
                         Unrecognized key(s) in object: 'label' at index 0
[{uri}, {uri}]        -> Documentation links API takes a list of size 0 or 1
```

So: `uri` only, and exactly one link.

**`descriptionMarkdown` works and supersedes `description`.** Writing it replaces the
plain `description` with a flattened version automatically, so set the markdown field
and let the plain one derive. Do not set both.

**`isExposedInstance` does NOT surface props on the parent.** Setting it on a child
instance inside a main component gives `parentInstance.exposedInstances.length === 1`,
but:

- `parentInstance.componentProperties` is **empty**
- `parentInstance.setProperties({ childKey: ... })` throws
  `Could not find a component property with name: 'ChildLabel#…'`

Exposed properties are reachable **only** through
`parentInstance.exposedInstances[0].componentProperties`, and must be set on that
instance. Exposure is a right-panel convenience for humans, not a scripting shortcut.
