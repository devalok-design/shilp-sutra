# ButtonProcessing (Internal)

- Import: Internal — not exported from barrel. Used only by Button.
- Server-safe: No
- Category: ui

## Description

Internal component that renders the processing animation overlay for Button. Consumers use the `processing` prop on Button, not this component directly.

See `Button` docs for the public API.

## Changes
### v0.29.0
- **Added** Initial release — marching ants processing overlay (SVG dashed rect with animated stroke-dashoffset). Speed tiers: ambient (3s), working (2s), urgent (1s). Color maps to step-11 tokens for visibility on all variants.
