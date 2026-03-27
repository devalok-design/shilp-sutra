# Input Section Types — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Stripe-style label sections to Input — tinted background, vertical separator, auto-width, string auto-inference.

**Architecture:** Migrate section rendering from absolute positioning to flexbox. Add `startSectionType`/`endSectionType` props. String sections auto-infer as label type. Icon sections keep fixed width for backward compat.

**Tech Stack:** React 18, TypeScript, CVA, Tailwind, shilp-sutra tokens.

**Design Doc:** `docs/plans/2026-03-27-input-section-types-design.md`

---

## Conventions

- **File:** `packages/core/src/ui/input.tsx`
- **Test:** `packages/core/src/ui/input.test.tsx`
- **Stories:** `packages/core/src/ui/input.stories.tsx`
- **Typecheck:** `pnpm --filter @devalok/shilp-sutra typecheck`
- **Test:** `pnpm --filter @devalok/shilp-sutra test -- --run -- input`
- **Commit after each task.**

---

## Task 1: Add section type props + auto-inference logic

**File:** `packages/core/src/ui/input.tsx`

Add to `InputProps`:

```typescript
/** Section visual type. 'label' gets tinted bg + separator. Default: 'icon' (auto-inferred from string content). */
startSectionType?: 'icon' | 'label'
/** Section visual type for end. Default: 'icon' (auto-inferred from string content). */
endSectionType?: 'icon' | 'label'
```

In the component body, after resolving `resolvedStart`/`resolvedEnd`, compute effective section types:

```typescript
const startType = startSectionType ?? (typeof resolvedStart === 'string' ? 'label' : 'icon')
const endType = endSectionType ?? (typeof resolvedEnd === 'string' ? 'label' : 'icon')
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Input section type props + string auto-inference`

---

## Task 2: Migrate to flexbox layout + render label sections

**File:** `packages/core/src/ui/input.tsx`

This is the main change. Replace the absolute-positioned sections with flex children.

**Start section rendering:**

```tsx
{hasStart && startType === 'label' && (
  <span
    className={cn(
      'flex items-center shrink-0 select-none border-r border-surface-border text-surface-fg-muted self-stretch',
      size === 'xs' || size === 'sm' ? 'px-ds-02 text-ds-sm' : 'px-ds-03 text-ds-sm',
      size === 'lg' && 'text-ds-md',
      'rounded-l-[inherit] bg-surface-raised',
    )}
  >
    {resolvedStart}
  </span>
)}
{hasStart && startType === 'icon' && (
  <IconProvider size={iconSizeMap[size]}>
    <span
      className={cn(
        'flex items-center justify-center shrink-0 text-surface-fg-muted',
        sectionWidthMap[size],
        !startSectionClickable && 'pointer-events-none',
      )}
    >
      {resolvedStart}
    </span>
  </IconProvider>
)}
```

**Input element:** Remove the absolute-positioning padding hacks. The input is now `flex-1 min-w-0`:

```tsx
<input
  className={cn(
    'flex-1 min-w-0 h-full bg-transparent outline-none font-sans',
    'placeholder:text-surface-fg-subtle',
    'disabled:cursor-not-allowed',
    'read-only:cursor-default',
    // Only apply horizontal padding when no label section on that side
    startType === 'label' ? 'pl-ds-03' : hasStart ? pad.withStart : pad.base.split(' ')[0],
    endType === 'label' ? 'pr-ds-03' : hasEnd ? pad.withEnd : pad.base.split(' ')[1] ?? pad.base,
    className,
  )}
/>
```

Actually — simpler approach. For icon sections, keep the absolute positioning (backward compat). For label sections, use flexbox. The wrapper already has `flex items-center`, so label sections just become flex children. Icon sections stay absolute.

Wait — mixing absolute and flex children is fragile. Better: migrate everything to flexbox. Icon sections get their fixed width via `w-[38px]` as a flex child instead of `absolute left-0`. The input gets padding only for icon sections (which overlap the input via negative margin or the input simply has no padding on that side since the icon is decorative).

Simplest correct approach: **all sections become flex children**. Icon sections use fixed width. Label sections use auto width. Input is `flex-1`. Remove `paddingMap` entirely — the input gets uniform `px-ds-03` (or size-appropriate) padding, and sections sit beside it as siblings.

For icon sections, the icon needs to visually overlap the input slightly (current behavior). With flexbox, the icon is a separate cell, not overlapping. This changes the visual slightly — the icon sits to the left of the input text, not over the input's left padding.

This is actually BETTER. The current absolute positioning is a hack. Let the icon be a proper flex sibling.

**Updated approach:**

