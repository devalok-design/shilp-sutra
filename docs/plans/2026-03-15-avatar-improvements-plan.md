# Avatar & AvatarGroup Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring Avatar and AvatarGroup to best-in-class with role rings, deterministic fallback colors, badge overlay, hover expand, interactive overflow, animated presence, loading skeleton, and render prop.

**Architecture:** Additive enhancements to existing Avatar (core/ui/avatar.tsx) and AvatarGroup (core/composed/avatar-group.tsx). No structural rewrite — extend the CVA variants, add new props, enhance rendering. All changes are backward-compatible except AvatarGroup border default (surface-1 → surface-2).

**Tech Stack:** React 18, TypeScript 5.7 (strict), CVA, framer-motion 12, Radix Avatar primitive, Tailwind 3.4, Vitest + RTL + vitest-axe

**Design Doc:** `docs/plans/2026-03-15-avatar-improvements-design.md`

---

## Task 1: Deterministic Fallback Colors

**Files:**
- Modify: `packages/core/src/ui/avatar.tsx` (lines 147-160)
- Create: `packages/core/src/ui/__tests__/avatar-fallback-colors.test.tsx`
- Modify: `packages/core/src/ui/avatar.stories.tsx`

**Step 1: Write failing tests**

Create `packages/core/src/ui/__tests__/avatar-fallback-colors.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar, AvatarFallback } from '../avatar'

describe('AvatarFallback deterministic colors', () => {
  it('renders with a color class based on children text', () => {
    const { container } = render(
      <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    const fb = container.querySelector('[class*="bg-"]')
    expect(fb).toBeTruthy()
    // Should NOT be the old hardcoded accent-2 anymore by default
    // (it still CAN be accent-2 if the hash maps there, but it's deterministic)
  })

  it('same name always produces same color', () => {
    const { container: c1 } = render(
      <Avatar><AvatarFallback>Alice</AvatarFallback></Avatar>,
    )
    const { container: c2 } = render(
      <Avatar><AvatarFallback>Alice</AvatarFallback></Avatar>,
    )
    const bg1 = c1.querySelector('[data-slot="avatar-fallback"]')?.className
    const bg2 = c2.querySelector('[data-slot="avatar-fallback"]')?.className
    expect(bg1).toBe(bg2)
  })

  it('different names produce different colors (statistically)', () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank']
    const colors = new Set<string>()
    for (const name of names) {
      const { container } = render(
        <Avatar><AvatarFallback>{name}</AvatarFallback></Avatar>,
      )
      const fb = container.querySelector('[data-slot="avatar-fallback"]')
      const bgClass = Array.from(fb?.classList ?? []).find(c => c.startsWith('bg-'))
      if (bgClass) colors.add(bgClass)
    }
    // 8 names into 8 color slots — expect at least 3 unique colors
    expect(colors.size).toBeGreaterThanOrEqual(3)
  })

  it('colorSeed overrides children for color computation', () => {
    const { container: c1 } = render(
      <Avatar><AvatarFallback colorSeed="user-123">AB</AvatarFallback></Avatar>,
    )
    const { container: c2 } = render(
      <Avatar><AvatarFallback colorSeed="user-123">XY</AvatarFallback></Avatar>,
    )
    const bg1 = c1.querySelector('[data-slot="avatar-fallback"]')?.className
    const bg2 = c2.querySelector('[data-slot="avatar-fallback"]')?.className
    expect(bg1).toBe(bg2) // same seed → same color regardless of initials
  })
})
```

