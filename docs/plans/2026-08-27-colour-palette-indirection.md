# Colour: replace the per-colour cross-product with a palette slot

**Audit and plan. 2026-08-27. Nothing implemented.**

Today a component supports a colour by having a hand-written row for it. That
makes the number of colours a function of how much code we are willing to write,
which is the wrong thing for it to depend on. This proposes making a component
reference *a* palette rather than *a* colour, so adding a colour costs one token
block instead of N component edits.

Everything below is measured, not recalled. Reproduce with
`scripts/…` equivalents noted inline.

---

## 1. What we do today — three mechanisms, none shared

**Button — a CVA cross-product.** 5 variants × 6 colours = **31 hand-written
`compoundVariants`**, each restating the ramp:

```ts
{ variant: 'solid', color: 'accent', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised' }
{ variant: 'solid', color: 'error',  className: 'bg-error-9  text-error-fg  hover:bg-error-10  shadow-raised' }
```

**Badge — a plain object map.** 14 colours × a 6-slot contract
(`bg / softBg / fg / border / solid / solidFg`), plus a `custom` escape hatch
reading a `--badge-color` CSS variable. This is the only component a consumer can
add a colour to, and it works by bypassing the token system.

**Everything else — ad-hoc.** Alert has 16 compounds; Toast, Dot, Avatar,
Schedule view and others use inline maps or conditionals.

## 2. The cost, in numbers

**46 files** reference two or more colour ramps. They split three ways:

| group | count | what it is | in scope? |
|---|---:|---|---|
| **1. Colour cross-product** | **17** | a colour is *chosen* — Button, Badge, Alert, Toast, Avatar, Dot, … | **yes** |
| 2. Field validation | ~10 | `error`/`warning`/`success` as a *state* — Input, Select, Checkbox, … | no — see §8 |
| 3. Fixed single purpose | ~19 | ErrorBoundary is red because it is an error | no |

Group 1 carries **217 lines that exist only to restate a ramp per colour**:

```
button 29 · split-button 27 · toast 28 · dot 23 · badge 16 · schedule-view 15
alert 14 · avatar 13 · stat-flash 11 · slider 8 · card 6 · banner 5
badge-indicator 5 · activity-feed 5 · button-group 4 · toggle 4 · progress 4
```

It is O(variants × colours) and hand-maintained. A 7th Button colour is 5 new
rows; a 6th variant is 6 new rows. **A consumer cannot add a Button colour at
all** — the prop is a closed union.

### Figma is worse, because it multiplies

| set | variants | colour axis | if colour were a variable mode |
|---|---:|---:|---:|
| Button | 330 | 6 | **55** |
| Badge | 56 | 14 | 4 |
| Alert | 15 | 5 | 3 |
| Slider | 12 | 4 | 3 |
| Progress | 12 | 4 | 3 |
| Toast | 6 | 6 | 1 |
| **total** | **431** | | **69** |

**362 variants — 46% of the entire 780-variant library — exist only to enumerate
colour.**

## 3. The capacity is already built and not exposed

This is the finding that changes the cost estimate.

`primitives.css` carries **13 complete 12-step ramps**: yellow, teal, slate, red,
purple, pink, orange, indigo, green, emerald, cyan, blue, amber (plus neutral).

The semantic layer exposes them unevenly:

| tier | steps exposed | colours |
|---|---|---|
| full | **12** | accent→pink, secondary→purple, error→red, success→green, warning→amber-bright, info→blue, neutral |
| "category" | **6** — only `2, 3, 4, 7, 9, 11` | teal, amber, slate, indigo, cyan, orange, emerald |

So **the 6-step subset is an arbitrary semantic-layer restriction, not a data
limitation.** Every category colour already has steps 1, 5, 6, 8, 10 and 12
sitting unused in primitives.

It also explains the current asymmetry exactly: **Badge supports 14 colours and
Button supports 6** because Badge only needs `2,3,4,9,11` and Button reaches for
`5` and `10`, which category ramps do not expose.

## 4. The slot contract

Union of every step group 1 actually uses: `2, 3, 4, 5, 6, 7, 9, 10, 11` + the
on-solid foreground. Ten slots. Steps 1, 8 and 12 are unused by any component.

Mapping them to roles, using Radix scale semantics:

