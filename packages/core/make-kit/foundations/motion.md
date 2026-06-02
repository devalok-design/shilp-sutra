# Motion

framer-motion is the kit's animation engine. **Don't write CSS keyframes** — use motion primitives.

## Required setup

```tsx
import { MotionProvider } from '@devalok/shilp-sutra/motion'

<MotionProvider reducedMotion="user">
  <App />
</MotionProvider>
```

`reducedMotion="user"` respects the OS's "reduce motion" preference. Without `MotionProvider`, the primitives still work but reduced-motion is ignored — accessibility regression.

## Primitives

```tsx
import {
  MotionFade,
  MotionCollapse,
  MotionSlide,
  MotionPop,
  MotionScale,
  MotionStagger,
} from '@devalok/shilp-sutra/motion/primitives'
```

| Primitive | Use |
|---|---|
| `MotionFade` | Mount/unmount with opacity fade. |
| `MotionCollapse` | Height-based expand/collapse. |
| `MotionSlide` | Slide in from a direction (`from="top"|"bottom"|"left"|"right"`). |
| `MotionPop` | Scale + fade pop. Good for tooltips, badges entering. |
| `MotionScale` | Scale only. |
| `MotionStagger` | Stagger children with a configurable delay. |

```tsx
<MotionFade>
  <Card>This card fades in on mount.</Card>
</MotionFade>

<MotionStagger gap={0.05}>
  {items.map((item) => (
    <ListItem key={item.id}>{item.name}</ListItem>
  ))}
</MotionStagger>
```

## Springs & tweens

```tsx
import { springs, tweens } from '@devalok/shilp-sutra/motion'
```

| Spring | Feel |
|---|---|
| `springs.snappy` | Decisive, quick. Default for controls. |
| `springs.smooth` | Smooth, no overshoot. Default for layout. |
| `springs.bouncy` | Playful overshoot. Use sparingly — only for delight moments. |
| `springs.gentle` | Soft, slow. For ambient motion. |

| Tween | Duration |
|---|---|
| `tweens.fade` | 0.11s — color/opacity. |
| `tweens.colorShift` | 0.07s — hover color changes. |

Apply via framer's `transition` prop:

```tsx
import { motion } from 'framer-motion'
import { springs } from '@devalok/shilp-sutra/motion'

<motion.div animate={{ y: open ? 0 : -8 }} transition={springs.snappy}>
  …
</motion.div>
```

## Duration tokens (CSS, when motion primitives aren't right)

| Token | Duration |
|---|---|
| `--duration-fast-01` | 70 ms |
| `--duration-fast-02` | 110 ms |
| `--duration-moderate-01` | 150 ms |
| `--duration-moderate-02` | 240 ms |
| `--duration-slow-01` | 400 ms |
| `--duration-slow-02` | 700 ms |

Tailwind utilities: `duration-fast-01`, `duration-moderate-01`, etc. CSS variables: `var(--duration-moderate-01)`.

The system easing is `ease-productive-standard` — apply via `transition` shorthand:

```tsx
<div className="transition-colors duration-fast-02">…</div>
```

## Patterns

**Drawer / Sheet slide-in:** already built into `<Sheet>`. Don't reimplement.

**Dialog backdrop fade + content scale:** already built into `<Dialog>`. Don't reimplement.

**List item enter (e.g. new card appears):**

```tsx
<MotionFade>
  <Card>New item</Card>
</MotionFade>
```

**Staggered table rows:**

```tsx
<MotionStagger gap={0.03}>
  {rows.map((row) => <TableRow key={row.id}>{row.cells}</TableRow>)}
</MotionStagger>
```

**Async button feedback:** use `<Button onClickAsync>` — it auto-animates idle → loading → success/error → idle. Don't hand-roll spinner toggling.

```tsx
<Button onClickAsync={async () => { await save() }}>Save</Button>
```

## Rules

- **Wrap the app in `<MotionProvider reducedMotion="user">` once.** Without it, OS reduce-motion preference is ignored.
- **Never** write CSS `@keyframes` for app animations — use framer primitives.
- **Use motion primitives** before reaching for raw `motion.*` — they bundle the right spring + reduced-motion respect.
- **Don't animate layout** (height, width, top, left) — animate `transform` and `opacity`. The primitives do this for you.
- **Don't overuse `bouncy`** — bouncy works for one delight moment per session, not for every hover.
- For async button states, use `onClickAsync` + `asyncFeedbackDuration`, not manual `loading` toggling.
