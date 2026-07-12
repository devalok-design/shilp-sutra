---
"@devalok/shilp-sutra": minor
---

**BREAKING (breaking-minor) — Progress redesigned as a compound component.**

`Progress` is now a compound built for composition (structure after Ark UI / Chakra; multi-segment bars after Mantine), while the smart `<Progress value={70} />` form still covers the common cases.

- New parts: `Progress.Root`, `Progress.Track`, `Progress.Indicator`, `Progress.Segment`, `Progress.Label`, `Progress.Value` (also exported as `ProgressRoot` … `ProgressValue`).
- New props on the smart form: `label`, `max`, `segments` (multi-segment/multi-colour bars), `trackClassName`.
- `Progress.Track` is the accessible progressbar; name it with `aria-label` or a `Progress.Label` + `aria-labelledby`.

**Migrate:**
- `showLabel` → `showValue`: `<Progress value={42} showLabel />` → `<Progress value={42} showValue />`
- `color="default"` → `color="accent"` (or drop it — `accent` is the default). The type is now `"accent" | "success" | "warning" | "error"`.

`StatCard`'s internal progress bar now composes `Progress` (keeping StatCard's own 90/70 thresholds); the toast upload bar uses `color="accent"`.
