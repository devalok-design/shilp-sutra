# Surface model — DS audit

**Measured 2026-08-26**, against the token set built in Figma
(`bcBO7RgVYR4ulwPr3j2heY`, pages `Shell & surface — 26 Aug` and
`Surface model — showcase`).

This is the second step of the agreed sequence: prove in Figma → **audit the
DS** → implement in code. Nothing here is fixed yet.

The model itself is recorded in
[`2026-08-26-surface-model-rebuild.md`](../plans/2026-08-26-surface-model-rebuild.md).

---

## Scale

| | count |
|---|---:|
| `bg-surface-raised` references | **352** |
| — of those, a true **retarget** (state + container value) | **37** |
| — of those, a plain **rename** | 281 |
| `surface-chrome` (caught by the rule) | 5 |
| `border-surface-border*` references | **246** |
| shadow references | **128** |
| `surface-chrome` references | **8** |
| deprecated `surface-1` / `surface-2` | 24 |

---

## A1 — 37 hover states become invisible. **High.**

> **Corrected 2026-08-27.** This finding originally said 141. That was wrong: my
> grep used `bg-surface-raised`, and `` matches before a hyphen, so it swept
> in 105 uses of `hover:bg-surface-raised-hover` — which already point at the
> right token and need only a rename. The real count, measured by the rule
> itself, is **37**. The finding holds; the scale was overstated fourfold.

A state modifier on a *container* surface appears **37 times**. Under the new
model `surface-base`, `surface-panel` and `surface-overlay` are all `#ffffff` in
light, so a hover painted with the panel value is invisible on every one of them.

**This is `MENU-ITEM-HOVER` generalised.** That entry described the bug in menus.
It is not a menu bug — it is 141 instances of one mistake: an interaction state
painted with a *container* value.

**The rename does not fix it.** `surface-raised` → `surface-panel` leaves the
hover equal to its container. These need a different token, not a renamed one:

```
hover:bg-surface-raised   →  hover:bg-surface-panel-hover
focus:bg-surface-raised   →  focus:bg-surface-panel-hover
data-[state=open]:bg-surface-raised → data-[state=open]:bg-surface-panel-hover
```

So the codemod has **two rules, not one**, and telling them apart is the whole
job: a bare `bg-surface-raised` is a rename, a prefixed one is a retarget.

Worst-affected: `ui/sidebar.tsx` (8), `ui/dropdown-menu.tsx` (8),
`ui/menubar.tsx` (7), `composed/rich-chat-input.tsx` (6), `ui/context-menu.tsx`
(5), `shell/top-bar.tsx` (5).

## A2 — `surface-chrome` is gone and 8 references remain. **High.**

The token was removed because chrome is an arrangement decision, not a theme
value. Still referenced by:

- `shell/top-bar.tsx:83`
- `shell/bottom-navbar.tsx:259`
- `ui/sidebar.tsx:250, 267, 319`
- `tokens/semantic.css:176, 633, 762` (the definitions themselves)

Replacement is `shell/chrome` where the arrangement decides, or `surface-base`
where it does not. The three CSS lines get deleted.

## A3 — one contrast regression, caused by this work. **Medium.**

| fg | bg | ratio | AA |
|---|---|---:|---|
| `surface-fg-subtle` `#6e6e6e` | `surface-sunken` `#eeeeee` | **4.38** | fails 4.5 |

Every other text-on-surface pair passes in both themes. `fg-subtle` was tuned
against the page; the new sunken step sits below it.

**Resolved: wells take `fg-muted`, not `fg-subtle`.** A usage rule, no token
value changes. Measured **7.06:1**.

The premise was wrong. `fg-subtle` is the faintest text in the system and a
sunken well is already a de-emphasised region — pairing them asks the quietest
text to sit on the quietest ground. That is a composition mistake, not a token
defect.

The two token-level fixes were both worse:
- lightening the well needs `#f2f2f2` to clear 4.5 (measured — `#f0f0f0` gives
  only **4.47**), which puts it 3 levels from `panel-hover` and defeats having a
  separate step at all
