---
"@devalok/shilp-sutra": minor
---

Opt-in high-contrast edges, three unread styles, and a slider that shows its value

Three additions, all from a visual review of the open design decisions.

**`data-contrast="high"` — opt-in WCAG 1.4.11 control edges.** SC 1.4.11 asks for
3:1 between a control's edge and its background; the default here is 2.00:1 in
light and 2.08:1 in dark. Setting the attribute on any ancestor moves every
control edge in the subtree to 3.64:1 / 3.93:1.

```html
<html data-contrast="high">
```

An attribute rather than a provider, because `.dark` already works this way — it
composes with an existing theme switcher, needs no client component, and
survives SSR. Steps are referenced by name, so a consumer who rebrands the
neutral ramp gets a correctly scaled high-contrast mode for free.

Be aware of what stays true: the **default remains non-compliant**. Teams that
never set the attribute ship an edge that misses 1.4.11. Shipping compliant by
default and letting teams opt *out* through the token override they already have
was the alternative; opt-in was chosen deliberately so products wanting the
calmer look are not forced off it. Recorded in full on `CONTROL-EDGE-BELOW-AA`
in the deviations register, which stays open.

**`NotificationCenter` gains `unreadStyle`** — `'tint'` (default), `'strong'`,
or `'none'`. `'none'` leans on the tier dot, which already fades to 20% once
read.

The number that governs this is not the one you would reach for first. An unread
row does not compete with the panel it sits on, it competes with a **hovered
already-read row** — because rows hover to `surface-panel-hover`. Measured on a
panel, against that hover (1.091:1 light / 1.173:1 dark):

| | light | dark |
|---|---|---|
| `accent-3` | 1.246 | **1.042 — loses** |
| `accent-4` (`tint`) | 1.422 | 1.231 |
| `accent-5` (`strong`) | 1.690 | 1.458 |

So step 4 is the floor. Anything quieter and a notification you have already
read looks more urgent than one you have not, in dark, whenever the pointer is
over it.

**`Slider` gains tick marks and a value bubble.** The value was previously
unreadable without a separate label.

```tsx
<Slider marks={[0, 25, 50, 75, 100]} />

<Slider showValue="interact">
  <Slider.Mark value={0}>Off</Slider.Mark>
  <Slider.Mark value={80}>Recommended</Slider.Mark>
</Slider>
```

Both forms merge and sort, so they can be mixed; objects allow custom captions
and `label: null` draws a tick with none. Positions honour `min`/`max`.
`showValue` takes `'always'` or `'interact'`, and `formatValue` controls the
text. Ticks and bubble are both `aria-hidden` — the thumb's `role="slider"`
already announces value and range, so exposing them again would only add noise.

Also: the compiled-CSS audit now checks required non-class selectors. A plain
attribute rule is not a utility, so the existing scan could not see it, and a
silent drop would have made `data-contrast` a no-op with no error anywhere.
