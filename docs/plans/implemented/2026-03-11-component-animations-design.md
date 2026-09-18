# Component Animation System — Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans after this design is finalized.

**Goal:** Add a cohesive animation layer across all core UI, composed, and shell components. Micro-interactions are always-on; entrance animations are opt-in via classes.

**Existing foundation:** 9 keyframes, 9 animation utilities, 2 stagger plugins, 7 duration tokens, 8 easing curves — all in `packages/core/src/tailwind/preset.ts` and `packages/core/src/tokens/semantic.css`.

---

## Philosophy

### Motion modes
- **Productive** (snappy, utilitarian): `ease-productive-*`, `duration-fast-*`. For frequent interactions — hover, press, toggle, focus.
- **Expressive** (springy, dramatic): `ease-expressive-*`, `ease-bounce`, `duration-moderate-*`. For moments that matter — entrances, state changes, celebrations.

### Activation model
- **Always-on:** Micro-interactions (hover, press, toggle, focus, dismiss). Pure CSS — no props, no state, no opt-in. Every component that responds to user input should feel alive.
- **Opt-in:** Entrance animations (fade, slide, pop, stagger). Consumer adds `animate-*` class or wraps in a container. These depend on mount timing which the consumer controls.
- **`prefers-reduced-motion`:** Already handled globally in `semantic.css` — all `animation` and `transition` properties are stripped. No per-component work needed.

### How to make entrances always-on
Consumers who want entrance animations on every mount can wrap components:
```tsx
// Wrapper approach
<div className="animate-fade-in">
  <Card>...</Card>
</div>

// Or apply directly
<Card className="animate-slide-up">...</Card>

// Staggered lists
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-slide-up delay-stagger"
    style={{ '--stagger-index': i }}
  >
    <Card>...</Card>
  </div>
))}
```

---

## New Keyframes (19 additions → 28 total)

| Keyframe | Steps | Easing intent | Used by |
|---|---|---|---|
| `slide-down` | translateY(-8px) + opacity 0 → translateY(0) + opacity 1 | expressive-entrance | Banner, TopBar entrance |
| `slide-left` | translateX(20px) + opacity 0 → translateX(0) + opacity 1 | expressive-entrance | Stepper forward |
| `slide-out-up` | translateY(0) + opacity 1 → translateY(-8px) + opacity 0 | expressive-exit | Alert/Banner dismiss |
| `slide-out-down` | translateY(0) + opacity 1 → translateY(8px) + opacity 0 | expressive-exit | Notification dismiss |
| `check-pop` | scale(0) → scale(1.2) → scale(1) | bounce | Checkbox, Switch, Stepper completed |
| `tab-indicator` | scaleX(0) origin-left → scaleX(1) | expressive-entrance | Tabs underline, BottomNavbar |
| `count-up` | translateY(100%) + opacity 0 → translateY(0) + opacity 1 | expressive-entrance | StatCard value |
| `wiggle` | rotate(0) → rotate(-3deg) → rotate(3deg) → rotate(-1deg) → rotate(0) | productive-standard | Badge notification, attention |
| `pulse-ring` | box-shadow 0 0 0 0 currentColor/40% → 0 0 0 6px currentColor/0% | expressive-standard | Unread dots, focus hints |
| `rubber-band` | scaleX(1) → 1.15 → 0.9 → 1.05 → 0.98 → 1 | productive-standard | Chip click, toggle press |
| `collapse-out` | grid-template-rows: 1fr → 0fr, opacity 1 → 0 | productive-exit | Banner dismiss |
| `expand-in` | grid-template-rows: 0fr → 1fr, opacity 0 → 1 | expressive-entrance | Banner entrance, expand |
| `shimmer-sweep` | background-position -200% → 200% (gradient) | linear | Skeleton upgrade |
| `swing-in` | perspective(800px) rotateX(-60deg) opacity 0 → rotateX(5deg) → rotateX(0) opacity 1 | expressive-entrance | Notification item |
| `pop-in` | scale(0.5) + opacity 0 → scale(1.05) → scale(1) + opacity 1 | bounce | Badge/Chip appear, tooltip |
| `float` | translateY(0) → translateY(-4px) → translateY(0), infinite | expressive-standard | EmptyState icon idle |
| `subtle-bounce` | translateY(0) → translateY(-2px) → translateY(0) | bounce | Button press, BottomNavbar tap |
| `spin-in` | rotate(0) + scale(0) → rotate(360deg) + scale(1) | expressive-entrance | Loading→success transition |
| `stamp` | scale(1.4) + opacity 0.5 → scale(0.95) → scale(1) + opacity 1 | bounce | Priority change, trend arrow |

