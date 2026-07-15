---
'@devalok/shilp-sutra': patch
---

De-slop audit polish — removes AI-generated design "tells" flagged by an adversarial pass over the whole system (tokens + all components). No public API removed; two additive opt-in props added.

**Reliability (the important one): content is now visible by default.** Several components started at `opacity: 0` and only appeared once a Framer entrance fired — so a backgrounded tab, a hydration stall, or a throttled animation engine could render them blank. Most alarming was `StatCard`'s primary value. Content no longer depends on an animation completing.

- `StatCard`: new **`reveal?: boolean`** prop (default `false`). Off = value/label/progress render statically (content-safe). On = a subtle settle that never hides content. The old always-on roll-up (which strand-hid the number inside `overflow-hidden`) is gone.
- `EmptyState`, `ActivityFeed`, chat `Message`, AI `Conversation` / `BlockRenderer` / stat-row: entrance reveals no longer gate opacity (pure fades → static; slides keep the slide, drop the opacity gating).
- `Avatar` image no longer starts transparent.

**Glow / bloom removal.**
- `Button`: solid variants no longer bloom a colored `shadow-brand`/`shadow-error/success/warning` halo on hover. Kept the tonal `shadow-raised` base and the fill-deepen.
- `Dot`: `pulse` now animates a contained fade on the dot itself instead of an expanding `animate-ping` glow ring.
- `DevadootIcon`: removed the blurred-shape-copy glow layer (kept the gradient fill and shimmer).
- `CommandBar`: removed the `blur(8px)` outer-glow copy behind the processing border (kept the animated border).

**Motion polish.**
- Removed hover-grow (`hover:scale-*`) on Combobox clear button, Slider thumb (kept the active/grab scale), ScheduleView event tiles, and AvatarGroup. `BottomNavbar` tap feedback is a press-shrink, not a lift.
- `EmptyState` icon is a bare mark now (dropped the filled tile and the infinite bob).

**Behavior change (minor, opt-out → opt-in):** `Badge` status dot no longer pulses by default. New **`dotPulse?: boolean`** prop (default `false`) restores it. A badge dot that previously pulsed will render static unless `dotPulse` is set.