| role | step | used by |
|---|---:|---|
| `palette-subtle` | 2 | Badge subtle bg, Alert bg, Toggle bg, Card tint |
| `palette-soft` | 3 | Button soft bg, Avatar fallback, Banner bg |
| `palette-soft-hover` | 4 | Button soft hover, Badge border |
| `palette-soft-active` | 5 | Button soft active, ButtonGroup |
| `palette-border-subtle` | 6 | SplitButton divider |
| `palette-border` | 7 | Alert/Card border, Slider track, Avatar ring |
| `palette-solid` | 9 | every solid fill |
| `palette-solid-hover` | 10 | Button solid hover |
| `palette-text` | 11 | every coloured text |
| `palette-contrast` | `-fg` | text **on** solid |

Registering a colour means supplying these ten. Chakra ships 7, Radix exposes all
12; ten is what our own components demand.

### `neutral` is why this must be roles, not raw steps

Steps 1, 8 and 12 are unused by any **chromatic** ramp in group 1. But `neutral`
— which is offered as a colour option on Button, Badge, Dot, ButtonGroup and
SplitButton — does not follow the mapping at all:

```
Button neutral solid:  bg-neutral-5 text-surface-fg hover:bg-neutral-7    ← not 9/10/-fg
Button neutral soft:   bg-surface-panel-hover text-surface-fg-muted       ← no ramp at all
Badge  neutral:        bg-surface-panel-hover · text-surface-fg-muted
                       · border-surface-border-strong                     ← entirely surface tokens
Dot    neutral:        bg-neutral-8
```

Its solid is step **5**, not 9, because `neutral-9` is a mid grey that reads as
disabled rather than as a filled control. Its contrast is `surface-fg`, not a
ramp foreground. Half its slots point into the **surface** family, which is a
different token tree entirely.

Under a raw `palette-1..12` scheme, `neutral` would have to claim
`--color-palette-9: var(--color-neutral-5)` — the token name would be a lie, and
the next person to read it would "fix" it. Under named roles it is honest and
needs no special case in any component:

```css
[data-palette='neutral'] {
  --color-palette-solid:        var(--color-neutral-5);
  --color-palette-solid-hover:  var(--color-neutral-7);
  --color-palette-contrast:     var(--color-surface-fg);
  --color-palette-soft:         var(--color-surface-panel-hover);
  --color-palette-soft-hover:   var(--color-surface-panel-active);
  --color-palette-text:         var(--color-surface-fg-muted);
  --color-palette-border:       var(--color-surface-border-strong);
}
```

**This resolves open question 1: named roles.** A palette is a contract of ten
roles, and where those roles resolve from is the palette's business. That is also
what lets a consumer register a palette built on their own tokens rather than on
a 12-step ramp they may not have.

Alpha overlays survive unchanged — `bg-warning-11/20` in SplitButton's divider
becomes `bg-palette-text/20`.

## 5. Mechanism (Tailwind 4)

TW4 supports this natively, and the required shape is the one we already use:
`@theme` **declares**, ordinary selectors **assign**.

```css
/* semantic.css — @theme. Declaring generates bg-palette-solid, text-palette-text, … */
@theme {
  --color-palette-subtle:       var(--color-accent-2);   /* default = accent */
  --color-palette-soft:         var(--color-accent-3);
  --color-palette-soft-hover:   var(--color-accent-4);
  --color-palette-soft-active:  var(--color-accent-5);
  --color-palette-border-subtle:var(--color-accent-6);
  --color-palette-border:       var(--color-accent-7);
  --color-palette-solid:        var(--color-accent-9);
  --color-palette-solid-hover:  var(--color-accent-10);
  --color-palette-text:         var(--color-accent-11);
  --color-palette-contrast:     var(--color-accent-fg);
}

/* palettes.css — ordinary selectors, one block per colour */
[data-palette='error'] {
  --color-palette-subtle:      var(--color-error-2);
  /* … the other nine … */
}
```

Button's 31 compounds become 5:

```ts
{ variant: 'solid',   className: 'bg-palette-solid text-palette-contrast hover:bg-palette-solid-hover shadow-raised' }
{ variant: 'soft',    className: 'bg-palette-soft text-palette-text hover:bg-palette-soft-hover active:bg-palette-soft-active' }
{ variant: 'outline', className: 'border-palette-border text-palette-text hover:bg-palette-soft' }
{ variant: 'ghost',   className: 'text-palette-text hover:bg-palette-soft' }
{ variant: 'link',    className: 'text-palette-text underline-offset-4 hover:underline' }
```

Because the assignment is a plain CSS selector, it **cascades** — a
`data-palette` on a section themes everything inside it, which is how Radix
Themes' `accentColor` and Chakra's `colorPalette` both behave.

## 6. The public API does not break

`color` stays. It stops being a CVA axis and becomes `data-palette`:

