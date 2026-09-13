---
'@devalok/shilp-sutra': minor
---

Add `[data-density]` — a named dial for body text

Wanting denser text should not be a reason to leave the type system. Until now
it was the only reason: the composite variants (`text-body-*`) were fixed, so a
consumer who needed a tighter screen dropped to raw `text-ds-*` sizes instead.
Those carry size **only** — no weight, no leading, no tracking — so every such
site silently opted out of the tuning. One app accumulated 771 of them.

`[data-density]` is the supported route. It is a plain attribute, the same shape
as `[data-shape]`, `[data-palette]` and `[data-contrast]`, and it composes with
all of them:

```html
<html class="dark" data-shape="sharp" data-contrast="high" data-density="compact">
```

```tsx
<div data-density="compact"><DataTable … /></div>
<div data-density="comfortable"><ArticleBody /></div>  {/* opt back out, any depth */}
```

**Nothing changes unless you set the attribute.** Verified by compiling the
token CSS before and after: the diff is 20 added lines and **zero removed** —
every existing declaration is byte-identical, and `comfortable` restates the
current values exactly.

| Variant | Size | Comfortable (default) | Compact |
|---|---|---|---|
| `text-body-lg` | 16px | 24px / `-0.01em` | 22.4px / `-0.02em` |
| `text-body-md` | 14px | 21px / `0` | 19.6px / `-0.01em` |
| `text-body-sm` | 12px | 18px / `+0.01em` | 16.8px / `0` |
| `text-body-xs` | 10px | 15px / `+0.02em` | 14px / `+0.01em` |

**Leading is in the dial, deliberately.** It moves `--leading-ds-relaxed` (1.5)
→ `--leading-ds-normal` (1.4) on the body composites: **-6.7% of vertical
rhythm**, roughly two extra rows on a 40-row list. The tracking shift is worth
about 1% of line width. Leaving leading out would have been safer and would have
shipped a dial that does nothing you can see — which sends the consumer straight
back to raw sizes, the exact failure this exists to prevent.

**Tracking keeps its slope.** Today's ramp was loosened step-by-step from a flat
`-0.02em` for small-text legibility, and that instinct is right — `-0.02em` at
10px closes the counters. So compact shifts the whole ramp by a constant
`-0.01em` rather than flattening it, and nothing below 12px goes negative.

**Scope.** Body composites only. Headings, labels, caption, overline and code do
not move — they are already tuned for their job. `--leading-ds-relaxed` itself is
untouched, so the `leading-ds-relaxed` utility still means 1.5 inside compact,
for anyone who asked for it by name.

**Two costs, stated rather than buried.** Compact changes layout metrics, not
just optics, so re-check fixed-height rows and `line-clamp` under it. And its
body line-spacing sits below WCAG 2.2 SC 1.4.8 (Visual Presentation, **AAA**),
which the default meets — a fair trade for a dense product UI, a bad one for
reading copy. SC 1.4.12 (Text Spacing, AA) is unaffected either way: it asks
that content survive a *user* override up to 1.5, which is unchanged.

Documented in `docs/recipes/customize-brand.md → Density`, the root README, the
Storybook Foundations page and the Make kit's typography foundation.
