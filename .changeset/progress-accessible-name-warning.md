---
"@devalok/shilp-sutra": patch
---

**Progress:** warn in DEV when a bar has no accessible name.

`<Progress value={72} />` rendered `role="progressbar"` with no `aria-label`, `aria-labelledby` or `title`, so a screen reader announced "progressbar, 72%" — the value, but not what is progressing. Lighthouse flags it as `aria-progressbar-name`.

It now warns once (latched at module scope, so a bar animating on every tick logs once rather than once per frame) and names both escape hatches:

```tsx
<Progress value={72} label="Storage used" />          // visible text, wires aria-labelledby
<Progress value={72} aria-label="Upload progress" />  // visually unlabelled
```

**Deliberately a warning and not an auto-generated default.** A generated name like `"Progress: 72%"` would silence the audit while leaving the announcement exactly as uninformative — `aria-valuenow` already carries the number — and it would make the bar *look* labelled so nobody fixes it. Only the consumer knows what the bar measures.

Runtime behaviour in production is unchanged; the warning is stripped with `process.env.NODE_ENV === 'production'`. No API change. Passing `label`, `aria-label` or `aria-labelledby` already suppressed the problem and continues to.

Also adds the component's first test file (8 cases: label wiring, explicit `aria-label`, explicit `aria-labelledby`, the warn firing, warn-once across re-renders and multiple instances, labelled indeterminate bars staying silent, and axe).