```tsx
<Button color="error">        // unchanged
<Button color="teal">         // new — impossible today
<Button color="brand-purple"> // new — consumer-registered
```

The prop type goes from a 6-member union to *union | (string & {})*. Under our
own rule (CLAUDE.md, 0.40.0) that is a **widening**, so **non-breaking**. Badge's
`color="custom"` + `--badge-color` hack is superseded and can be deprecated.

## 7. Risks, honestly

**Contrast is the real one.** Every solid pairing we ship is measured — that was
the whole 0.57.0 accessibility pass. An arbitrary consumer palette can fail AA on
`palette-solid` and nothing would catch it.

**Decided: gate what we ship, derive for what we don't.** Two tiers, not one.

*Built-in palettes* declare `palette-contrast` explicitly — hand-picked, never
derived — and `scripts/audit-contrast.mjs` is extended to iterate every
registered palette instead of a fixed pairing list. That is strictly stronger
than today, where the gate checks a hardcoded set.

*Consumer palettes* get an automatic derivation as the default, so the failure
mode is "slightly blunt" rather than "unreadable". CSS relative colour syntax
does this natively:

```css
--color-palette-contrast: oklch(from var(--color-palette-solid)
                                clamp(0, (0.62 - l) * 1000, 1) 0 0);
```

Lightness above the threshold yields black, below yields white. Supported in
Chrome 111+, Safari 15.4+ and Firefox 113+ (~93–95%), so it needs a static
fallback declared before it — a plain `@supports` guard is enough.
`contrast-color()` would be the purpose-built answer but is Safari 26+ only, so
not yet.

The author can always override the derived value, and the recipe states plainly
that a consumer-registered palette is outside our measured guarantee.

Worth noting the reference systems disagree here: **Chakra requires** the author
to supply `contrast`, and **shadcn's whole convention is paired** — every
`--primary` ships a `--primary-foreground`. Deriving is the more forgiving
choice, and it is only the default, not the rule.

**Figma caps at 10 modes** — measured, `addMode` throws *"Limited to 10 modes
only"* on the 11th. Plan-dependent: Enterprise allows 40. See §7a, which
concludes this constrains exactly one component.

### 7a. Figma: the ceiling constrains exactly one component

The first framing of this section asked "what do we do about Badge's 14 colours
exceeding 10 modes". That was the wrong question — it accepted a limitation
instead of checking whether it applied.

**A colour costs a component the product of its *other* axes.**

| set | other axes | variants per colour | today | if colour → mode |
|---|---|---:|---|---:|
| **Button** | Size 11 × State 5 | **55** | 6 → 330 | 55 |
| Badge | Size 4 | **4** | 14 → 56 | 4 |
| Alert | Size 3 | 3 | 5 → 15 | 3 |
| Slider | Size 3 | 3 | 4 → 12 | 3 |
| Progress | Size 3 | 3 | 4 → 12 | 3 |
| Toast | — | 1 | 6 → 6 | 1 |

Only Button is expensive. Badge carrying 30 colours would cost 120 variants,
which is less than Button costs for six.

**So the rule is: take the mode trade only where the variant reduction is large.**
Everywhere else keep enumerating — a variant axis has no ceiling, so a designer
can add as many Badge colours as they want, which is the behaviour we actually
want and already have.

Concretely:

- **Button** → colour becomes a variable mode. 330 → 55. Capped at 10 palettes in
  Figma; unlimited in code. This is the one place design and code diverge, and it
  needs a `docs/deviations.md` entry.
- **Badge, Alert, Slider, Progress, Toast** → colour stays a variant axis,
  binding directly to each palette's tokens as they do today. Unlimited, cheap,
  no ceiling, no divergence.

Note the subtlety that makes this work: a Figma colour *variant* is only capped
if its job is "select a palette mode". If it binds straight to that colour's own
variables, there is no cap. Enumerating is the unlimited option in Figma; the
indirection is the cheap one. They are opposite trades and we should use each
where it wins.

Two ways to remove even Button's ceiling, both out of scope here but worth
recording: **Enterprise** raises modes 10 → 40, and **Button's 5-value `State`
axis** is itself worth auditing — dropping it would take cost-per-colour from 55
to 11 and let Button enumerate too.

**A cascading palette is a footgun.** `data-palette` inherits, so an error
palette on a container silently recolours a nested neutral button.

The three reference systems do not agree, and the disagreement is informative:

