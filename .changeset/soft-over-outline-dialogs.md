---
"@devalok/shilp-sutra": patch
---

Our own composed components now follow the house soft-over-outline rule:
`ConfirmDialog`'s Cancel button and `ErrorBoundary`'s "Try Again" button use
`variant="soft"` instead of `variant="outline"`. `ConfirmDialog`'s confirm
button now uses `Button`'s built-in `loading` prop (spinner + `aria-busy`)
instead of swapping its label to "Processing…". No API changes.