---

## Per-Component Spec

### Tier 1 — Always-on micro-interactions

#### Card (`interactive` variant)
- **Hover:** lift 1px + shadow-02 elevation. Already has `hover:shadow-02`, add `hover:-translate-y-px`.
- **Press:** scale(0.98) sink. Add `active:scale-[0.98]`.
- **Transition:** upgrade to `transition-all duration-fast-02 ease-productive-standard`.

#### Button
- **Press:** 1px downward translate for tactile feedback. `active:translate-y-px`.
- **Transition:** `transition-transform duration-fast-01`.
- **Loading state:** spinner already uses `animate-spin`. Add `animate-fade-in` to spinner so it doesn't flash on fast responses.

#### IconButton
- Same press behavior as Button.
- **Hover:** existing bg transition is fine, ensure `duration-fast-02`.

#### Chip (clickable)
- **Press:** rubber-band squish. `active:animate-rubber-band`.
- **Dismiss ×:** rotate 90° on hover. `hover:rotate-90 transition-transform duration-fast-02`.

#### Badge (dismissible)
- **Dismiss ×:** same rotate-90 on hover as Chip.
- **Appear:** opt-in `animate-pop-in`.
- **Notification dot:** `animate-pulse-ring` when unread/new.

#### Toggle
- **Press:** scale-down `active:scale-95`.
- **State change:** bg crossfade already exists via `transition-colors`. Ensure timing is `duration-fast-02`.

#### Switch
- **Thumb:** upgrade easing to `ease-bounce` for satisfying overshoot at rest.
- **Track:** color crossfade already good.
- **Check indicator (internal):** `animate-check-pop` on the thumb when it lands.

#### Checkbox
- **Check indicator:** `animate-check-pop` on the checkmark/minus icon appearing.
- **Uncheck:** quick opacity fade-out `duration-fast-01`.

#### Tabs (line variant)
- **Active underline:** `animate-tab-indicator` scaleX entrance from left.
- **Trigger color:** existing `transition-[color,background-color,border-color,box-shadow]` is good.

#### Tabs (contained variant)
- **Active bg:** add subtle `shadow-01` lift transition. Existing transitions cover it, ensure `duration-fast-02`.

#### Stepper
- **Step circle:** existing `transition-colors` for state changes.
- **Completed checkmark:** `animate-check-pop` on the check icon.
- **Connector line:** width fill transition `transition-all duration-moderate-01 ease-productive-standard`.

#### Alert (dismiss)
- **Dismiss click:** `animate-slide-out-up` before unmount. Requires brief state delay for animation.

#### Banner (dismiss)
- **Dismiss click:** `animate-collapse-out` height shrink.

#### Slider
- **Thumb hover:** `hover:scale-110` subtle grow.
- **Thumb active/drag:** `active:scale-125` bigger grab.
- **Transition:** `transition-transform duration-fast-02`.

#### NotificationCenter
- **Item hover:** `hover:translate-x-0.5` subtle rightward nudge.
- **Item dismiss:** `animate-slide-out-down` before removal.
- **Transition:** `transition-transform duration-fast-02`.

#### BottomNavbar
- **Active indicator:** replace opacity fade with `animate-tab-indicator` scaleX entrance.
- **Icon tap:** `active:animate-subtle-bounce` on nav item press.

### Tier 2 — Opt-in entrance animations

