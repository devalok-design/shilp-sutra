---
"@devalok/shilp-sutra": patch
---

Give `--shadow-pressed` a dark-mode value — it measured 1.012:1

`--shadow-pressed` is a 1px ring built from `--shadow-color`, and it was the
only one of the three ring tokens without a `.dark` override. In dark it
composited to **1.012:1** against `surface-panel` — a pressed control had no
pressed state at all.

`--shadow-edge-ring` and `--shadow-edge-ring-subtle` both flip to a white ring
under `.dark`, and the comment on the first of them describes exactly this
failure: "a near-black shadow is not an edge on a dark ground". The third ring
never got the same treatment.

It now uses `oklch(1 0 0 / 0.10)` in dark, measuring **2.640:1** — between
`-subtle` (2.148:1) and the full edge ring (2.968:1), which matches where a
pressed state should sit: firmer than a resting card, quieter than a floating
overlay. Light is unchanged.

Found while binding the Figma effect styles, where it had been masked: Figma
had `shadow/pressed` bound to the *edge-ring* variable rather than its own, so
the Figma rendering looked correct and the shipped CSS did not.