**Step 2: Run tests — should fail (colorSeed prop doesn't exist, colors are static)**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/avatar-fallback-colors.test.tsx`

**Step 3: Implement**

In `packages/core/src/ui/avatar.tsx`:

1. Add the color palette and hash function above the AvatarFallback component:

```tsx
const FALLBACK_COLORS = [
  { bg: 'bg-accent-2', text: 'text-accent-11' },
  { bg: 'bg-success-2', text: 'text-success-11' },
  { bg: 'bg-warning-2', text: 'text-warning-11' },
  { bg: 'bg-error-2', text: 'text-error-11' },
  { bg: 'bg-info-2', text: 'text-info-11' },
  { bg: 'bg-cat-purple-2', text: 'text-cat-purple-11' },
  { bg: 'bg-cat-pink-2', text: 'text-cat-pink-11' },
  { bg: 'bg-cat-teal-2', text: 'text-cat-teal-11' },
]

function getFallbackColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}
```

2. Update AvatarFallback to accept `colorSeed` and compute color:

```tsx
export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  colorSeed?: string
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, colorSeed, children, ...props }, ref) => {
  const seed = colorSeed ?? (typeof children === 'string' ? children : 'A')
  const { bg, text } = getFallbackColor(seed)

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        'flex h-full w-full items-center justify-center rounded-ds-full font-semibold',
        bg, text,
        typeof children === 'string' && children.length === 1 && 'tracking-wide',
        className,
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
})
```

3. Update barrel export to include `AvatarFallbackProps`.

**Step 4: Run tests — should pass**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/avatar-fallback-colors.test.tsx`

**Step 5: Add stories**

Add `FallbackColors` story showing 8 avatars with different names, demonstrating unique colors.

**Step 6: Commit**

```bash
git add packages/core/src/ui/avatar.tsx packages/core/src/ui/__tests__/avatar-fallback-colors.test.tsx packages/core/src/ui/avatar.stories.tsx
git commit -m "feat(core): add deterministic fallback colors to Avatar"
```

---

## Task 2: Role Ring

**Files:**
- Modify: `packages/core/src/ui/avatar.tsx` (lines 93-125)
- Create: `packages/core/src/ui/__tests__/avatar-ring.test.tsx`
- Modify: `packages/core/src/ui/avatar.stories.tsx`

**Step 1: Write failing tests**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Avatar, AvatarFallback } from '../avatar'

describe('Avatar ring', () => {
  it('has no a11y violations with ring', async () => {
    const { container } = render(
      <Avatar ring="lead"><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders ring-accent-7 for lead', () => {
    const { container } = render(
      <Avatar ring="lead"><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('ring-accent-7')
  })

  it('renders ring-warning-7 for admin', () => {
    const { container } = render(
      <Avatar ring="admin"><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('ring-warning-7')
  })

  it('renders ring-info-7 for client', () => {
    const { container } = render(
      <Avatar ring="client"><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('ring-info-7')
  })

  it('renders no ring by default', () => {
    const { container } = render(
      <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).not.toContain('ring-2')
  })
})
```

**Step 2: Run tests — should fail**

**Step 3: Implement**

Add ring type and maps:

```tsx
export type AvatarRing = 'none' | 'lead' | 'admin' | 'client'

const ringColorMap: Record<AvatarRing, string> = {
  none: '',
  lead: 'ring-2 ring-accent-7 ring-offset-2 ring-offset-surface-2',
  admin: 'ring-2 ring-warning-7 ring-offset-2 ring-offset-surface-2',
  client: 'ring-2 ring-info-7 ring-offset-2 ring-offset-surface-2',
}
```

Add `ring` prop to `AvatarProps`:

```tsx
export interface AvatarProps ... {
  status?: AvatarStatus
  ring?: AvatarRing
  children?: React.ReactNode
}
```

Apply ring on the outer `<span>` wrapper (line 105):

```tsx
<span className={cn(
  'relative inline-flex shrink-0',
  ring && ring !== 'none' && ringColorMap[ring],
  ring && ring !== 'none' && (shape === 'circle' || !shape) && 'rounded-ds-full',
  ring && ring !== 'none' && shape === 'square' && 'rounded-ds-none',
  ring && ring !== 'none' && shape === 'rounded' && 'rounded-ds-md',
)}>
```

**Step 4: Run tests, add stories (AllRings), commit**

```bash
git commit -m "feat(core): add role ring (lead/admin/client) to Avatar"
```

---

## Task 3: Badge Overlay

**Files:**
- Modify: `packages/core/src/ui/avatar.tsx`
- Create: `packages/core/src/ui/__tests__/avatar-badge.test.tsx`
- Modify: `packages/core/src/ui/avatar.stories.tsx`

**Step 1: Write failing tests**

```tsx
describe('Avatar badge', () => {
  it('renders number badge', () => {
    render(<Avatar badge={3}><AvatarFallback>MK</AvatarFallback></Avatar>)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders 99+ for large numbers', () => {
    render(<Avatar badge={150}><AvatarFallback>MK</AvatarFallback></Avatar>)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('hides badge when 0', () => {
    render(<Avatar badge={0}><AvatarFallback>MK</AvatarFallback></Avatar>)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders dot badge', () => {
    const { container } = render(
      <Avatar badge="dot"><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    expect(container.querySelector('[data-slot="avatar-badge-dot"]')).toBeInTheDocument()
  })

  it('renders custom ReactNode badge', () => {
    render(
      <Avatar badge={<span data-testid="custom">★</span>}><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    expect(screen.getByTestId('custom')).toBeInTheDocument()
  })

  it('has no a11y violations with badge', async () => {
    const { container } = render(
      <Avatar badge={5}><AvatarFallback>MK</AvatarFallback></Avatar>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

**Step 2: Run tests — fail**

**Step 3: Implement**

Add `badge` prop to AvatarProps:

```tsx
export interface AvatarProps ... {
  status?: AvatarStatus
  ring?: AvatarRing
  badge?: number | 'dot' | React.ReactNode
  children?: React.ReactNode
}
```

Add badge rendering in the Avatar component after the status dot:

```tsx
{/* Badge overlay — top-right */}
{badge != null && badge !== 0 && (
  badge === 'dot' ? (
    <span
      data-slot="avatar-badge-dot"
      className="absolute -right-0.5 -top-0.5 h-[8px] w-[8px] rounded-ds-full bg-error-9 ring-2 ring-surface-2"
    />
  ) : typeof badge === 'number' ? (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={springs.bouncy}
      className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-ds-full bg-error-9 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface-2"
      style={{ height: 16 }}
    >
      {badge > 99 ? '99+' : badge}
    </motion.span>
  ) : (
    <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center">
      {badge}
    </span>
  )
)}
```

Import `springs` from `./lib/motion` alongside `tweens`.

**Step 4: Run tests, add stories (WithBadge, DotBadge, CustomBadge), commit**

```bash
git commit -m "feat(core): add badge overlay (number/dot/custom) to Avatar"
```

---

## Task 4: Animated Presence Dot + Loading Skeleton

**Files:**
- Modify: `packages/core/src/ui/avatar.tsx`
- Modify: `packages/core/src/ui/__tests__/avatar-status-a11y.test.tsx`
- Create: `packages/core/src/ui/__tests__/avatar-loading.test.tsx`

**Step 1: Write failing tests for loading**

```tsx
describe('Avatar loading', () => {
  it('renders skeleton when loading', () => {
    const { container } = render(<Avatar loading size="md" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('does not render children when loading', () => {
    render(<Avatar loading><AvatarFallback>MK</AvatarFallback></Avatar>)
    expect(screen.queryByText('MK')).not.toBeInTheDocument()
  })

  it('has no a11y violations when loading', async () => {
    const { container } = render(<Avatar loading size="lg" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

**Step 2: Run — fail**

**Step 3: Implement**

Add `loading` prop to AvatarProps. When `loading=true`, render:

```tsx
if (loading) {
  return (
    <span className={cn('relative inline-flex shrink-0', ringClass)}>
      <span className={cn(avatarVariants({ size, shape }), 'animate-pulse bg-surface-3')} />
    </span>
  )
}
```

For animated presence dot, update the status dot rendering:

```tsx
<span
  className={cn(
    'absolute bottom-0 right-0 rounded-ds-full ring-2 ring-surface-2',
    statusColorMap[status],
    statusDotSizeMap[size ?? 'md'],
    status === 'online' && 'animate-pulse',
  )}
  role="img"
  aria-label={statusLabelMap[status]}
/>
```

**Step 4: Run tests, add stories (Loading, AnimatedOnline), commit**

```bash
git commit -m "feat(core): add loading skeleton and animated online presence to Avatar"
```

---

## Task 5: Image Crossfade Polish

**Files:**
- Modify: `packages/core/src/ui/avatar.tsx` (lines 128-144)

**Step 1: Enhance AvatarImage animation**

Change from opacity-only to scale+opacity:

```tsx
<motion.span
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={springs.smooth}
  className="h-full w-full"
>
```

Import `springs` alongside `tweens`.

**Step 2: Run existing avatar tests to ensure no regression**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/avatar`

**Step 3: Commit**

```bash
git commit -m "feat(core): enhance AvatarImage crossfade with scale animation"
```

---

## Task 6: AvatarGroup — Hover Expand + Border Fix + Size Parity

**Files:**
- Modify: `packages/core/src/composed/avatar-group.tsx`
- Modify: `packages/core/src/composed/__tests__/avatar-group.test.tsx`
- Modify: `packages/core/src/composed/avatar-group.stories.tsx`

**Step 1: Write failing tests**

Add to `avatar-group.test.tsx`:

```tsx
describe('AvatarGroup hover expand', () => {
  it('has group class on container for hover expand', () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'A' }, { name: 'B' }]} />,
    )
    expect(container.firstElementChild).toHaveClass('group')
  })

  it('renders border-surface-2 by default', () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'Alice' }]} />,
    )
    const avatar = container.querySelector('[class*="border-"]')
    expect(avatar?.className).toContain('border-surface-2')
  })
})

