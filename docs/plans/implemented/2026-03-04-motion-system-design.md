# Motion System Design — Carbon-Inspired Productive/Expressive Model

**Date**: 2026-03-04
**Status**: Approved
**Approach**: Full token replacement + component migration + Storybook guide (Approach A)

## Philosophy

All motion in shilp-sutra follows Carbon Design System's two-mode model:

- **Productive motion** — Utilitarian, unobtrusive. Used when users are task-focused. Micro-interactions: button states, dropdowns, sorting, toggles. Motion acknowledges the interaction without demanding attention.
- **Expressive motion** — Enthusiastic, vibrant. Reserved for significant moments: modal entrance, primary action clicks, system alerts, toast notifications. Used sparingly to create rhythmic breaks.

Three easing categories cross the two modes:

- **Standard** — Element stays visible throughout (expand, resize, sort)
- **Entrance** — Element appears (dropdown opens, modal enters)
- **Exit** — Element leaves view (closing modal, dismissing toast)

## Token Architecture

### Duration Tokens (replacing existing)

| Token | Value | Use Case |
|-------|-------|----------|
| `--duration-instant` | `0ms` | Disabled animations, immediate state |
| `--duration-fast-01` | `70ms` | Button press, toggle, icon swap |
| `--duration-fast-02` | `110ms` | Fade in/out, color shifts |
| `--duration-moderate-01` | `150ms` | Tooltip, small dropdown, chip removal |
| `--duration-moderate-02` | `240ms` | Accordion expand, toast appear, dialog |
| `--duration-slow-01` | `400ms` | Modal entrance, large panel slide |
| `--duration-slow-02` | `700ms` | Overlay dimming, full-page transitions |

Old tokens (`--duration-fast`, `--duration-moderate`, `--duration-slow`, `--duration-deliberate`, `--duration-medium`, `--duration-enter`, `--duration-exit`) are removed entirely. Clean break, no aliases.

### Easing Tokens (replacing existing)

| Token | Value | When |
|-------|-------|------|
| `--ease-productive-standard` | `cubic-bezier(0.2, 0, 0.38, 0.9)` | Element transforms in place (sort, resize) |
| `--ease-productive-entrance` | `cubic-bezier(0, 0, 0.38, 0.9)` | Element appears subtly (dropdown) |
| `--ease-productive-exit` | `cubic-bezier(0.2, 0, 1, 0.9)` | Element disappears subtly |
| `--ease-expressive-standard` | `cubic-bezier(0.4, 0.14, 0.3, 1)` | Dramatic transforms (hero, attention) |
| `--ease-expressive-entrance` | `cubic-bezier(0, 0, 0.3, 1)` | Dramatic appearance (modal, toast) |
| `--ease-expressive-exit` | `cubic-bezier(0.4, 0.14, 1, 1)` | Dramatic departure |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions (kept) |
| `--ease-linear` | `linear` | Continuous animations — spinner, progress (kept) |

Old tokens (`--ease-standard`, `--ease-entrance`, `--ease-exit`) are removed entirely.

## Tailwind Mapping

### Duration utilities (in preset.ts)

```
duration-instant      → var(--duration-instant)
duration-fast-01      → var(--duration-fast-01)
duration-fast-02      → var(--duration-fast-02)
duration-moderate-01  → var(--duration-moderate-01)
duration-moderate-02  → var(--duration-moderate-02)
duration-slow-01      → var(--duration-slow-01)
duration-slow-02      → var(--duration-slow-02)
```

### Easing utilities (in preset.ts)

```
ease-productive-standard   → var(--ease-productive-standard)
ease-productive-entrance   → var(--ease-productive-entrance)
ease-productive-exit       → var(--ease-productive-exit)
ease-expressive-standard   → var(--ease-expressive-standard)
ease-expressive-entrance   → var(--ease-expressive-entrance)
ease-expressive-exit       → var(--ease-expressive-exit)
ease-bounce                → var(--ease-bounce)
ease-linear                → var(--ease-linear)
```

