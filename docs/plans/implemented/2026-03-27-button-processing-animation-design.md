# Button Processing Animation + Layout Transitions — Design

## Problem

1. **No processing state** — Buttons have `loading` (spinner replaces content) but no visual for "working in background, content still visible." Users can't tell the button did anything.
2. **No layout animation** — When button content changes (icon appears/disappears, text swaps), the width snaps instantly. Feels broken.

## Design

### Processing State

An animated border that signals background activity while keeping the button's content fully visible and readable. Two visual styles: **ants** (rotating conic-gradient) and **glow** (breathing box-shadow).

**API:**

```tsx
// Boolean shorthand — ants style, "working" speed, button's own color
<Button processing>Generating...</Button>

// Semantic speed
<Button processing="ambient">Syncing...</Button>
<Button processing="working">Generating...</Button>
<Button processing="urgent">Saving...</Button>

// Color override — independent of button's color prop
<Button processing="working" processingColor="success">Almost done...</Button>
<Button processing="working" processingColor="error">Retrying...</Button>

// Glow style — subtle pulsing shadow, better for ghost/soft variants
<Button processing="working" processingStyle="glow" variant="ghost">Thinking...</Button>
```

**Props:**

```typescript
interface ButtonProps {
  // ...existing...

  /** Show processing animation. Boolean = "working" speed. */
  processing?: boolean | 'ambient' | 'working' | 'urgent'

  /** Override the processing animation color. Defaults to the button's own color. */
  processingColor?: 'accent' | 'error' | 'success' | 'warning' | 'neutral'

  /** Processing visual style. Default: 'ants' */
  processingStyle?: 'ants' | 'glow'

  /** Whether the button is disabled during processing. Default: true */
  processingDisabled?: boolean
}
```

**Speed mapping (semantic names):**

| Speed | Duration | Intent | Use case |
|-------|----------|--------|----------|
| `ambient` | 3s rotation / 3s pulse | "We're on it" | File upload, background sync, long-running jobs |
| `working` | 2s rotation / 2s pulse | "Actively processing" | Standard API call, AI generation |
| `urgent` | 1s rotation / 1s pulse | "Pay attention" | Retry, timeout approaching, nearly done |

`true` normalizes to `"working"`.

---

### Ants Style (default)

Rotating conic-gradient border — a continuous dash of color circling the button.

**Visual behavior:**

- Border becomes a rotating conic-gradient using the resolved color
- Gradient pattern: solid color (50% of circumference) → transparent gap (50%) — creates the "marching" effect
- Border width: 2px (matches existing outline variant border)
- Border radius: inherits from button's `rounded-*` class
- Grain stays visible — marching ants border renders on TOP (outside content layer)
- `prefers-reduced-motion`: no animation, static dashed border in the processing color

**Implementation:** CSS `@property --border-angle` + `conic-gradient` + `@keyframes`. GPU-accelerated, no extra DOM elements.

```css
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes processing-ants {
  to { --border-angle: 360deg; }
}
```

The button renders a pseudo-element overlay (absolute, inset-[-2px], rounded-[inherit]) with the conic-gradient background clipped to a 2px border ring. This approach avoids fighting with the button's existing `background` and `border` properties.

---

### Glow Style

Breathing box-shadow pulse — a soft ambient glow that radiates and fades. Better for `ghost` and `soft` variants where a hard rotating border feels too aggressive.

**Visual behavior:**

- Animated `box-shadow` that expands and contracts
- Shadow color matches the resolved processing color at 25% opacity
- Expand: 0 0 0 0px → 0 0 8px 2px → 0 0 0 0px (breathe cycle)
- `prefers-reduced-motion`: static subtle shadow (no animation)

**Implementation:** CSS `@keyframes` with `box-shadow` transition. GPU-composited in modern browsers.

```css
@keyframes processing-glow {
  0%, 100% { box-shadow: 0 0 0 0 var(--processing-color-25); }
  50% { box-shadow: 0 0 8px 2px var(--processing-color-25); }
}
```

---

### Processing Color Resolution

```typescript
// 1. If processingColor is set explicitly, use it
// 2. Otherwise, inherit from the button's own color prop
// 3. Fallback: accent
const resolvedProcessingColor = processingColor ?? color ?? 'accent'
```

Color maps to the same tokens: `accent-9`, `error-9`, `success-9`, `warning-9`, `neutral-9`.

For glow style, the shadow uses the color at 25% opacity for the expanded state.

---

### Processing Disabled

`processingDisabled` defaults to `true` — clicking a processing button is almost always unintended (double-submit, duplicate API call). The button gets `disabled` styling and `pointer-events-none`.

