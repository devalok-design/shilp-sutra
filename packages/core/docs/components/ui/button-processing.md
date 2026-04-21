# ButtonProcessing (Internal)

- Import: Internal — not exported from barrel. Used only by Button.
- Server-safe: No
- Category: ui

## Description

Internal component that renders the processing animation overlay for Button. Consumers use the `processing` prop on Button, not this component directly.

See `Button` docs for the public API.

## Composability
- **Internal only — do NOT import or use directly.** The Button component owns the lifecycle of this overlay.
- Drives Button's `processing` prop rendering. If you're building a custom button and want similar marching-ants feedback, copy the SVG/animation pattern — don't reach into this component.
- Listed here for reference so consumers grep'ing for "processing" find the behavior origin.

## Changes
### v0.29.0
- **Added** Initial release — marching ants processing overlay (SVG dashed rect with animated stroke-dashoffset). Speed tiers: ambient (3s), working (2s), urgent (1s). Color maps to step-11 tokens for visibility on all variants.