```tsx
<div className={cn(inputWrapperVariants({ size }), ...)}>
  {/* Start section */}
  {hasStart && (
    startType === 'label' ? (
      <span className="flex items-center shrink-0 select-none border-r border-surface-border text-surface-fg-muted self-stretch rounded-l-[inherit] bg-surface-raised px-ds-03 text-ds-sm">
        {resolvedStart}
      </span>
    ) : (
      <IconProvider size={iconSizeMap[size]}>
        <span className={cn('flex items-center justify-center shrink-0 text-surface-fg-muted', sectionWidthMap[size], !startSectionClickable && 'pointer-events-none')}>
          {resolvedStart}
        </span>
      </IconProvider>
    )
  )}

  {/* Input */}
  <input className={cn('flex-1 min-w-0 h-full bg-transparent outline-none font-sans placeholder:text-surface-fg-subtle disabled:cursor-not-allowed read-only:cursor-default', inputPaddingClass, className)} ... />

  {/* End section */}
  {hasEnd && (
    endType === 'label' ? (
      <span className="flex items-center shrink-0 select-none border-l border-surface-border text-surface-fg-muted self-stretch rounded-r-[inherit] bg-surface-raised px-ds-03 text-ds-sm">
        {resolvedEnd}
      </span>
    ) : (
      <IconProvider size={iconSizeMap[size]}>
        <span className={cn('flex items-center justify-center shrink-0 text-surface-fg-muted', sectionWidthMap[size], !endSectionClickable && 'pointer-events-none')}>
          {resolvedEnd}
        </span>
      </IconProvider>
    )
  )}
</div>
```

Input padding simplifies to just horizontal padding based on size (no more `withStart`/`withEnd` variants):

```typescript
const inputPadding: Record<string, string> = {
  xs: 'px-ds-02',
  sm: 'px-ds-03',
  md: 'px-ds-03',
  lg: 'px-ds-04',
}
```

Remove `paddingMap` entirely. Keep `sectionWidthMap` for icon sections only.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Input flexbox layout + label section rendering`

---

## Task 3: Update tests

**File:** `packages/core/src/ui/input.test.tsx`

Read existing tests. Add:

```typescript
describe('section types', () => {
  it('renders string startSection as label with separator', () => {
    render(<Input startSection="$" />)
    const label = screen.getByText('$')
    expect(label.className).toContain('border-r')
    expect(label.className).toContain('bg-surface-raised')
  })

  it('renders string endSection as label with separator', () => {
    render(<Input endSection=".com" />)
    const label = screen.getByText('.com')
    expect(label.className).toContain('border-l')
    expect(label.className).toContain('bg-surface-raised')
  })

  it('renders ReactElement startSection as icon (no separator)', () => {
    render(<Input startSection={<span data-testid="icon">🔍</span>} />)
    const icon = screen.getByTestId('icon')
    expect(icon.closest('span')?.className).not.toContain('border-r')
  })

  it('explicit startSectionType="label" overrides auto-inference', () => {
    render(<Input startSection={<span>Custom</span>} startSectionType="label" />)
    const label = screen.getByText('Custom')
    expect(label.closest('span')?.className).toContain('border-r')
  })

  it('explicit startSectionType="icon" overrides string inference', () => {
    render(<Input startSection="$" startSectionType="icon" />)
    const el = screen.getByText('$')
    expect(el.closest('span')?.className).not.toContain('border-r')
  })
})
```

Existing tests may need updates if they check for absolute positioning classes. Fix any regressions.

**Verify:** `pnpm --filter @devalok/shilp-sutra test -- --run -- input`

**Commit:** `test(core): Input label section tests — auto-inference, separator, background`

---

## Task 4: Update stories

**File:** `packages/core/src/ui/input.stories.tsx`

Add stories demonstrating label sections:

1. **LabelSections** — Currency ($), URL (https://), domain (.com), both sides ($ + .00):

```tsx
export const LabelSections: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      <Input startSection="$" placeholder="0.00" />
      <Input startSection="https://" placeholder="example.com" />
      <Input endSection=".com" placeholder="yoursite" />
      <Input startSection="$" endSection=".00" placeholder="100" />
      <Input startSection="@" placeholder="username" />
      <Input startSection="kg" endSection="per item" placeholder="0" size="lg" />
    </div>
  ),
}
```

2. **MixedSections** — Label + icon on same input:

```tsx
export const MixedSections: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      <Input startSection="$" endSection={<Icon icon={IconInfoCircle} />} endSectionClickable placeholder="Amount" />
      <Input startSection={<Icon icon={IconSearch} />} endSection=".com" placeholder="Search domains" />
    </div>
  ),
}
```

**Commit:** `feat(core): Input label section stories — currency, URL, domain, mixed`

---

## Task 5: Update docs

**Files:**
- `packages/core/docs/components/ui/input.md` — add section types to v0.29.0 entry + props table
- `packages/core/llms.txt` — update Input entry with sectionType props
- Regenerate: `cd packages/core && node scripts/build-component-docs.mjs`

**Commit:** `docs: Input label section types — props, examples, llms.txt`

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Props + auto-inference | input.tsx |
| 2 | Flexbox layout + label rendering | input.tsx |
| 3 | Tests | input.test.tsx |
| 4 | Stories | input.stories.tsx |
| 5 | Docs | input.md, llms.txt, llms-full.txt |
