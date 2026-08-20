# Figma Port — Design Doc (SUPERSEDED)

**Superseded 2026-08-18** by [`2026-08-18-figma-library-build-plan.md`](./2026-08-18-figma-library-build-plan.md).

Do not build from this document. It is retained only so the git history has an anchor.

Why it was replaced:

- It targeted Figma file `diyRzIcyZUXsmwrBlsyAJl`. The live file is `bcBO7RgVYR4ulwPr3j2heY`.
- Its Button plan (5 variant x 5 colour x 4 size x 6 state = 600) undercounted the CVA size axis, which
  carries 12 values. The real product was 1,200 — past Figma's stated 1,000-variant performance ceiling.
- It planned around Code Connect. Our plan tier is Pro; Code Connect needs Organization or Enterprise.
- It treated variants as the only lever and never considered variable modes, which carry a whole axis at
  zero variant cost.

The companion research doc (`2026-04-20-figma-port-research.md`) is still useful for its Plugin API
findings; its decisions D4, D7, D8 and D10 are superseded.