| system | mechanism | cascades? |
|---|---|---|
| **Chakra v3** | `colorPalette` prop → CSS variables | **yes**, at any DOM depth |
| **Radix Themes** | `[data-accent-color]` attribute | **yes**, nested components inherit |
| **shadcn** | none — `bg-primary` baked per variant | **n/a** |

shadcn is the interesting one: it has **no colour prop at all**. Components hard-code
`bg-primary text-primary-foreground` / `bg-destructive text-destructive-foreground`,
and rebranding means redefining `--primary` globally. It sidesteps the question
by never letting a component choose — which is the strictest possible reading of
the Polaris/Material "components get roles, not colours" position.

That is not available to us: we already ship `color` on six components and 14
Badge colours, so the choice is between the two systems that *do* cascade. Both
chose to. Recommendation is to cascade and document it, with `data-palette` on a
component always winning over an inherited one — the same precedence a designer
expects from a nested variable mode in Figma.

**`palette-*` is a new public token namespace.** Once shipped, consumers depend on
those ten names. Getting the contract right matters more than shipping it fast —
renaming later is a real break.

## 8. Deliberately out of scope

**Field validation state** (Input, Select, Checkbox, Radio, Switch, Textarea,
NumberInput, Combobox, Form, InputOTP — ~10 components). They use
`error/warning/success` at step 7 as a *border tint keyed to validation*, not as a
user colour choice. Same tokens, different concept. Folding them in would let
someone write `<Input state="teal">`, which is meaningless. They can move to a
separate `--color-field-border-*` indirection later if it earns its keep.

**Group 3** — components whose colour is their meaning. ErrorBoundary is red
because it is an error.

## 8a. Figma spike — done 2026-08-27, on `Palette spike — 27 Aug`

Step 2 of the sequence below, executed. Two outcomes: the reduction works, and it
surfaced a shipped bug.

### The palette collection already exists

`Component/Intent` has 6 modes and **13 named role variables** —
`x/solid-bg`, `x/solid-fg`, `x/solid-bg-hover`, `x/soft-bg`, `x/soft-fg`,
`x/soft-bg-hover`, `x/soft-bg-active`, `x/border`, `x/outline-fg`,
`x/ghost-fg`, `x/ghost-fg-hover`, `x/ghost-bg-hover`, `x/ghost-bg-active`.

It already special-cases `neutral` exactly as §4 argues it must
(`solid-bg → neutral/5`, `solid-fg → surface-fg`, `soft-bg → surface-panel-hover`).
`Component/Style` chains on top of it. **Figma solved this before code did**, and
independently reached the named-role answer.

Every Button variant carries `explicitVariableModes: Component/Intent=<Colour>`.
**So the Color axis exists only to pin a mode** — the colour system is already
mode-driven and the six colour variants are pure bookkeeping.

### 330 → 55, measured

On a clone: deleted the 275 non-accent variants, dropped `Color=` from the
remaining names, and cleared the pinned Intent mode.

| | |
|---|---|
| variants | 330 → **55** (`Size 11 × State 5`) |
| axes | `Size(11) · Color(6) · State(5)` → `Size(11) · State(5)` |
| instances rendering correctly | **30** (6 intents × 5 styles), all from those 55 |
| distinct resolved fills | **6/6** — `#c22d6d · #c53637 · #267d30 · #fc9f30 · #cacaca · #1479b0` |
| label colours correct across the matrix | **30/30** |

Note `Style` is *already* a variable mode, not a variant axis. Designers set it
that way today, so colour-by-mode introduces no new interaction — it makes colour
consistent with style.

### The spike found a shipped bug: icon colour is wired to a stale collection

Confirmed on the **live published** Button, not the clone:

| combo | label | icon | |
|---|---|---|---|
| info / Soft | `#14557b` | `#88234d` accent | ✗ |
| info / Outline | `#14557b` | `#88234d` accent | ✗ |
| error / Ghost | `#8a2828` | `#534e50` grey | ✗ |
| accent / Link | `#88234d` | `#fcfcfc` white | ✗ invisible on white |
| error / Link | `#8a2828` | `#fcfcfc` white | ✗ invisible on white |

Label and icon both bind to a variable named `component/fg`, but they are **two
different variables**:

- label → `VariableID:7:10`, local, collection `Component/Style` — correct.
- icon → a **remote** variable in a collection named **`SPIKE Style`**, published
  from the icon library. Modes `[Solid, Soft, Outline, Ghost]` — **no Link mode**,
  `Ghost` hardcoded to `#534e50`, and no chain into `Component/Intent` at all.