### Keyframe animations

Existing keyframes (ripple, shake, progress-indeterminate, skeleton-shimmer) are kept but updated to reference new duration tokens where applicable.

## motion() TypeScript Utility

Exported from `src/lib/motion.ts`:

```typescript
type MotionMode = 'productive' | 'expressive';
type MotionCategory = 'standard' | 'entrance' | 'exit';
type DurationToken = 'instant' | 'fast-01' | 'fast-02' | 'moderate-01' | 'moderate-02' | 'slow-01' | 'slow-02';

const easings: Record<MotionCategory, Record<MotionMode, string>>;
const durations: Record<DurationToken, string>;

export function motion(category: MotionCategory, mode: MotionMode): string;
export function duration(token: DurationToken): string;
```

## Component Migration Map

### Existing components (update tokens)

| Component | Current Motion | New Motion | Mode |
|-----------|---------------|------------|------|
| Button | `duration-fast ease-standard` | `duration-fast-01 ease-productive-standard` | Productive |
| Content Card | `duration-moderate` | `duration-fast-02 ease-productive-standard` | Productive |
| Task Card | `duration-moderate` | `duration-fast-02 ease-productive-standard` | Productive |
| Board Column | `duration-moderate` | `duration-fast-02 ease-productive-standard` | Productive |
| Attendance CTA | `transition-all duration-200` | `duration-moderate-01 ease-expressive-standard` | Expressive |
| Global Loading | `duration-slow ease-in-out` | `duration-slow-01 ease-productive-standard` | Productive |
| Skeleton (shimmer) | `1.5s ease-in-out` hardcoded | `duration-slow-02 ease-linear` | Productive |
| Progress (indeterminate) | `1.5s ease-in-out` hardcoded | `duration-slow-02 ease-linear` | Productive |
| Chat Typing Indicator | `animate-bounce` default | `duration-moderate-02 ease-bounce` | Expressive |
| Date Picker cells | `transition-colors` no token | `duration-fast-01 ease-productive-standard` | Productive |
| Command Palette | Radix animate-in/out | `duration-moderate-02 ease-expressive-entrance/exit` | Expressive |
| Streaming Text cursor | `animate-pulse` | stays `animate-pulse` | — |
| Spinner | `animate-spin` | stays `animate-spin` | — |

### New motion additions (components without motion today)

| Component | Motion Treatment | Mode |
|-----------|-----------------|------|
| Tooltip | `duration-fast-02 ease-productive-entrance` on show | Productive |
| Dialog/Sheet | `duration-moderate-02 ease-expressive-entrance/exit` | Expressive |
| Dropdown Menu | `duration-moderate-01 ease-productive-entrance` | Productive |
| Accordion | `duration-moderate-02 ease-productive-standard` | Productive |
| Toast | `duration-moderate-02 ease-expressive-entrance` | Expressive |

## Storybook Motion Guide

New story at `src/stories/foundations/Motion.stories.tsx` / `Motion.mdx`:

1. **Overview** — Productive vs. expressive philosophy with visual examples
2. **Duration scale** — Interactive visualization of all 7 durations with animated boxes
3. **Easing curves** — Live bezier curve previews + animated comparison of productive vs expressive
4. **Usage decision tree** — "Is this a task-focused interaction? → Productive. Is this an attention moment? → Expressive"
5. **Component examples** — Live demos showing each component's motion
6. **Code snippets** — How to use tokens in your own components
7. **Accessibility** — How `prefers-reduced-motion` works

## Accessibility

The existing global `prefers-reduced-motion` media query in `semantic.css` remains:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Individual components that use keyframe animations keep their `motion-reduce:animate-none` utility as defense-in-depth.

## What Does NOT Change

- Token architecture flow: `primitives.css → semantic.css → tailwind preset.ts`
- Dark mode toggle (motion is theme-independent)
- Existing keyframe definitions (ripple, shake, etc.)
- `prefers-reduced-motion` global handler
- Spinner and Streaming Text cursor (already correct)
