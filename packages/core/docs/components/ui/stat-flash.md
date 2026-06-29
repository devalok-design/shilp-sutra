# StatFlash

- Import: @devalok/shilp-sutra/ui/stat-flash
- Server-safe: No
- Category: ui

## Props
    icon: ReactNode | ComponentType<{ className?: string }> (REQUIRED — settled identity glyph)
    flash: "up" | "down" | "goal" | "record" | "alert" | "live" | { tone, icon } (REQUIRED — the entrance state)
    fill: "soft" | "solid" (resting chip style; default soft)
    speed: "fast" | "normal" | "slow" (coarse motion preset; default normal)
    holdMs: number (override how long the flash holds before settling)
    settleTransition: Transition (override the icon scale-in transition)
    flashTransition: Transition (override the flash enter/exit fade)

## Defaults
    fill="soft", speed="normal"

## Example
```jsx
// Preset: green up-arrow flashes, then settles to the folder icon
<StatFlash icon={<IconFolder />} flash="up" />

// Explicit tone + glyph
<StatFlash icon={<IconActivity />} flash={{ tone: "info", icon: <IconBolt /> }} fill="solid" />

// Composable speed: coarse preset + fine override
<StatFlash icon={<IconFolder />} flash="up" speed="fast" holdMs={300} />
```

## Composability
- **State → identity primitive:** the chip mounts showing a transient *state* (a toned glyph — up-arrow on green, check, alert…) then settles into the stable *identity* icon. Used by `StatCard`'s `flash` prop, but standalone too (list rows, badges, toasts).
- **Tone slot:** six named presets (`up`/`down`/`goal`/`record`/`alert`/`live`) map to DS semantic tones (success/error/warning/info/accent) + a glyph. Pass `{ tone, icon }` for anything else.
- **Composable motion:** `speed` is a coarse preset built from the DS motion tokens; `holdMs` / `settleTransition` / `flashTransition` each override one slice and fall back to the preset.
- **Accessible by default:** honors `prefers-reduced-motion` — renders the settled identity directly, no flash. The chip is `aria-hidden` (decorative; the metric's text carries meaning).

## Gotchas
- `flash` and `icon` are both required — the flash settles *to* the icon.
- Fine overrides win over `speed`.
- Decorative only — never the sole carrier of meaning (it's `aria-hidden`).

## Changes
### v0.43.0
- **Added** Initial release. Powers `StatCard`'s `flash` prop.
