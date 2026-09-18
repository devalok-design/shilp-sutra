# Mobile Responsiveness — Design Document

**Date:** 2026-04-06
**Benchmark:** MUI + Apple HIG + Material 3
**Scope:** Touch targets, responsive overlays, swipe gestures, shared BottomSheet primitive

## Motivation

The design system has excellent shell-level responsiveness (Sidebar, BottomNavbar, TopBar) but UI components have no mobile-aware behavior. Overlays (Dialog, Sheet, Popover, Select) feel like desktop widgets on phones. Touch targets fail WCAG 2.5.8 on 5 components.

## Approach: Responsive Component Behaviors

Components automatically adapt to mobile without consumers writing responsive code. Matches MUI's auto-fullScreen Dialog pattern and Apple HIG interaction standards.

---

## 1. Touch Targets

**Standard:** 44px minimum touch area (Apple HIG), 24px minimum visual (WCAG 2.5.8).

| Component | Current | Fix |
|-----------|---------|-----|
| Checkbox | 20px visual | Keep visual, add 44px touch target via `::before` pseudo-element |
| Radio | 20px visual | Same as checkbox |
| Slider thumb | 16px visual | 24px visual + 44px touch via `::before` |
| Switch sm | 18px height | Increase to 24px minimum + touch padding |
| Toast buttons | 24px (already fixed) | Add 44px touch area |

**Implementation:** `touch-target` Tailwind utility via preset plugin:
```css
.touch-target::before {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}
```

## 2. Responsive Overlays

### Dialog: fullScreen on mobile
- Desktop (>=768px): centered modal with backdrop (unchanged)
- Mobile (<768px): fullScreen — fills viewport, slide-up entrance, close button in header
- `responsive` prop (default `true`) — consumers can opt out
- CSS `md:` breakpoints for sizing (no JS hook flash)

### Sheet: bottom sheet on mobile
- Desktop: slides from left/right/top/bottom (unchanged)
- Mobile: always from bottom, drag handle visible, swipe-down to dismiss
- Snap points: half-screen and full-screen

### Popover: bottom drawer on mobile
- Desktop: floating positioned near trigger (unchanged)
- Mobile: slides up as mini bottom sheet with backdrop
- Uses `useIsMobile()` to swap rendering

### Select: bottom drawer on mobile
- Desktop: dropdown listbox (unchanged)
- Mobile: bottom sheet with full options list, 44px row heights
- Uses `useIsMobile()` to swap rendering

### Combobox: no change
Type-ahead search works well on mobile as-is.

## 3. Swipe Gestures & Motion

### Swipe-to-dismiss
All mobile bottom sheets get consistent swipe behavior:
- Drag handle: 32x4px rounded bar, `bg-surface-border`
- Swipe threshold: 30% of sheet height or >500px/s velocity
- `prefers-reduced-motion`: disable drag, keep tap dismiss

### Transition patterns
| Transition | Desktop | Mobile |
|-----------|---------|--------|
| Dialog open | Fade + scale 0.95 | Slide up |
| Dialog close | Fade + scale 0.95 | Slide down |
| Sheet open | Slide from side | Slide from bottom |
| Sheet close | Slide to side | Swipe/slide down |
| Popover open | Fade + scale | Slide up (mini sheet) |

Duration: `moderate-01` (150ms) entrance, `fast-02` (110ms) exit.

### Shared BottomSheet primitive
```
packages/core/src/ui/lib/bottom-sheet.tsx (internal, not exported)
```
Handles: backdrop, drag handle, swipe-to-dismiss, slide-up animation, snap points.
Composed by Dialog, Sheet, Popover, Select on mobile.

## 4. Implementation Architecture

### SSR strategy (hybrid)
- CSS `md:` breakpoints for visual changes (Dialog fullscreen sizing)
- `useIsMobile()` JS hook only for behavioral changes (swipe gestures, BottomSheet swap)
- First paint = desktop layout, switches after hydration (MUI's approach)

### Component change map
| Component | Change | JS hook? | CSS breakpoints? |
|-----------|--------|----------|-----------------|
| `ui/lib/bottom-sheet.tsx` | NEW | Yes | Yes |
| `ui/dialog.tsx` | Modify | No | Yes |
| `ui/sheet.tsx` | Modify | Yes | Yes |
| `ui/popover.tsx` | Modify | Yes | No |
| `ui/select.tsx` | Modify | Yes | No |
| `ui/checkbox.tsx` | Modify | No | No |
| `ui/radio.tsx` | Modify | No | No |
| `ui/slider.tsx` | Modify | No | No |
| `ui/switch.tsx` | Modify | No | No |
| `tailwind/preset.ts` | Modify | No | Yes |

### NOT in scope
- Responsive prop syntax (`size={{ base, md }}`)
- Native `<select>` fallback
- Pull-to-refresh, swipe list actions, virtual scroll
- Touch ripple effects