That accounts for every symptom: Ghost icons are always grey because the value is
hardcoded; Link icons are white because there is no Link mode so it falls back to
Solid; Info icons are accent because nothing chains to Intent. Setting the Intent
mode directly on the glyph does not help — the variable cannot see this file's
collections.

**Code is unaffected.** `icon.tsx` renders `stroke="currentColor"`, so an icon
cannot diverge from its label by construction. This is Figma-only — the mirror of
`MENU-ITEM-HOVER`, which was Figma-ahead-of-code.

**Why it survived a full port and audit:** it only shows on a non-accent button
that has an icon. Every example screen uses accent buttons.

**Root cause, confirmed inside the icon library.** Not a dead library — the
icons bind to `component/fg` **by published key**, and that key resolves to a
*snapshot* of the collection taken when it was still named `SPIKE Style` with 4
modes. The DS file's Button sets modes on the **local** collection
(`Component/Style`, 5 modes). Same key, two objects, two mode contexts.

A published variable and its local original are distinct, and **republishing the
DS does not refresh the subscriber** — the icon library holds its own snapshot.
Only re-importing by key *inside that file* pulls the current definition:

```js
const fresh = await figma.variables.importVariableByKeyAsync(KEY)
// fresh → Component/Style, 5 modes.  The stored binding → SPIKE Style, 4 modes.
paint = figma.variables.setBoundVariableForPaint(paint, 'color', fresh)
```

**FIXED 2026-08-27.** Every paint in the icon library rebound:

| | |
|---|---:|
| stroke icons rebound | 4,629 |
| filled icons rebound | 332 |
| icons **never bound at all** (raw `#000000`) | **100** |
| final state | **5,062 paints · 0 stale · 0 unbound** |

The 100 were a second, separate defect found on the way — `-filled` variants
including `brand-google-filled` and `brand-apple-filled` carried hard black fills
with no variable, so they would render black-on-black in dark mode. All bound.

The DS file's own components were scanned and are clean: 114 distinct bound
variables, none remote, none `SPIKE Style`.

**Two human steps remain**: publish the icon library, then accept the library
update in the DS file and republish it. Until both happen the bug is still
visible to consumers.

This is independent of the palette work — it is broken today — but it must be
fixed before Button's colour moves to a mode, because that change makes
non-accent buttons far easier to reach.

## 9. Proposed sequence

Mirrors the surface-model rebuild, which caught things a straight implementation
would not have.

1. **Decide the contract** — the ten role names in §4. Cheapest thing to get
   wrong, most expensive to change after publish.
2. **Prove it in Figma first.** One collection, `Palette`, with a mode per
   colour; rebuild Button on it and confirm 330 → 55 with bindings intact.
   Resolve the Badge 14-vs-10 question here, with real components in front of us.
3. **Extend the 7 category ramps to the full contract.** Pure plumbing — the
   primitive steps already exist.
4. **Audit the DS** against the contract: which of the 217 lines map cleanly,
   which need a judgement call.
5. **Implement behind the existing prop.** Component by component, Button first
   as the hardest. `color` keeps working throughout.
6. **Extend the contrast gate** to iterate registered palettes.
7. **Ship**, with the recipe documenting how a consumer registers one.

Steps 1–2 are the ones worth doing before committing to any of the rest.

## 10. Open questions

1. ~~Ten roles, or raw `palette-1..12`?~~ **Answered by `neutral` — roles.** See
   §4. Left here because it was the question I expected to be hardest and it
   turned out to be decided by evidence rather than taste.
2. ~~Badge in Figma?~~ **Answered — Badge keeps its variant axis and stays
   unlimited.** See §7a. The ceiling only binds Button, because a colour costs a
   component the product of its other axes and Button's is 55 against Badge's 4.
3. ~~Does `data-palette` cascade?~~ **Yes**, with an explicit `data-palette`
   always beating an inherited one. Chakra and Radix both cascade; shadcn avoids
   the question by having no colour prop, which is not open to us. See §7.
4. ~~Contrast gate or documented boundary?~~ **Both, in two tiers.** Built-ins
   declare `palette-contrast` explicitly and are gated by an extended
   `audit-contrast`; consumer palettes get CSS-derived contrast as a default and
   a stated boundary. See §7.
5. **How many palettes ship built-in?** All 13 primitive ramps, or the current 14
   semantic + category names? Built-in palettes are the ones we contrast-gate, so
   this is a support commitment, not just a list.
6. **What happens to `neutral`'s two spellings?** Badge has both `default` and
   `neutral` resolving to identical surface tokens. If neutral becomes a palette,
   one of them should go.
