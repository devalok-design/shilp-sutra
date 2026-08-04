# Progress

- Import: @devalok/shilp-sutra/ui/progress
- Server-safe: No
- Category: ui

A linear progress bar. Use the smart all-in-one `<Progress value={70} />` for the
common cases, or the compound parts (`Progress.Root` / `Track` / `Indicator` /
`Segment` / `Label` / `Value`) for full layout control and multi-segment bars.

## Props
    value: number | null (0–max) — omit or null for an indeterminate bar
    max: number (scale maximum, default 100)
    size: "sm" | "md" | "lg" (track height)
    color: "accent" | "success" | "warning" | "error" (indicator color)
    autoColor: boolean (auto-shift color by value: 0-59=accent, 60-84=warning, 85-100=success, >100=error)
    label: ReactNode (descriptive label rendered before the bar; names the bar for a11y)
    showValue: boolean (shows the "{n}%" readout after the bar)
    segments: { value: number; color?: "accent" | "success" | "warning" | "error" }[] (multi-segment bar; overrides the single indicator)
    trackClassName: string (class for the Track element)
    indicatorClassName: string (class for the single Indicator; ignored when segments set)

## Compound Components
    Progress (smart all-in-one — value/size/color/label/showValue/autoColor/segments)
    Progress.Root (layout container + context; owns value/max/size)
      Progress.Label (descriptive label; give it id + point Track's aria-labelledby at it)
      Progress.Track (the aria progressbar + track visual; holds Indicator or Segments)
        Progress.Indicator (single fill; color, or auto-color by value)
        Progress.Segment (one slice of a multi-segment bar — value + color)
      Progress.Value (the "{n}%" readout; custom via children or a `format` fn)

## Defaults
    size: "md"
    color: "accent"
    max: 100

## Example
```jsx
// Simple:
<Progress value={75} color="success" showValue />
<Progress size="sm" />                                 {/* indeterminate */}
<Progress value={80} autoColor showValue />            {/* color follows value */}

// Multi-segment (Mantine-style):
<Progress segments={[{ value: 40, color: 'success' }, { value: 30, color: 'warning' }]} />

// Compound — full control:
<Progress.Root value={62} size="lg">
  <Progress.Label id="storage-lbl">Storage</Progress.Label>
  <Progress.Track aria-labelledby="storage-lbl">
    <Progress.Indicator color="warning" />
  </Progress.Track>
  <Progress.Value format={(pct) => `${pct}% of 50 GB`} />
</Progress.Root>
```

## Composability
- **Two APIs, one component.** The smart `<Progress>` composes the parts for you; reach for the compound parts when you need a custom layout (label above the bar, value inside, multiple bars) or multi-segment fills. Structure follows Ark UI / Chakra; `Progress.Segment` follows Mantine.
- **`Progress.Track` is the accessible progressbar** (role=progressbar, aria-valuenow/min/max from `Root`'s value). Give it a name via `aria-label`, or a `Progress.Label` + matching `aria-labelledby`. The smart form wires this from the `label` prop / a passed `aria-label` automatically.
- **autoColor semantic signal:** maps value thresholds to color (0–59 accent · 60–84 warning · 85–100 success · >100 error) — storage meters, budget trackers, goal progress. Pass an explicit `color` to opt out.
- **Segments** render side-by-side, each `value` as a % of `max`; the Track's aria value still reflects `Root`'s `value`.
- **Indeterminate:** omit `value` (or pass `null`) for the continuous sweep. Motion-reduced users get a static bar.
- **Progress vs ProgressRing:** Progress is linear; `ProgressRing` is circular (with multi-ring stacked variants).

## Gotchas
- Omit `value` (or pass `null`) for indeterminate.
- Pass an explicit `color` to override `autoColor`.
- Compound `Progress.Track` needs a name — an `aria-label`, or a `Progress.Label` whose `id` the Track's `aria-labelledby` points to. A Track with neither is an unnamed progressbar (axe will flag it).
- **`<Progress value={72} />` with no name warns in DEV.** `aria-valuenow` already carries the number, so an unnamed bar announces as "progressbar, 72%" — the reader learns the value but not *what* is progressing. Pass `label` (renders visible text and wires `aria-labelledby`) or `aria-label` when the bar must stay visually unlabelled. The component deliberately does **not** invent a default like "Progress: 72%": that would silence the audit while leaving the announcement equally uninformative, and only you know what the bar measures. Warns once per session, not per render.
- `Progress.Indicator` / `Segment` / `Value` throw if rendered outside `Progress.Root`.

## Changes
### v0.49.0
- **BREAKING** Progress redesigned as a compound component. Renamed `showLabel` → `showValue`. The `color` neutral value `"default"` → `"accent"` (the type is now `"accent" | "success" | "warning" | "error"`). Added compound parts (`Progress.Root/Track/Indicator/Segment/Label/Value`), a `label` prop, a `max` prop, a `segments` prop (multi-segment bars), and `trackClassName`. Migrate `showLabel` → `showValue` and `color="default"` → `color="accent"` (or drop it — accent is the default).

### v0.29.0
- **Added** `autoColor` prop — automatically shifts indicator color based on value thresholds

### v0.1.0
- **Added** Initial release with `size`, `color`, `indeterminate` variants and optional label slot
