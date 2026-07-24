---
"@devalok/shilp-sutra": minor
---

**BottomNavbar rebuild (finish-bar).** The overflow "More" menu is now the DS `Sheet` (`side="bottom"`) instead of a hand-rolled `role="dialog"`, so it inherits focus trap, scroll lock, return-focus, `aria-modal`, and `aria-haspopup`/`aria-controls` trigger wiring — closing a real accessibility gap in primary mobile navigation.

- **Role gating (new):** `BottomNavItem` gains `roles?: string[]` (visible only when `user.role` matches) and `canView?: (user) => boolean` (arbitrary logic, wins over `roles`). The previously-inert `user` prop now drives this. Non-breaking — items with neither field are always visible.
- **`indicator` (new):** `'underline'` (default) or Material-3 `'pill'` behind the active icon.
- **`labelVisibility` (new):** `'always'` (default) or `'selected'` (labels only for the active item, for narrow viewports).
- **`activeIcon` (new):** a per-item filled/alternate icon shown while the route is active (falls back to `icon`) — the iOS/Material filled-when-selected affordance. Icon lozenge padding tightened so icon-only items (e.g. `labelVisibility="selected"`) read less airy.
- Composes `Badge` for notification counts (was re-rolled); Sheet's built-in close replaces the sub-44px hand-rolled one.
- Label truncation + logical (RTL-safe) properties; overflow grid adapts to item count instead of a fixed 4 columns.
- Notification-badge `zoom-in` animation is now reduced-motion gated.
- Restored test coverage (RTL + vitest-axe: active state, badges, role gating, More-sheet open/close).
