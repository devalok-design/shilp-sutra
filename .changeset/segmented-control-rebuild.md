---
"@devalok/shilp-sutra": minor
---

**SegmentedControl visual rebuild.** Reconstructed to match the modern segmented-control pattern (iOS / shadcn / Radix), fixing the muddy "edge-soup" look (a bordered + inset-shadowed track under a ring-carrying pill thumb).

- **Rounded-rect, not full pill** — track `rounded-ds-lg`, thumb `rounded-ds-md` (inner radius sits tighter inside the track).
- **Single edge treatment** — track is a translucent recess (`--color-segment-track`) with no border and no inset shadow; the thumb defines its own edge with one ring-less soft shadow (`--shadow-segment`). New tokens added to `semantic.css`.
- **Dark-mode fix** — elevation inverts in dark (faint lighter track fill), so the groove reads on near-black surfaces where a "sunken" darker track vanished.
- **`fullWidth` prop (new)** — segments split the container equally instead of hugging content; use for full-width toggles and view switchers.
- **Motion** — crisp bounce-free thumb glide (~300ms, reduced-motion aware) plus a `motion-safe` press-scale on each segment for tactile feedback.
- **Canonical controlled/uncontrolled API (new)** — `value` / `defaultValue` / `onValueChange`, matching Tabs/ToggleGroup. Uncontrolled mode works with `defaultValue` (falls back to the first option).
- **44px touch targets** — each segment now meets the WCAG touch minimum (`touch-target`) while keeping its dense visual height.
- **Option `text` widened `string` → `ReactNode`** and made optional — segments can hold a count badge/custom node, or be icon-only.
- **Icon-only segments** — set `ariaLabel` per option for the accessible name when `text` is omitted.
- **RTL** — Arrow-key navigation tracks reading order (ArrowLeft → next, ArrowRight → previous) in a right-to-left context.
- **Deprecated aliases** — `variant="default"` → `"soft"`, `selectedId` → `value`, `onSelect` → `onValueChange`. All old names still accepted at runtime; update call sites (removed in a future major).

New tokens: `--color-segment-track`, `--color-segment-thumb`, `--shadow-segment`.
