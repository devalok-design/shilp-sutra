---
"@devalok/shilp-sutra": patch
---

Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

**The bug:** when the JS preset was removed during the TW4 migration, two things went missing:

1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

**The fix:**

- Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
- `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
- Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

**Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

**Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.