Set `processingDisabled={false}` for the rare "click to cancel" pattern:

```tsx
<Button processing="working" processingDisabled={false} onClick={handleCancel}>
  Cancel generation
</Button>
```

---

### Completion Transition

When `processing` goes from truthy → falsy, the animation doesn't just stop — it has a satisfying finish:

1. **Ants style:** The border completes its current rotation (accelerates to finish within 300ms), then fades out over 200ms.
2. **Glow style:** The shadow does one final expand at 1.2x intensity, then contracts and fades over 300ms.

This is the difference between "it stopped" and "it finished." Implemented via framer-motion `AnimatePresence` on the processing overlay element.

---

### Interaction with Other States

| State | Behavior |
|-------|----------|
| `processing` + content | Content visible, border/glow animates, button disabled by default |
| `processing` + `loading` | Loading takes precedence (spinner shown), ants/glow still animate around |
| `processing` + `disabled` | Animation pauses, static dashed border (ants) or static shadow (glow) |
| `processing` + `grain` | Both visible — grain at z-[1], content at z-[2], ants on overlay layer |
| `processing` + `variant="ghost"` | Border/glow appears (ghost normally has no border) — ants create the border, glow adds the shadow |
| `processing` + `variant="soft"` | Glow recommended — ants work but glow feels more natural on soft surfaces |

---

### Layout Animation: Smooth Width Transitions

When button content changes (icon swap, text change, loading toggle), the button smoothly animates to its new dimensions.

**Approach:** Framer Motion `layout` prop on the button element. Uses FLIP technique (transform-based, GPU-accelerated, no layout reflow).

**Behavior:**

- Always ON for all buttons (no prop to disable — this is baseline polish)
- Transition: smooth ease, no overshoot — `{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }`
- `prefers-reduced-motion`: layout animation disabled (instant snap)
- Content children (icons, text, spinner) also get `layout` for coordinated movement

**Implementation:**

Button element becomes `motion.button` (already partially done for async feedback). Add `layout` prop:

```tsx
const prefersReduced = useReducedMotion()

<motion.button
  layout={!prefersReduced}
  transition={{ layout: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } }}
  {...rest}
>
```

Icon slots also get `layout`:

```tsx
<motion.span layout={!prefersReduced} className="inline-flex shrink-0 ...">
  {startIcon}
</motion.span>
```

**What animates:**
- Button width when text changes length
- Button width when icon appears/disappears
- Button width when loading spinner replaces icon
- Icon/text position when button width changes

**What doesn't animate (handled elsewhere):**
- Height (fixed per size variant)
- Color/background (CSS transitions)
- Border (marching ants or CSS transitions)

---

## Interaction Matrix

| Scenario | Visual |
|----------|--------|
| Click → processing | Border starts marching (or glow starts), content unchanged, button disabled |
| Processing → done | Ants accelerate to finish rotation + fade, or glow does final pulse + fade |
| Processing → success | Completion transition, then icon swaps to check (smooth layout) |
| Processing → error | processingColor shifts to error, completion transition, icon swaps to X |
| Processing speed change | Animation speed transitions smoothly |
| Icon appears | Button width grows smoothly (layout animation) |
| Icon disappears | Button width shrinks smoothly |
| Text changes | Button width adjusts smoothly |
| Loading toggle | Spinner replaces icon with smooth layout transition |

---

## Accessibility

- `prefers-reduced-motion`: ants → static dashed border, glow → static subtle shadow, layout → instant snap
- `aria-busy="true"` set when `processing` is truthy
- `processingDisabled={true}` (default): button gets `disabled` + `pointer-events-none`
- `processingDisabled={false}`: button stays interactive, consumer handles cancel logic
- Screen readers: consumer should update button text or `aria-label` to communicate processing state

---

## Files to Modify

1. `packages/core/src/ui/button.tsx` — add `processing`, `processingColor`, `processingStyle`, `processingDisabled` props, `layout` on button + icon slots
2. `packages/core/src/tailwind/preset.ts` — add `@property --border-angle`, `processing-ants` keyframe, `processing-glow` keyframe, speed utilities
3. `packages/core/src/ui/button.stories.tsx` — processing stories (3 speeds × 2 styles, color override, with grain, completion transition)
4. `packages/core/src/ui/button.test.tsx` — processing state tests (aria-busy, disabled, className)
5. `packages/core/src/ui/lib/motion.ts` — add layout ease preset

## Not In Scope (follow-ups)

- Processing state on IconButton (same pattern, apply later)
- Determinate processing progress (ring fills as percentage — future)
- Processing + ButtonGroup coordination (one processing disables siblings)