describe('AvatarGroup size parity', () => {
  it('renders xs size', () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'A' }]} size="xs" />,
    )
    expect(container.querySelector('[class*="h-ds-xs"]')).toBeTruthy()
  })

  it('renders xl size', () => {
    const { container } = render(
      <AvatarGroup users={[{ name: 'A' }]} size="xl" />,
    )
    expect(container.querySelector('[class*="h-ds-lg"]')).toBeTruthy()
  })
})
```

**Step 2: Run — fail**

**Step 3: Implement**

1. Update CVA to add `xs` and `xl` sizes, change border from `border-surface-1` to `border-surface-2`:

```tsx
const avatarSizeVariants = cva(
  'shrink-0 overflow-hidden rounded-ds-full border-2 border-surface-2',
  {
    variants: {
      size: {
        xs: 'h-[20px] w-[20px] text-[10px]',
        sm: 'h-ds-xs w-ds-xs text-ds-xs',
        md: 'h-ds-sm w-ds-sm text-ds-sm',
        lg: 'h-ds-md w-ds-md text-ds-md',
        xl: 'h-ds-lg w-ds-lg text-ds-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
)
```

2. Add overlap and expand maps:

```tsx
const overlapMap: Record<string, string> = {
  xs: '-ml-ds-02',
  sm: '-ml-ds-02b',
  md: '-ml-ds-03',
  lg: '-ml-ds-04',
  xl: '-ml-ds-05',
}
```

3. Add `group` class to container and `group-hover:ml-0 group-focus-within:ml-0 transition-all duration-200` to each avatar:

```tsx
<div
  ref={ref}
  className={cn('group flex items-center', className)}
  tabIndex={0}
  role="group"
  aria-label={`${users.length} team members`}
  {...props}
>
  {displayed.map((user, index) => {
    const avatar = (
      <Avatar
        key={user.name}
        className={cn(
          avatarSizeVariants({ size }),
          index > 0 && overlapClass,
          index > 0 && 'transition-all duration-200 group-hover:ml-0 group-focus-within:ml-0',
          'hover:z-50 hover:scale-110 hover:shadow-md',
          'group-hover:[&:not(:hover)]:opacity-80',
        )}
        style={{ zIndex: displayed.length - index }}
        ring={user.ring}
      >
        ...
      </Avatar>
    )
  })}
```

4. Add `borderColor` prop:

```tsx
export interface AvatarGroupProps ... {
  users: AvatarUser[]
  max?: number
  showTooltip?: boolean
  borderColor?: 'surface-1' | 'surface-2'
}
```

**Step 4: Run tests, add stories (HoverExpand, XsSize, XlSize), commit**

```bash
git commit -m "feat(core): add hover expand, size parity, border fix to AvatarGroup"
```

---

## Task 7: AvatarGroup — Interactive Overflow + Ring in Group + Render Prop

**Files:**
- Modify: `packages/core/src/composed/avatar-group.tsx`
- Modify: `packages/core/src/composed/__tests__/avatar-group.test.tsx`
- Modify: `packages/core/src/composed/avatar-group.stories.tsx`

**Step 1: Write failing tests**

```tsx
describe('AvatarGroup interactive overflow', () => {
  it('fires onOverflowClick when +N clicked', async () => {
    const onClick = vi.fn()
    const users = Array.from({ length: 6 }, (_, i) => ({ name: `User ${i}` }))
    render(<AvatarGroup users={users} max={3} onOverflowClick={onClick} />)
    await userEvent.click(screen.getByText('+3'))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders overflow badge as cursor-pointer when interactive', () => {
    const users = Array.from({ length: 6 }, (_, i) => ({ name: `User ${i}` }))
    const { container } = render(
      <AvatarGroup users={users} max={3} onOverflowClick={vi.fn()} />,
    )
    const badge = screen.getByText('+3').closest('div, button')
    expect(badge?.className).toContain('cursor-pointer')
  })
})

describe('AvatarGroup ring', () => {
  it('renders ring on avatar when user has ring property', () => {
    const users = [{ name: 'Lead', ring: 'lead' as const }]
    const { container } = render(<AvatarGroup users={users} />)
    expect(container.querySelector('[class*="ring-accent-7"]')).toBeTruthy()
  })
})

describe('AvatarGroup renderAvatar', () => {
  it('uses custom render function', () => {
    const users = [{ name: 'Test' }]
    render(
      <AvatarGroup
        users={users}
        renderAvatar={(user) => (
          <Avatar key={user.name} data-testid="custom-avatar">
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        )}
      />,
    )
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument()
  })
})
```

**Step 2: Run — fail**

**Step 3: Implement**

1. Extend `AvatarUser` type:

```tsx
export interface AvatarUser {
  name: string
  image?: string | null
  ring?: AvatarRing
}
```

2. Add new props:

```tsx
export interface AvatarGroupProps ... {
  onOverflowClick?: () => void
  overflowContent?: React.ReactNode
  renderAvatar?: (user: AvatarUser, index: number) => React.ReactNode
}
```

3. Update overflow badge rendering — make it a `<button>` when `onOverflowClick` is provided:

```tsx
{overflow > 0 && (
  <Tooltip>
    <TooltipTrigger asChild>
      {onOverflowClick ? (
        <button
          type="button"
          onClick={onOverflowClick}
          className={cn(
            avatarSizeVariants({ size }),
            overlapClass,
            'flex cursor-pointer items-center justify-center bg-accent-2 font-body font-semibold text-accent-11',
            'transition-all duration-200 group-hover:ml-0 group-focus-within:ml-0',
            'hover:scale-105 hover:bg-accent-3',
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </button>
      ) : (
        <div ... /* existing static badge */ />
      )}
    </TooltipTrigger>
    ...
  </Tooltip>
)}
```

4. Support `renderAvatar` — if provided, use it instead of default avatar rendering:

```tsx
const avatarElement = renderAvatar
  ? renderAvatar(user, index)
  : (
    <Avatar ring={user.ring} ... >
      {user.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback colorSeed={user.name} className="font-body font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
```

Note: also update default fallback to use the new `colorSeed={user.name}` for deterministic colors in groups.

**Step 4: Run tests, add stories (InteractiveOverflow, WithRings, CustomRenderAvatar), commit**

```bash
git commit -m "feat(core): add interactive overflow, ring support, render prop to AvatarGroup"
```

---

## Task 8: Component Docs + Stories Polish

**Files:**
- Modify: `packages/core/docs/components/ui/avatar.md`
- Modify: `packages/core/docs/components/composed/avatar-group.md`
- Modify: `packages/core/src/ui/avatar.stories.tsx` (polish all stories)
- Modify: `packages/core/src/composed/avatar-group.stories.tsx`

**Step 1: Update avatar.md**

Add props: `ring`, `badge`, `loading`. Add `AvatarFallbackProps` with `colorSeed`. Update Changes section with v0.21.0 entry. Add gotchas about ring offset color on different surfaces.

**Step 2: Update avatar-group.md**

Add props: `borderColor`, `onOverflowClick`, `overflowContent`, `renderAvatar`. Update `AvatarUser` type with `ring`. Add sizes `xs`, `xl`. Update Changes section. Add gotcha about border color matching surface context.

**Step 3: Polish stories**

Ensure comprehensive story coverage:

Avatar stories to add/update:
- FallbackColors (8 names, shows color variety)
- AllRings (lead, admin, client side by side)
- WithBadge (number, dot, custom icon)
- Loading (skeleton at all sizes)
- AnimatedPresence (online pulsing dot)
- KitchenSink (ring + status + badge all together)

AvatarGroup stories to add/update:
- HoverExpand (hover to see spread animation)
- InteractiveOverflow (click +N → action)
- WithRings (users with different roles)
- CustomRender (renderAvatar usage)
- AllSizes (xs through xl)
- OnCardSurface (demonstrates border-surface-2)

**Step 4: Run all avatar tests**

Run: `cd packages/core && pnpm vitest run src/ui/__tests__/avatar src/composed/__tests__/avatar`

**Step 5: Commit**

```bash
git commit -m "docs(core): update Avatar and AvatarGroup docs and stories for v0.21.0"
```

---

## Task 9: Full Verification

**Step 1:** Run full core test suite: `cd packages/core && pnpm vitest run`
**Step 2:** Run full karm test suite: `cd packages/karm && pnpm vitest run`
**Step 3:** Typecheck: `pnpm typecheck`
**Step 4:** Lint: `pnpm lint`
**Step 5:** Build: `pnpm build`
**Step 6:** Fix any issues, commit fixes

---

## Summary

| Task | Component | What |
|------|-----------|------|
| 1 | Avatar | Deterministic fallback colors |
| 2 | Avatar | Role ring (lead/admin/client) |
| 3 | Avatar | Badge overlay (number/dot/custom) |
| 4 | Avatar | Loading skeleton + animated presence |
| 5 | Avatar | Image crossfade polish |
| 6 | AvatarGroup | Hover expand + border fix + size parity |
| 7 | AvatarGroup | Interactive overflow + ring + render prop |
| 8 | Both | Docs + stories |
| 9 | Both | Full verification |
