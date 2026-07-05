---
"@devalok/shilp-sutra": patch
---

Table: footer + selected-hover fixes, rich-cell recipes

- **TableFooter** background was `color-mix(surface-raised 50%)` — invisible on cards (same mis-mapped shadcn `muted/50` family as the row-hover bug). Now a `surface-base` band with a top hairline.
- **Selected+hover** rows get an explicit step (`data-[state=selected]:hover:bg-accent-4`) — previously the hover and selected classes tied on specificity and stylesheet order decided.
- **Cell recipes** documented in `table.md` + new `RichCells` / `SelectedRows` stories: user cell (avatar + truncating two-line identity — comfortable density only, per the industry two-line rule), tag group with `+N` overflow, money cells (consistent decimals; negatives never color-only), qualitative-numbers-stay-left, muted em-dash for empty values. Density→avatar mapping: compact = text only, standard = `xs`, comfortable = `xs`/`sm`.