| Component | Class to add | Effect |
|---|---|---|
| Card | `animate-fade-in` | Gentle opacity 0→1 |
| Alert | `animate-slide-down` | Slides down from top |
| Banner | `animate-expand-in` | Height expand + fade in |
| Badge | `animate-pop-in` | Scale pop from nothing |
| Chip | `animate-pop-in` | Same scale pop |
| StatCard | `animate-fade-in` on card | Card fades in |
| StatCard value | `animate-count-up` | Number slides up from below |
| EmptyState | `animate-fade-in` | Root fades in |
| PageHeader | `animate-slide-up` | Slides up into place |
| TopBar | `animate-slide-down` | Slides down from top edge |
| CommandPalette results | `animate-fade-in delay-stagger` | Cascading result appearance |
| NotificationCenter list | `animate-swing-in delay-stagger` | Staggered perspective swing |
| Stepper content (fwd) | `animate-slide-left` | Content slides in from right |
| Stepper content (back) | `animate-slide-right` | Content slides in from left |

### Tier 3 — Delighters

| Component | Detail | Notes |
|---|---|---|
| EmptyState icon | `animate-float` infinite idle bob | 4px vertical movement, gentle |
| Badge unread dot | `animate-pulse-ring` expanding ring | Draws eye to notification count |
| Spinner | `animate-fade-in` wrapper | Prevents flash on fast loads |
| Progress (determinate) | Bar width transition `ease-expressive-standard duration-moderate-02` | Smooth fill, not instant |
| StatCard trend arrow | `animate-stamp` on delta | Stamps in to draw attention |
| Skeleton | `animate-shimmer-sweep` option | Richer glass gradient sweep |
| NotificationCenter dot | `animate-wiggle` on new | Quick attention wiggle |
| Switch thumb | Landing overshoot via `ease-bounce` | Satisfying micro-detail |
| Toast | Enhance with `ease-bounce` on entrance | Bouncier, more alive feel |
| Chip dismiss | Element shrinks before removal | `animate-scale-out` before unmount |

---

## Files to modify

### Upstream (packages/core)
- `src/tailwind/preset.ts` — 19 new keyframes + 19 new animation utilities
- `src/ui/card.tsx` — hover lift, press sink
- `src/ui/button.tsx` — press translate
- `src/ui/icon-button.tsx` — press translate
- `src/ui/chip.tsx` — press rubber-band, dismiss rotate
- `src/ui/badge.tsx` — dismiss rotate, dot pulse-ring
- `src/ui/toggle.tsx` — press scale
- `src/ui/switch.tsx` — thumb bounce easing
- `src/ui/checkbox.tsx` — check-pop indicator
- `src/ui/tabs.tsx` — tab-indicator animation
- `src/ui/stepper.tsx` — check-pop on completed, connector transition
- `src/ui/alert.tsx` — dismiss animation (slide-out-up)
- `src/ui/banner.tsx` — dismiss animation (collapse-out)
- `src/ui/slider.tsx` — thumb hover/active scale
- `src/ui/progress.tsx` — bar width easing
- `src/ui/toast.tsx` — entrance easing upgrade
- `src/ui/skeleton.tsx` — shimmer-sweep option
- `src/ui/stat-card.tsx` — trend stamp animation
- `src/composed/empty-state.tsx` — float animation on icon
- `src/shell/notification-center.tsx` — item nudge, dismiss animation, dot wiggle
- `src/shell/bottom-navbar.tsx` — tab-indicator active, tap bounce

### No changes needed
- Dialog, Sheet, AlertDialog, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu, Select, Combobox, Menubar — Radix animate-in/out is already excellent
- Accordion, Collapsible — height animations already work
- Input, Textarea, SearchInput, NumberInput — form fields stay static (focus ring transition exists)
- Spinner — only add fade-in wrapper guidance in docs
- CommandPalette, PageHeader, TopBar — entrance animations are opt-in via class, no component changes needed

---

## Testing strategy
- Visual regression in Storybook — each animated component gets a story showing its animation states
- `prefers-reduced-motion` — verify global CSS rule still strips all animations
- No new unit tests for CSS-only micro-interactions (they're declarative)
- Dismiss animations that require state delays need integration tests to verify the element unmounts after animation completes
