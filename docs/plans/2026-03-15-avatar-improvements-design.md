# Avatar & AvatarGroup Improvements — Design

**Date:** 2026-03-15
**Context:** General polish pass to bring Avatar and AvatarGroup to best-in-class quality. Informed by Linear, Atlassian, Vercel, Animate UI, Ant Design, and MUI patterns.

---

## Avatar (core/ui) — Enhancements

### 1. Role Ring

Colored ring around the avatar communicates role/authority. Semantically separate from the status dot (ring = role, dot = presence).

```tsx
<Avatar size="md" ring="lead" status="online">
  <AvatarImage src="..." />
  <AvatarFallback>MK</AvatarFallback>
</Avatar>
```

**Variants:**

| Ring | Token | Use Case |
|------|-------|----------|
| `none` (default) | No ring | Regular member |
| `lead` | `ring-accent-7` | Project lead / Task lead |
| `admin` | `ring-warning-7` | Admin / Manager |
| `client` | `ring-info-7` | External client |

**Implementation:** `ring-2` on root via CVA, `ring-offset-2 ring-offset-surface-2` for clean gap. Consumer can override offset color for surface-1 contexts via `ringOffsetColor` prop.

### 2. Deterministic Fallback Colors

Hash user name → one of 8 categorical colors from sapta-varna palette (step 2 bg / step 11 text). Same name = same color everywhere.

```tsx
<AvatarFallback colorSeed="user-123">MK</AvatarFallback>
```

**Colors:** accent, success, warning, error, info, cat-purple, cat-pink, cat-teal (all using existing DS tokens).

`colorSeed` defaults to children text content. Consumer can pass user ID for stability across name changes.

### 3. Badge Overlay

A generic badge overlay at top-right. Not just notifications — task count, unread count, version, custom icon.

```tsx
<Avatar badge={3}>        {/* number badge — "3" */}
<Avatar badge="dot">      {/* red dot indicator */}
<Avatar badge={0}>         {/* hidden when 0 */}
<Avatar badge={150}>       {/* truncates to "99+" */}
<Avatar badge={<IconStar className="h-2.5 w-2.5" />}> {/* custom icon */}
```

**Visuals:**
- Number: `min-w-[16px] h-[16px] rounded-full bg-error-9 text-error-fg text-[10px] font-bold`, offset `-top-0.5 -right-0.5`
- Dot: `h-[8px] w-[8px] rounded-full bg-error-9 ring-2 ring-surface-2`
- Custom icon: same container as number, renders ReactNode inside
- Entrance: `MotionPop` with `springs.bouncy`
- Hidden when `badge === 0` or `badge === undefined`

### 4. Animated Presence Dot

Enhance existing status dot:
- `online`: Subtle pulse animation (reduced opacity `animate-pulse`, 2s cycle)
- `busy`: Static solid — intentionally still ("do not disturb")
- `away`: Static solid (idle)
- `offline`: Static muted (no change)

Respects `prefers-reduced-motion` via existing `MotionProvider`.

### 5. Loading Skeleton

```tsx
<Avatar size="md" loading />
```

Renders `animate-pulse bg-surface-3 rounded-full` at correct size. No status dot, badge, ring, or children while loading.

### 6. Visual Polish

- **Image crossfade:** Add `scale: 0.96→1` with `springs.smooth` alongside the existing opacity fade. Subtle zoom-in as image loads.
- **Fallback letter-spacing:** `tracking-wide` for single-character, `tracking-normal` for two-character initials.

---

## AvatarGroup (core/composed) — Enhancements

### 1. Hover Expand Animation

On group hover, avatars spread apart to reveal faces.

**Implementation:** Pure CSS, no framer-motion needed.
```
default:     -ml-ds-03 (overlap)
group-hover: ml-0 (expanded)
transition:  transition-all duration-200
```

Also triggers on `:focus-within` for keyboard accessibility. Group container gets `group` class.

**Hovered avatar gets spotlight:**
- `z-50 scale-110` with subtle shadow
- Other avatars: `opacity-80`
- Creates immediate visual focus

### 2. Interactive Overflow Badge

```tsx
<AvatarGroup
  users={users}
  max={4}
  onOverflowClick={() => openMemberList()}         // callback mode
  overflowContent={<MemberListPopover />}          // popover mode
/>
```

- **Callback mode:** `onOverflowClick` fires, consumer handles. Badge gets hover/focus styles.
- **Popover mode:** `overflowContent` renders inside a DS Popover on click.
- **Neither:** Static badge (current behavior, no breaking change).
- Badge micro-interaction: `hover:scale-105 transition-transform duration-150`

### 3. Size Parity

Add `xs` and `xl` to match Avatar's 5 sizes:

| Size | Dimensions | Overlap |
|------|-----------|---------|
| xs | h-ds-xs w-ds-xs | -ml-ds-02 |
| sm | h-ds-xs w-ds-xs | -ml-ds-02b |
| md | h-ds-sm w-ds-sm | -ml-ds-03 |
| lg | h-ds-md w-ds-md | -ml-ds-04 |
| xl | h-ds-lg w-ds-lg | -ml-ds-05 |

### 4. Border Color

Default changes from `border-surface-1` → `border-surface-2` (surface layering rule). New `borderColor` prop for explicit control:

```tsx
<AvatarGroup borderColor="surface-1" />  // on page bg
<AvatarGroup borderColor="surface-2" />  // on card (default)
```

### 5. Ring/Role in Group

`AvatarUser` type extended:
```typescript
interface AvatarUser {
  name: string
  image?: string | null
  ring?: 'none' | 'lead' | 'admin' | 'client'
}
```

Each avatar in group renders with its ring. Leads/admins are visually distinct even in the compressed stack.

### 6. Render Prop

```tsx
<AvatarGroup
  users={users}
  renderAvatar={(user, index) => (
    <Avatar ring={user.ring} status={user.status} badge={user.unread}>
      <AvatarImage src={user.image} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  )}
/>
```

Unlocks full Avatar customization per item (badges, status, rings) without AvatarGroup needing to know about every Avatar feature.

---

## Color System Compliance

| Element | Token | System |
|---------|-------|--------|
| Ring colors | `ring-accent-7`, `ring-warning-7`, `ring-info-7` | Semantic tokens |
| Ring offset | `ring-offset-surface-2` | Surface layering |
| Fallback colors | sapta-varna step 2/11 pairs | Categorical palette |
| Badge | `error-9` / `error-fg` | Intent tokens |
| Skeleton | `bg-surface-3 animate-pulse` | Shimmer pattern |
| Group border | `border-surface-2` | Surface layering |
| Focus ring | `focus-visible:ring-2 ring-accent-9` | DS standard |
| Presence pulse | `animate-pulse` | Tailwind preset |

---

## Breaking Changes

Only one soft visual break: AvatarGroup border default changes `border-surface-1` → `border-surface-2`. Consistent with surface token migration. All other changes are additive new props.

---

## Priority Order

1. **Deterministic fallback colors** — Biggest visual bang, smallest code change
2. **Role ring** — High Karm impact (project/task leads visible)
3. **Badge overlay** — Generic utility, many use cases
4. **Hover expand animation** — AvatarGroup signature improvement
5. **Interactive overflow** — Completes the group experience
6. **Size parity + border color** — Consistency fixes
7. **Animated presence dot** — Polish
8. **Loading skeleton** — Polish
9. **Render prop + ring in group** — Advanced composition
10. **Image crossfade + letter-spacing** — Micro-polish
