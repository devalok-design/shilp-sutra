# Motion System Audit -- Phase 1e

**Phase:** 1e
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Strong

The architecture is right. The easing philosophy is genuinely world-class (direct Carbon lineage). The Framer Motion integration is deep (94 components) with well-designed presets and primitives. The main weakness is implementation discipline: inline magic numbers have drifted away from centralized tokens, and reduced-motion coverage has gaps in the 74 files that import Framer Motion without explicit `useReducedMotion` handling. The global CSS media query safety net cannot reach JS-driven animations, making the MotionProvider wrapper a critical dependency that consumers might omit.

---

## Executive Summary

The shilp-sutra motion system is architecturally strong -- a dual-track design (CSS tokens + Framer Motion presets) with a Carbon-inspired productive/expressive easing split and a dedicated MotionProvider for reduced-motion propagation. However, significant drift has occurred: 94 component files import `framer-motion`, but only ~20 actively call `useReducedMotion`. Inline magic-number durations and spring configs are scattered across dozens of files, bypassing the centralized token system. The global CSS `prefers-reduced-motion` media query acts as a nuclear safety net, but it is not a substitute for component-level awareness -- it cannot reach Framer Motion's JS-driven animations at all.

---

## Findings

### 1. Duration Scale

**Rating: Strong**

**Current State:**
Seven duration tokens defined in `packages/core/src/tokens/semantic.css` (lines 261-268):

| Token | Value | Intended Use |
|---|---|---|
| `--duration-instant` | 0ms | Immediate feedback |
| `--duration-fast-01` | 70ms | Micro-interactions |
| `--duration-fast-02` | 110ms | Small transitions (hover, focus) |
| `--duration-moderate-01` | 150ms | Standard UI transitions |
| `--duration-moderate-02` | 240ms | Moderate panels/drawers |
| `--duration-slow-01` | 400ms | Large-area reveals |
| `--duration-slow-02` | 700ms | Full-page transitions |

All seven are exposed as Tailwind utilities (`duration-fast-01`, etc.) in `packages/core/src/tailwind/preset.ts` (lines 375-383).

**World-Class Standard:**
- **IBM Carbon**: 7-step scale (0ms, 70ms, 110ms, 150ms, 240ms, 400ms, 700ms). Identical. This IS the Carbon scale.
- **Material Design 3**: 4 tokens (50ms, 100ms, 150ms, 200ms for "short"; 250ms, 300ms, 350ms, 400ms for "medium"; 450ms, 500ms, 550ms for "long"). M3 is more granular at the medium range.
- **Linear**: Uses 150ms/200ms/300ms for most interactions. Less formal but covers the same practical range.

**Gap Analysis:**
The scale itself is solid. The gap is that these tokens are barely used by the Framer Motion side. The `motion.ts` preset file uses hardcoded seconds (`duration: 0.11`, `0.07`, `0.4`, `0.2`) that loosely correspond to the token values (110ms, 70ms, 400ms, 200ms) but are not referencing them. This means changing a CSS token has zero effect on Framer Motion behavior.

Additionally, there is no duration token for the 200ms range that many components use for accordion/collapsible (hardcoded `200ms ease-out` in the Tailwind animation definitions at preset.ts line 337).

**Recommendation:**
1. Add a `--duration-moderate-01b` token at 200ms (or rename the scale to be more flexible).
2. Create a parallel JS constant map that mirrors the CSS tokens so Framer Motion presets can reference them.

**Effort:** S
**Priority:** P1

**Affected Components:** All 94 files importing framer-motion

---

### 2. Easing Philosophy

**Rating: World-Class**

**Current State:**
Two easing families defined in `packages/core/src/tokens/semantic.css` (lines 270-278), each with entrance/exit/standard variants:

| Token | Curve | Role |
|---|---|---|
| `--ease-productive-standard` | `cubic-bezier(0.2, 0, 0.38, 0.9)` | Task-focused transitions |
| `--ease-productive-entrance` | `cubic-bezier(0, 0, 0.38, 0.9)` | Elements entering view |
| `--ease-productive-exit` | `cubic-bezier(0.2, 0, 1, 0.9)` | Elements leaving view |
| `--ease-expressive-standard` | `cubic-bezier(0.4, 0.14, 0.3, 1)` | Attention-grabbing |
| `--ease-expressive-entrance` | `cubic-bezier(0, 0, 0.3, 1)` | Dramatic entrance |
| `--ease-expressive-exit` | `cubic-bezier(0.4, 0.14, 1, 1)` | Dramatic exit |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot |
| `--ease-linear` | `linear` | Constant rate |