- darkening `surface-fg-subtle` to `#6a6a6a` reaches 4.66, but moves a token
  with **264 references** on many grounds to suit one pairing

**Follow-up:** nothing enforces this. Worth an eslint rule pairing
`bg-surface-sunken` with `text-surface-fg-subtle`, in the same plugin that will
carry the rename codemod.

## A4 — the warning ramp is 2–3× the saturation of its siblings. **Medium.**

Measured OKLCh chroma of the status backgrounds (×1000):

| | light | dark |
|---|---:|---:|
| `info/background` | 21.9 | 25.2 |
| `success/background` | 25.6 | 30.6 |
| `error/background` | 33.5 | 37.9 |
| **`warning/background`** | **74.2** | **44.3** |

Text contrast is fine on all four (6.4–7.0 light, 7.6–9.0 dark), so this is a
consistency defect, not an accessibility one. It is **pre-existing** — this work
only made it visible, by moving the specimens onto the real tokens. A "Review"
chip now shouts next to "Shipped" and "Open".

**Resolved: kept as-is.** Warning stays louder than its siblings. Recorded in
[`docs/deviations.md`](../deviations.md) as `WARNING-RAMP-CHROMA` so the
measurement survives and nobody quietly "corrects" it later.

A de-saturated version was built and compared (`#efe0cb` light / `#2d1e0f` dark,
chroma 32.0 / 35.0) on the showcase page under `DECISIONS`. Not adopted.

## A5 — 54 `shadow-raised`, and cards are among them. **Medium.**

Shadows total 128. The decision was to scope them to floating elements only and
keep `--shadow-strength` as the consumer dial. `shadow-raised` appears 54 times
including `ui/card.tsx`, `composed/content-card.tsx`, `ui/chat/message.tsx` and
`composed/schedule-view.tsx` — all card-level, all should lose it.

`shadow-floating` (32) and `shadow-overlay` (17) stay.

## A6 — 24 deprecated tokens live where the gate cannot see them. **Low, but it is a hole.**

`bg-surface-1` / `bg-surface-2` survive in `ai/command-bar.stories.tsx`,
`ui/chat/chat.stories.tsx`, `ui/truncated-text.stories.tsx`. The
`pre-publish-audit` *Source Hygiene* gate scans components, not stories.

Stories are what people copy from. Fix the 24 and widen the gate.

## A7 — 246 border references need sorting by hand. **Medium, unavoidable.**

The border set now splits into a decorative family (`surface-border-subtle`,
`surface-border`, `surface-border-strong`, all translucent) and a control family
(`surface-border-interactive`, `-interactive-strong`, solid, WCAG-driven).

Nothing in a class name says which a given border is. Sampled:

- **controls** — `color-input` 8, `input` 4, `select` 2, `combobox` 2,
  `file-upload` 2, `textarea` / `checkbox` / `radio` / `switch` / `number-input` 1 each
- **objects** — `sheet` 4, `table` 3, `alert` 2, `tabs` 2, `card` 1, `accordion` 1

That is ~36 of 246 in the components sampled. The rest are spread across
composed and shell. Each has to be read.

## Retracted

**Avatar fallbacks invert correctly.** I flagged them as possibly not inverting
for dark. Measured: all 8 tones have distinct light and dark values with contrast
between 6.36 and 9.03. The flag was wrong; they were only hard to tell apart at
review scale.

---

## What this changes about the plan

The rebuild plan assumed the surface migration was "351 scriptable, 178 by hand".
That was wrong in both directions:

- **37 of the "scriptable" ones are not a rename at all.** They are a retarget,
  and running a blind rename over them would ship 37 invisible hover states —
  worse than today, because today only the menus are broken. (Originally counted
  as 141; see the correction under A1.)
- The border count is **246**, not 178.

The codemod must distinguish prefixed from bare utilities before it touches
anything. That is the single most important thing in this audit.
