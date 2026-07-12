---
"@devalok/shilp-sutra": patch
---

Internal: extracted the controlled/uncontrolled open-state machine that was hand-copied across six overlays (`Dialog`, `Popover`, `Sheet`, `Tooltip`, `DropdownMenu`, `DropdownMenuSub`) into a single shared hook, `useControllableOpen` (`ui/lib/use-controllable-open`). No API or behavior change — one fix site instead of six.
