---
"@devalok/shilp-sutra": patch
---

Remove the residual colored accent-rail tell from Toast, AI blocks, Schedule-view, and Chat mentions — extending the v0.44.0 Card decision (a colored side-stripe on a surface is the single most recognizable AI-generated-UI tell). Status/emphasis is now carried by the DS's own subtle surface (`bg-{status}-2`) plus a typed icon, dot, or token.

- **Toast/Toaster:** the colored left rail is off by default; status is carried by the typed icon + the status-colored timer bar, and error toasts gain a faint `bg-error-2` surface tint. Opt back into the rail with `toast.error(msg, { showAccent: true })`.
- **AI blocks:** low-confidence blocks now render a faint `bg-warning-2` wash + a "Low confidence" chip (via a shared `BlockShell`) instead of a warning left rail.
- **Schedule-view:** calendar events drop the `border-l-[3px]` rail in favor of a solid category dot before the title (color-blind-safe, survives forced-colors).
- **Chat:** `highlight="mention"` no longer tints/rails the message row — the mention is carried by the in-content `@`-token; a `data-highlight` attribute remains as a styling hook.
