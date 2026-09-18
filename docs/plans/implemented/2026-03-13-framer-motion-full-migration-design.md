# Framer Motion Full Migration Design

**Date:** 2026-03-13
**Status:** Approved
**Goal:** Replace the entire CSS-based animation system with Framer Motion. No backward compatibility concerns — only improvements. No feature regression.

---

## Context

shilp-sutra currently has 40+ Tailwind `@keyframes`, 4 CSS transition wrapper components (`Fade`, `Collapse`, `Grow`, `Slide`), Radix `data-[state=open/closed]` animations on 8+ overlay components, CSS stagger delay hacks across Karm, and micro-interactions via `transition-colors`/`transition-all`. Only the Spinner v2 uses Framer Motion today.

The entire motion system moves to Framer Motion for consistency, natural physics-based motion, real exit animations via `AnimatePresence`, and centralized reduced-motion handling.

---

## Architecture

### 1. Motion Presets (`motion-presets.ts`)

Replaces `motion.ts` (duration/easing CSS tokens) with Framer Motion transition objects.

**Spring configs** (spatial properties — position, scale, size, rotation):

| Preset | Use Case | Config |
|--------|----------|--------|
| `snappy` | Micro-interactions, buttons, hover, form inputs | `{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }` |
| `smooth` | Dialogs, sheets, panels, navigation | `{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }` |
| `bouncy` | Toasts, pop-ins, celebration feedback | `{ type: "spring", stiffness: 400, damping: 15, mass: 0.5 }` |
| `gentle` | Collapse/expand, accordion, height changes | `{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }` |

**Tween configs** (non-spatial — opacity, color, background, border):

| Preset | Use Case | Config |
|--------|----------|--------|
| `fade` | Opacity enter/exit | `{ type: "tween", duration: 0.15, ease: "easeOut" }` |
| `colorShift` | Hover color, bg, border transitions | `{ type: "tween", duration: 0.1, ease: "easeOut" }` |

**Stagger helper:**
- `stagger(delay = 0.04)` — returns `{ staggerChildren: delay }` for parent variants

