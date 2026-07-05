---
"@devalok/shilp-sutra": minor
---

Table: restore row separators, fix invisible hover, variable-driven density, card-edge alignment

The original shadcn port had lost TableRow's `border-b` (rows rendered as an unseparated slab) and mis-mapped `hover:bg-muted/50` to `hover:bg-surface-raised` — the card background, so row hover was invisible on any table inside a Card. Fixed, plus a density pass benchmarked against Radix Themes / Carbon / Polaris / Mantine / MUI:

- **Rows** regain a hairline separator (`border-surface-border-subtle`); hover is `surface-raised-hover`; selected stays `accent-3`.
- **`density` prop on Table** (`compact | standard | comfortable`) sets `--table-py` → rows ≈ 29 / 37 / 45px (was 29 / 53 / 85 via DataTable's per-cell classes). Header height tracks density instead of a fixed 40px. DataTable forwards its existing `density` state; per-cell `cellPadding` context threading is gone.
- **Edge alignment:** cells are `px-ds-04` interior; first/last cells read `--table-edge`, which inherits `--card-spacing` inside a Card — table columns line up with the card's header/footer slots. Standalone tables fall back to 12px.
- **Header** drops to `text-ds-sm` medium muted — quieter than the data, per the cross-system consensus.
- **`striped` prop** — opt-in zebra (faintest surface step); hairlines remain the default.
- **Sweep:** sort-button + expander hover tokens fixed; expanded row is a `surface-base` recess; sticky header bg is `surface-raised`; raw `h-24` empty states replaced with `py-ds-07`.
- **DataTableCards** (mobile) now `variant="outline"` — a phone screen of stacked shadow cards accumulates lift (make-kit dense-list rule).

Visible default change: standard rows tighten from ~53px to ~37px.
