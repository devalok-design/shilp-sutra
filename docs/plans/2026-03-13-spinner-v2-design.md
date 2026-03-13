# Spinner v2 Design — Arc Spinner with State Transitions

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the basic CSS `animate-spin` circle spinner with a polished Material Design-style arc spinner that supports animated transitions to success (checkmark) and error (X) states, powered by Framer Motion.

**Decision date:** 2026-03-13

---

## Decisions Made

| Question | Answer | Rationale |
|---|---|---|
| Visual style | Arc spinner (Material Design) | Most modern, transitions naturally into checkmark via shared SVG stroke technique |
| States | spinning + success + error | Full state machine covers all real use cases |
| Color | Semantic auto-coloring | `interactive` → `success-text` / `error-text` based on state, matches token system |
| Display delay | Built-in `delay` prop, default 0 | Avoids flicker on fast operations without breaking existing usage |
| Sizes | sm / md / lg (unchanged) | Current 3 sizes cover all usage, YAGNI |
| Inconsistent usage cleanup | Yes, unify all | Replace IconLoader2 and inline border-t spinners across codebase |
| Animation engine | Framer Motion | First FM component in the system; pilot for broader animation adoption |
| Backward compat | Not a constraint | OK to change API if it means a better component |

---

## Component API

```tsx
interface SpinnerProps {
  /** sm | md | lg — maps to icon size tokens. Default: 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Current state. Default: 'spinning' */
  state?: 'spinning' | 'success' | 'error'
  /** Delay in ms before showing (avoids flicker). Default: 0 */
  delay?: number
  /** Fires when success/error transition animation completes */
  onComplete?: () => void
  className?: string
}
```

### Usage Examples

```tsx
<Spinner />                                           // basic arc spinner
<Spinner size="sm" />                                 // small
<Spinner state="success" />                           // arc → checkmark (green)
<Spinner state="error" />                             // arc → X mark (red)
<Spinner delay={150} />                               // no render until 150ms
<Spinner state="success" onComplete={handleDone} />   // callback after animation
```

### Colors (automatic, no prop needed)

| State | Color token | Visual |
|---|---|---|
| `spinning` | `--color-interactive` | Brand pink arc |
| `success` | `--color-success-text` | Green checkmark |
| `error` | `--color-error-text` | Red X mark |

Background track uses `--color-border-subtle` (same as current).

---

## Animation Sequence

### Spinning State
- SVG `<motion.circle>` with `stroke-dasharray` ~75% circumference (visible arc)
- Continuous rotation: `animate={{ rotate: 360 }}` with `repeat: Infinity`, `ease: "linear"`, `duration: 1`
- Arc length subtly pulses (grows/shrinks) via `stroke-dashoffset` animation for Material Design feel
- `strokeLinecap="round"` for polished rounded ends

### Transition: spinning → success
1. Rotation eases to stop (~300ms, expressive exit)
2. Arc completes to full circle (~200ms, `pathLength: 0.75 → 1`)
3. Color transitions to `success-text` (~150ms, simultaneous with step 2)
4. Circle fades slightly, checkmark `<motion.path>` draws in via `pathLength: 0 → 1` (~400ms, expressive entrance)
5. `onComplete` callback fires

### Transition: spinning → error
- Same sequence, but color transitions to `error-text` and X path draws instead of checkmark

### Reduced Motion (`prefers-reduced-motion`)
- No rotation — static arc icon
- State transitions are instant opacity crossfades (no draw-in)
- Uses `useReducedMotion()` from Framer Motion

### Delay Behavior
- `delay > 0`: component renders nothing, then fades in after delay ms
- `delay === 0` (default): renders immediately

---

## SVG Structure

```
<span role="status">
  <svg viewBox="0 0 24 24">
    <!-- Background track circle (always visible) -->
    <circle cx="12" cy="12" r="10" stroke="var(--color-border-subtle)" />

    <!-- Animated arc (spinning state) -->
    <motion.circle cx="12" cy="12" r="10" stroke="currentColor"
      strokeDasharray="..." animate={{ rotate, pathLength }} />

    <!-- Checkmark path (success state, draws in) -->
    <AnimatePresence>
      {state === 'success' && (
        <motion.path d="M6 12l4 4 8-8" stroke="var(--color-success-text)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
      )}
    </AnimatePresence>

    <!-- X path (error state, draws in) -->
    <AnimatePresence>
      {state === 'error' && (
        <motion.path d="M8 8l8 8M16 8l-8 8" stroke="var(--color-error-text)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
      )}
    </AnimatePresence>
  </svg>
  <span className="sr-only">Loading...</span>
</span>
```

---

## Accessibility

- `role="status"` wrapper with sr-only text
- sr-only text updates: "Loading..." → "Complete" / "Error" based on state
- `motion-reduce`: instant crossfade, no rotation, via `useReducedMotion()`
- `aria-busy` integration unchanged (Button handles this)

---

## Size Mapping

| Size | Dimensions | Stroke width |
|---|---|---|
| `sm` | `h-ico-sm w-ico-sm` (16px) | 3px |
| `md` | `h-ico-md w-ico-md` (20px) | 3px |
| `lg` | `h-ico-lg w-ico-lg` (24px) | 4px |

---

## Codebase Cleanup — Unify All Spinner Patterns

| File | Current pattern | Fix |
|---|---|---|
| `ui/search-input.tsx` | `IconLoader2` + `animate-spin` | Replace with `<Spinner size="sm" />` |
| `ui/file-upload.tsx` | `IconLoader2` + `animate-spin` | Replace with `<Spinner size="sm" />` |
| `shell/notification-center.tsx` | Inline `border-t` div spinner | Replace with `<Spinner />` |
| `shell/notification-preferences.tsx` | Inline `border-t` div spinner | Replace with `<Spinner />` |
| `ui/toast.tsx` | Already uses `<Spinner>` | No change needed |
| `ui/button.tsx` | Already uses `<Spinner>` | No change needed |

---

## Dependencies

- Add `framer-motion` (or `motion`) to `packages/core/package.json` dependencies
- Add to `manualChunks` in `vite.config.ts` — new `_chunks/motion.js` chunk (only loaded by components using FM)
- Framer Motion is ~32KB gzipped but tree-shakes well; only `motion`, `AnimatePresence`, `useReducedMotion` needed

---

## Future: Toast Integration

After this ships, the Spinner's `state` prop can be used in Toast loading toasts:
- `toast.loading()` renders `<Spinner />`
- When promise resolves, transition to `<Spinner state="success" />` before showing success toast
- This is a follow-up, not part of this PR

---

## References

- [Material Design arc spinner (CodePen)](https://codepen.io/supah/pen/BjYLdW)
- [Spinner-to-checkmark (CodePen)](https://codepen.io/gbuddell/pen/KwoRLX)
- [Framer Motion pathLength docs](https://motion.dev/docs/react-svg-animation)
- [Framer Motion path drawing tutorial](https://motion.dev/tutorials/react-path-drawing)
- [lucide-animated](https://lucide-animated.com) — animated Lucide icons with Motion
