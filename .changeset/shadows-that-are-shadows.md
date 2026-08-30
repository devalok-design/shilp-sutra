---
"@devalok/shilp-sutra": patch
---

Split the shadow ink by theme — light matches Figma, dark stops glowing

`--shadow-color` was one value for both themes, and it was wrong in both
directions.

**Light now matches the Figma library exactly** (`#1c2533`). The two had
drifted, and Figma won on cost rather than merit: one value here against 26 in
the library, for a difference measured at **1/255** at the strongest light
layer. Below what anyone can see, so the cheaper of two equivalent outcomes.

**Dark gets its own, darker ink** (`oklch(0.05 0.012 260)`), because the light
reasoning does not survive the theme. Dark sets `--shadow-strength: 2.5`, and at
that weight:

- the new light ink composites to `#1b1d21` over a `#1a1a1a` panel — **lighter
  than the surface it is meant to darken.** A glow, not a shadow.
- the *previous* dark ink had a milder version of the same fault: fine on
  `surface-panel`, but on `surface-base` (`#0a0a0a`) it is itself the lighter
  colour, and the drop layers measured **1.001:1** separation. They contributed
  nothing at all.

`0.05` sits below both dark grounds, so the sign is now correct everywhere.

**What this does not do, and no ink can:** make drop shadows carry dark
elevation. There is no headroom below a near-black ground — the best any ink
achieves at the strongest layer is 1.013:1 on base and 1.040:1 on panel. The
white edge ring is what actually separates an elevated surface in dark. That is
structural, not a workaround, and it is now written at the token so the next
person does not try to fix it by darkening the shadow further.

Light rendering is unchanged to within 1/255. Dark shadows are very slightly
more present and, on the page background, are shadows rather than glows for the
first time.