**World-Class Standard:**
- **IBM Carbon**: Productive/Expressive split with entrance/exit/standard. This is a faithful reproduction of Carbon's motion philosophy.
- **Material Design 3**: Emphasized/Standard/Decelerate/Accelerate. Similar concept, different naming.

**Gap Analysis:** Essentially none. This is world-class.

**Recommendation:** No structural changes needed.

**Effort:** None
**Priority:** N/A

---

### 3. `prefers-reduced-motion` Compliance

**Rating: Gap**

**Current State:**
Three layers of reduced-motion support exist:

**Layer 1 -- Global CSS nuclear option** (`semantic.css` lines 537-547):
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
This catches all CSS-driven animations. However, it has **zero effect on Framer Motion JS-driven animations** (which are the majority -- 94 files).

**Layer 2 -- MotionProvider** (`packages/core/src/motion/motion-provider.tsx`):
Wraps children in Framer Motion's `MotionConfig` with `reducedMotion` setting. When set to `'user'` (default), Framer Motion automatically respects OS preference for `motion.*` elements. This is the correct approach.

**Layer 3 -- Component-level `useReducedMotion()`**:
Only 20 of the 94 Framer Motion component files explicitly call `useReducedMotion()`.

**74 component files with Framer Motion but NO explicit `useReducedMotion` call** rely entirely on MotionProvider/MotionConfig propagation.

**World-Class Standard:**
- **WAI-ARIA / WCAG 2.1 SC 2.3.3**: Users must be able to disable non-essential animation.
- **IBM Carbon**: Every animated component documents its reduced-motion behavior.
- **Framer Motion best practice**: `MotionConfig reducedMotion="user"` as global wrapper, with `useReducedMotion()` for imperative animations.

**Gap Analysis:**
1. **Not all app trees are guaranteed to have MotionProvider** -- it's opt-in for consumers. Without it, MotionConfig is absent.
2. **Components with complex animation logic** use imperative patterns that MotionConfig may not fully control.
3. **50+ instances of hardcoded `transition={{ duration: X }}` props** not conditioned on reduced-motion state.
4. **`button-processing.tsx`** has its own custom `useReducedMotion()` implementation -- duplicated logic.

**Recommendation:**
1. Document that MotionProvider is required at app root; add dev-mode warning if missing.
2. Audit all 74 files without explicit `useReducedMotion` -- verify MotionConfig propagation covers them.
3. Remove custom `useReducedMotion` in `button-processing.tsx`; use Framer Motion's hook.
4. Add `motion-reduce:` Tailwind variants as belt-and-suspenders.

**Effort:** M
**Priority:** P0 — accessibility compliance

**Affected Components:** 74 files with Framer Motion but no explicit reduced-motion handling

---

### 4. Framer Motion Integration

**Rating: Adequate**

**Current State:**
Core motion infrastructure in `packages/core/src/ui/lib/motion.ts` (71 lines):

5 spring presets: `snappy` (500/30/0.5), `smooth` (300/30/0.8), `bouncy` (400/15/0.5), `gentle` (200/25/0.8), `responsive` (350/28/0.6).

4 tween presets: `fade` (0.11s easeOut), `colorShift` (0.07s easeOut), `elegant` (0.4s custom), `layout` (0.2s custom).

7 motion primitives in `packages/core/src/motion/primitives.tsx`: `MotionFade`, `MotionScale`, `MotionPop`, `MotionSlide`, `MotionCollapse`, `MotionStagger`, `MotionStaggerItem`.

**World-Class Standard:**
- **Linear**: Centralized spring configs, similar feel (~300 stiffness, 30 damping for panels).
- **Resend**: Tight, snappy springs for micro-interactions.

**Gap Analysis:**
The presets are well-designed. The problem is **compliance drift**:
- Multiple components hardcode `{ type: 'spring', stiffness: 500, damping: 30 }` instead of using `springs.snappy`
- 50+ instances of inline `transition={{ duration: 0.15 }}` instead of using `tweens.*`
- CSS tokens define durations in ms; Framer uses seconds. No shared constant map links them.

