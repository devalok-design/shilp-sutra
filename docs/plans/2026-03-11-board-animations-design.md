# Board Animation System — Design

> **Date:** 2026-03-11
> **Scope:** packages/core (upstream keyframes + utilities), packages/karm (board animations)
> **Dependencies:** Existing motion token system (semantic.css, preset.ts, motion.ts, transitions.tsx)

## Motion Rules

| Context | Mode | Duration Token | Easing |
|---------|------|----------------|--------|
| Hover, select, focus | Productive | fast-02 (110ms) | productive-standard |
| Filter chips, checkbox | Productive | moderate-01 (150ms) | productive-entrance/exit |
| Card enter, column enter | Expressive | moderate-02 (240ms) | expressive-entrance |
| Card exit, delete | Expressive | moderate-01 (150ms) | expressive-exit |
| Drag lift, drop | Expressive | moderate-02 (240ms) | bounce |
| Bulk bar, toolbar expand | Expressive | moderate-02 (240ms) | expressive-standard |
| Staggered load | Expressive | moderate-02 (240ms) | expressive-entrance, +30ms per card |

## Upstream Additions (packages/core)

### New Keyframes (preset.ts)

```
fade-in:       0% { opacity: 0 } → 100% { opacity: 1 }
fade-out:      0% { opacity: 1 } → 100% { opacity: 0 }
slide-up:      0% { opacity: 0; transform: translateY(8px) } → 100% { opacity: 1; transform: translateY(0) }
slide-right:   0% { opacity: 0; transform: translateX(20px) } → 100% { opacity: 1; transform: translateX(0) }
scale-in:      0% { opacity: 0; transform: scale(0.96) } → 100% { opacity: 1; transform: scale(1) }
scale-out:     0% { opacity: 1; transform: scale(1) } → 100% { opacity: 0; transform: scale(0.96) }
glow-pulse:    0%,100% { box-shadow: 0 0 0 rgba(accent, 0) } → 50% { box-shadow: 0 0 8px rgba(accent, 0.2) }
scale-bounce:  0% { transform: scale(0.8) } → 60% { transform: scale(1.05) } → 100% { transform: scale(1) }
lift:          0% { transform: scale(1) translateY(0); box-shadow: shadow-01 } → 100% { transform: scale(1.03) translateY(-2px); box-shadow: shadow-03 }
```

### New Tailwind Animations (preset.ts)

```
animate-fade-in:      fade-in var(--duration-moderate-02) var(--ease-expressive-entrance) both
animate-fade-out:     fade-out var(--duration-moderate-01) var(--ease-expressive-exit) both
animate-slide-up:     slide-up var(--duration-moderate-02) var(--ease-expressive-entrance) both
animate-slide-right:  slide-right var(--duration-moderate-02) var(--ease-expressive-entrance) both
animate-scale-in:     scale-in var(--duration-moderate-02) var(--ease-expressive-entrance) both
animate-scale-out:    scale-out var(--duration-moderate-01) var(--ease-expressive-exit) both
animate-glow-pulse:   glow-pulse var(--duration-slow-01) var(--ease-expressive-standard) once
animate-scale-bounce: scale-bounce var(--duration-moderate-02) var(--ease-bounce) both
animate-lift:         lift var(--duration-moderate-02) var(--ease-expressive-entrance) both
```

### Stagger System

CSS custom property `--stagger-index` set via inline style on each card/column.
Animation delay utility: `animation-delay: calc(var(--stagger-index, 0) * 30ms)`.
Tailwind class: `delay-stagger` — reads `--stagger-index` from element.

## Board Animation Surfaces

### 1. Card Enter/Exit
- **Enter (mount):** `animate-slide-up` with `--stagger-index` for staggered load
- **Exit (delete):** `animate-scale-out`, then parent gap collapses via grid-rows
- **New card added:** same slide-up, no stagger (plays immediately)

### 2. Card Hover & Select
- **Hover:** `translate-y(-1px)` + shadow-01→shadow-02 (already has transition-all)
- **Select:** ring fades in (opacity transition), `animate-glow-pulse` plays once
- **Deselect:** ring fades out

### 3. Checkbox
- **Appear:** fade + `animate-scale-bounce`
- **Check/uncheck:** scale pulse via CSS transition

### 4. Drag & Drop
- **Lift:** scale(1.03), shadow-03, rotate(±1.5deg) — applied to DragOverlay
- **Source placeholder:** opacity → 0.4
- **Drop:** scale back to 1 with bounce easing, rotation→0
- **Reorder:** dnd-kit built-in transitions (already working)

### 5. Column Enter
- **Board load:** `animate-slide-right` with `--stagger-index` (50ms per column)
- **Column content:** cards stagger after column visible (30ms per card)

### 6. Toolbar
- **Filter chips enter:** `animate-scale-in` with bounce, staggered 30ms
- **Filter chips exit:** `animate-scale-out`, 150ms
- **Clear all:** all chips exit simultaneously (no stagger)
- **My Tasks toggle:** color crossfade (already has transition-colors)

### 7. Bulk Action Bar
- Upgrade easing from productive to expressive-entrance
- Action buttons: staggered fade-in (30ms each) after bar opens
- Selected count: subtle scale bump on count change

### 8. Staggered Board Load
- Columns stagger: 50ms apart via `--stagger-index`
- Cards stagger: 30ms apart within each column
- Total perceived load: ~500ms for full board

### 9. Focus Ring (Keyboard Nav)
- Ring transitions: opacity + box-shadow animate (fast-02 / 110ms)

### 10. Context Menu
- Radix handles most animation — add scale(0.95→1) + fade via CSS

## Accessibility

- All animations respect `prefers-reduced-motion: reduce` (global rule in semantic.css)
- No animation carries meaning — state communicated via ARIA
- Stagger system uses `animation-delay`, which is killed by the global `animation-duration: 0.01ms` rule
