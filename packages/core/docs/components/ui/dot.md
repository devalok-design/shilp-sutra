# Dot

- Import: @devalok/shilp-sutra/ui/dot
- Server-safe: No
- Category: ui

A small semantic status/indicator dot — the low-level primitive behind status
pills, presence indicators, legend swatches, and `StatusDot`. Intent-coloured,
sized, optionally pulsing, filled or ring.

## Props
    color: "accent" | "success" | "warning" | "error" | "info" | "neutral" | "current" (intent colour; `current` inherits text colour)
    size: "xs" | "sm" | "md" | "lg"
    variant: "filled" | "ring" | "off" (`off` = faint fill + light border, i.e. inactive)
    withBorder: boolean (contrast ring so the dot stays visible on busy/coloured backgrounds)
    pulse: boolean (animate a pulsing ripple; ignored for `off`)
    pulseSpeed: "slow" | "normal" | "fast" (pulse tempo)
    label: ReactNode (inline text; makes the dot an announced status)
    labelPosition: "start" | "end" (which side the label sits on)
    labelClassName: string

## Defaults
    color: "neutral"
    size: "md"
    variant: "filled"
    withBorder: false
    pulse: false
    pulseSpeed: "normal"
    labelPosition: "end"

## Example
```jsx
<Dot color="success" />                                 {/* bare, decorative */}
<Dot color="error" pulse pulseSpeed="fast" label="Recording" />  {/* pulsing + announced */}
<Dot color="neutral" variant="off" label="Offline" />  {/* inactive: faint fill + light border */}
<Dot color="success" withBorder />                      {/* contrast ring for busy backgrounds */}
<Dot color="accent" label="3 online" labelPosition="start" />  {/* label before the dot */}
<Dot color="neutral" variant="ring" size="lg" />        {/* hollow ring */}

// As leading content in a pill:
<Badge variant="soft" color="warning" startIcon={<Dot color="warning" size="sm" />}>
  Pending
</Badge>
```

## Composability
- **Decorative vs announced.** A bare `<Dot>` is `aria-hidden` (the surrounding element carries meaning — e.g. a Badge's text). Pass a `label` (or `aria-label`) to make it a `role="status"` announced indicator.
- **Intent colour, shared vocabulary.** `color` uses the same intent names as the rest of the system (`accent/success/warning/error/info/neutral`), so a Dot next to a Badge/Button of the same intent matches.
- **`pulse` = "live".** Off by default (static status). Turn it on for active/attention states (recording, live, connecting) — a pulsing dot reads as "happening now", so leave it off for settled statuses.
- **Powers the higher-level pieces.** `StatusBadge` composes `<Badge>` + `<Dot>`; use `Dot` directly anywhere you need a coloured indicator without a pill.
- **Three treatments:** `filled` (active), `ring` (hollow outline), `off` (faint same-tone fill + light border — present but inactive/disabled).
- **`withBorder`** adds a contrast ring (`ring-2 ring-surface-panel`) so the dot reads on avatars, images, or coloured fills — the pattern Avatar's status dot uses.
- **`pulseSpeed`** (slow/normal/fast) tunes the pulse tempo — fast for urgent (recording), slow for ambient (syncing).

## Gotchas
- A bare dot is decorative by design — if a dot is the *only* signal (no adjacent text), give it a `label` or `aria-label` so it's announced.
- `pulse` respects `prefers-reduced-motion` (the ripple is disabled).

## Changes
### v0.49.0
- **Added** Initial release. Extracted as the shared primitive behind `StatusDot`, `StatusBadge`, and `Badge`'s dot. Colours `accent/success/warning/error/info/neutral/current`; sizes `xs–lg`; variants `filled/ring/off`; `withBorder` contrast ring; `pulse` + `pulseSpeed`; `label` + `labelPosition`.