**Recommendation:**
1. Replace inline spring/tween configs with preset references.
2. Create shared JS duration constants mirroring CSS tokens.
3. Lint rule to flag inline `stiffness`/`damping`/`duration` in .tsx files.

**Effort:** M
**Priority:** P1

**Affected Components:** 50+ files with inline animation values

---

### 5. Entrance/Exit Patterns

**Rating: Strong**

**Current State:**
Standardized patterns across overlays:
- Dialog: opacity 0 + scale 0.95 → 1 (desktop), y: 100% → 0 (mobile)
- Sheet: slide from edge
- Popover/Tooltip/Dropdown: opacity 0 + scale 0.95 → 1
- Toast: Framer Motion layout animations
- Bottom Sheet: y: '100%' → 0 + swipe-to-dismiss

All overlay components use `AnimatePresence` + `forceMount` on Radix portals for proper exit animations.

**World-Class Standard:**
- **Linear**: Consistent scale-from-0.95 for floating elements, slide-from-edge for panels.
- **Apple HIG**: Spring-based for spatial motion, tween for opacity only -- which is exactly what this system does.

**Gap Analysis:**
The common `{ opacity: 0, scale: 0.95 }` → `{ opacity: 1, scale: 1 }` pattern is hardcoded in each component rather than extracted into a shared constant.

**Recommendation:** Extract common entrance/exit variants into shared constants.

**Effort:** S
**Priority:** P2

---

### 6. Scroll-Triggered Motion

**Rating: Adequate**

**Current State:**
All 5 motion primitives accept `whileInView`, `viewportOnce`, and `viewportMargin` props with sensible defaults (`viewportOnce = true`, `viewportMargin = '-50px'`). No component uses `whileInView` internally -- it is purely opt-in for consumers.

**World-Class Standard:**
A design system should not decide when to animate on scroll; that is a composition-level decision. The current approach is correct.

**Recommendation:** No action needed.

**Effort:** None
**Priority:** N/A

---

### 7. Animation Performance

**Rating: Adequate**

**Current State:**
- Framer Motion targets `opacity`, `scale`, `x`, `y`, `rotate` -- all compositor-friendly.
- Height animations (accordion, collapsible, MotionCollapse) trigger layout reflow.
- Only 1 instance of `will-change` in entire codebase (`content-card.tsx`).
- 19 `layoutId=` instances trigger FLIP layout animation.
- Chart SVG animations are inherently paint-heavy.

**World-Class Standard:**
- **Google Web Vitals**: Only animate `transform` and `opacity` for 60fps.
- **Linear**: Transform exclusively for spatial motion; no width/height animations.

**Gap Analysis:**
1. Height animations are the main performance concern.
2. `will-change` is underused.
3. No performance budget or monitoring.

**Recommendation:**
1. Add scoped `will-change: transform` to components with frequent transform animations.
2. Consider `interpolate-size: allow-keywords` for height animations when browser support arrives.

**Effort:** S
**Priority:** P2

---

## Summary Table

| # | Audit Item | Rating | Priority | Effort |
|---|---|---|---|---|
| 1 | Duration Scale | **Strong** | P1 | S |
| 2 | Easing Philosophy | **World-Class** | N/A | None |
| 3 | `prefers-reduced-motion` | **Gap** | **P0** | M |
| 4 | Framer Motion Integration | **Adequate** | P1 | M |
| 5 | Entrance/Exit Patterns | **Strong** | P2 | S |
| 6 | Scroll-Triggered Motion | **Adequate** | N/A | None |
| 7 | Animation Performance | **Adequate** | P2 | S |

## Top 3 Actions

1. **Reduced-motion audit** (P0, M effort): Verify all 94 Framer Motion files are covered by MotionConfig propagation. Add explicit `useReducedMotion` to components using imperative `animate()` API. Remove duplicate custom hook in `button-processing.tsx`. Add dev-mode warning when MotionProvider is missing.

2. **Token alignment** (P1, M effort): Create shared JS duration constant map mirroring CSS tokens. Replace inline `stiffness`/`damping`/`duration` magic numbers with preset references. Lint rule to prevent future drift.

3. **Duration scale gap** (P1, S effort): Add a 200ms token to bridge `moderate-01` (150ms) and `moderate-02` (240ms). This is the most-used duration in the codebase and currently has no token.