**Design principle:** Springs for spatial motion (objects have mass and momentum), tweens for non-spatial properties (colors don't bounce).

### 2. Motion Primitives (`motion-primitives.tsx`)

Replaces `transitions.tsx` with Framer Motion-powered components with real exit animations.

| Primitive | Replaces | Animation | Default Preset |
|-----------|----------|-----------|----------------|
| `<MotionFade>` | `<Fade>` | opacity 0→1→0 | `fade` tween |
| `<MotionScale>` | `<Grow>` | scale 0.96→1 + opacity | `snappy` spring + `fade` |
| `<MotionPop>` | CSS `animate-pop-in` | scale 0.5→1 with overshoot + opacity | `bouncy` spring + `fade` |
| `<MotionSlide>` | `<Slide>` | translate from direction + opacity | `smooth` spring + `fade` |
| `<MotionCollapse>` | `<Collapse>` | height 0→auto + opacity | `gentle` spring + `fade` |
| `<MotionStagger>` | CSS stagger delay hack | Parent container, orchestrates children | `stagger(0.04)` |
| `<MotionStaggerItem>` | Individual stagger child | Fade + slide-up per item | `smooth` spring |

**Shared API:**

```tsx
<MotionScale
  show={isOpen}           // controls mount/unmount via AnimatePresence
  preset="snappy"         // override default spring
  className="..."         // passthrough
  as="section"            // polymorphic element (default: div)
  layout                  // opt-in layout animation
>
  {children}
</MotionScale>
```

- Every primitive wraps children in `<AnimatePresence>` internally
- `show` prop controls presence — when `false`, element animates out then unmounts
- All primitives forward refs and accept HTML div props

### 3. MotionProvider (Global Reduced Motion)

Single root provider controlling the entire motion system:

```tsx
<MotionProvider reducedMotion="user">  {/* auto-detects OS pref */}
  <App />
</MotionProvider>

<MotionProvider reducedMotion={true}>   {/* force disable */}
  <App />
</MotionProvider>
```

- Wraps Framer Motion's `<MotionConfig>` internally
- Exposes React context with active preset configs
- All primitives read from this context — zero per-component a11y code
- `useMotion()` hook for consumers needing presets in custom animations
- Three modes: `"user"` (OS preference), `true` (force off), `false` (force on)
- Charts also read from this context instead of their own `useReducedMotion()` check

### 4. Component Migration Map

#### Radix Overlay Components (data-state → AnimatePresence)

All use `forceMount` + `AnimatePresence` so Framer Motion controls the mount/unmount lifecycle.

| Component | New Approach |
|-----------|-------------|
| Dialog / AlertDialog | `<MotionScale>` content + `<MotionFade>` overlay |
| Sheet | `<MotionSlide direction={side}>` + `<MotionFade>` overlay |
| Popover / DropdownMenu / ContextMenu / Select | `<MotionScale>` with side-aware origin |
| HoverCard | `<MotionScale>` |
| Tooltip | `<MotionScale preset="snappy">` |
| Menubar submenu | `<MotionScale>` per submenu |
| NavigationMenu viewport | `<MotionScale>` with `layout` for size changes |

#### Structural Transitions

| Component | New Approach |
|-----------|-------------|
| Accordion | `<MotionCollapse>` |
| Collapsible | `<MotionCollapse>` |
| Tabs content | `<MotionFade>` with `mode="wait"` |

#### Micro-interactions

| Component | New Approach |
|-----------|-------------|
| Button | `motion.button` with `whileTap={{ scale: 0.97 }}` + `colorShift` tween |
| Card (hoverable) | `motion.div` with `whileHover={{ y: -2 }}` + `snappy` spring |
| Checkbox check | `motion.path` with `pathLength` draw |
| Switch thumb | `motion.span` with `layout` spring |
| Toggle pressed | `motion.button` with `whileTap` + bg color tween |
| Form inputs | `motion.input` / `motion.textarea` with `colorShift` tween |

#### Loading & Feedback

| Component | New Approach |
|-----------|-------------|
| Spinner | Already Framer Motion — ships as-is (v2) |
| Skeleton | Keep CSS `animate-pulse` |
| Progress (indeterminate) | Keep CSS `animate-progress-indeterminate` |
| Caret blink | Keep CSS `animate-caret-blink` |
| Toast | `<MotionSlide>` + `<MotionFade>` if we control it, or sonner handles |
| StatCard sparkline | `motion.path` with `pathLength` |

#### Karm Stagger Patterns

| Component | New Approach |
|-----------|-------------|
| BoardColumn | `<MotionStagger>` + `<MotionStaggerItem>` |
| BoardToolbar | `<MotionStagger>` + `<MotionStaggerItem>` |
| BulkActionBar | `<MotionStagger>` + `<MotionStaggerItem>` |
| KanbanBoard | `<MotionStagger delay={0.05}>` + `<MotionStaggerItem>` |
| TaskCard interactions | `motion.div` with `whileTap`/`animate` state |

#### Charts (Partial)

| Component | New Approach |
|-----------|-------------|
| Chart entrance | `<MotionFade>` + `<MotionScale>` wrapping container |
| Chart data transitions | **Keep D3** |
| StatCard sparkline | `motion.path` with `pathLength` |

### 5. Tailwind Preset Cleanup

**Remove (~200 lines, 40+ keyframes):**
- All entrance keyframes: fade-in, slide-up/down/left/right, scale-in, pop-in, swing-in, expand-in, spin-in
- All exit keyframes: fade-out, slide-out-up/down, scale-out, collapse-out
- Accordion/collapsible keyframes
- Feedback keyframes: ripple, check-pop, shake, scale-bounce, tab-indicator, wiggle, glow-pulse, rubber-band, lift, stamp, subtle-bounce, count-up, timer-bar, float
- Stagger delay utilities: delay-stagger, delay-stagger-50
- All corresponding `animate-*` utility classes

**Keep:**
- `animate-pulse` (skeleton)
- `animate-spin` (progress indeterminate fallback)
- `animate-caret-blink` (editor cursor)
- `animate-progress-indeterminate`
- `animate-skeleton-shimmer`
- Duration + easing CSS custom properties in `semantic.css` (for the kept CSS animations)

### 6. Export Strategy

**New public exports:**

| Export Path | Contents |
|-------------|----------|
| `./motion` | `MotionProvider`, `useMotion`, `springs`, `tweens`, `stagger` |
| `./motion/primitives` | `MotionFade`, `MotionScale`, `MotionPop`, `MotionSlide`, `MotionCollapse`, `MotionStagger`, `MotionStaggerItem` |

**Removed exports:**

| Export Path | Replacement |
|-------------|-------------|
| `./ui/transitions` | `./motion/primitives` |

All motion exports get `"use client"` directive (handled by `inject-use-client.mjs`).

**Consumer usage:**

```tsx
// App root
import { MotionProvider } from '@devalok/shilp-sutra/motion'
<MotionProvider><App /></MotionProvider>

// Primitives
import { MotionScale } from '@devalok/shilp-sutra/motion/primitives'

// Custom animation with DS presets
import { springs } from '@devalok/shilp-sutra/motion'
<motion.div animate={{ x: 100 }} transition={springs.smooth} />
```

---

## What Stays as CSS

These are infinite loops where Framer Motion adds complexity without visual improvement:
- Skeleton pulse (`animate-pulse`)
- Progress indeterminate bar (`animate-progress-indeterminate`)
- Skeleton shimmer (`animate-skeleton-shimmer`)
- Editor caret blink (`animate-caret-blink`)

---

## Accessibility

- `<MotionProvider>` handles all reduced motion detection globally
- Zero per-component accessibility code needed
- Three modes: `"user"` (OS), `true` (force off), `false` (force on)
- Springs/tweens → instant when reduced motion active
- `whileHover`/`whileTap` still apply (state changes, not motion)
- Charts read from same context

---

## New Capabilities (Beyond Replacement)

### Layout Animations

Framer Motion's `layout` prop smoothly animates elements when their position/size changes in the DOM — something CSS cannot do.

**Components that benefit:**

| Component | Layout Feature |
|-----------|---------------|
| Tabs indicator | `layoutId="tab-indicator"` — indicator slides between tabs instead of jumping |
| TaskCard (Kanban) | `layout` on cards — smooth reflow when cards are reordered, filtered, or moved between columns |
| NavigationMenu indicator | `layoutId="nav-indicator"` — active indicator slides between nav items |
| DataTable rows | `layout` — smooth reflow when rows are sorted/filtered |
| BoardColumn | `layout` — columns reflow smoothly when added/removed/reordered |
| BulkActionBar | `layout` — bar content reflows when actions change |

**Implementation:** Add `<LayoutGroup>` wrapper around groups of elements that should animate relative to each other. Individual elements opt in with `layout` or `layoutId` props.

### Scroll-Triggered Animations (`whileInView`)

Elements animate as they scroll into the viewport — replaces any IntersectionObserver patterns and enables progressive reveal for long pages.

**Components that benefit:**

| Component | Scroll Animation |
|-----------|-----------------|
| Dashboard widgets (Karm) | Staggered fade+slide as user scrolls down |
| DailyBrief sections | Progressive reveal per section |
| StatCard | Scale-in when scrolled into view |
| Chart containers | Fade+scale entrance when visible (pairs with chart entrance) |
| Any long list/grid | `<MotionStagger>` + `whileInView` for viewport-aware stagger |

**Implementation:**
- `whileInView` prop on motion primitives: `<MotionScale whileInView>`
- `viewport={{ once: true, margin: "-50px" }}` — trigger slightly before visible, animate once
- Pairs naturally with `<MotionStagger>` — parent uses `whileInView` to trigger stagger sequence

### Motion Primitive Extensions

The primitives gain optional props for these new capabilities:

```tsx
<MotionScale
  show={isOpen}
  layout                    // opt-in layout animation
  layoutId="unique-id"      // shared layout animation
  whileInView               // animate on scroll into view
  viewportOnce={true}       // only animate once (default: true)
  viewportMargin="-50px"    // trigger offset
>
  {children}
</MotionScale>
```

---

## Bundle Impact

- Framer Motion already in vendor chunk (~33KB gzipped)
- After migration, more components import it — but it's a single shared chunk
- Net preset.ts savings: ~200 lines of keyframe definitions removed
- No bundle size concern per user decision
