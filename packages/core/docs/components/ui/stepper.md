# Stepper / Step

- Import: @devalok/shilp-sutra/ui/stepper
- Server-safe: No
- Category: ui

## Props
### Stepper
    activeStep: number (REQUIRED, 0-indexed)
    orientation: "horizontal" | "vertical"
    children: <Step> elements

### Step
    label: string (REQUIRED)
    description: string
    icon: ReactNode (overrides default number/checkmark)

## Defaults
    orientation: "horizontal"

### StepperContent
    activeStep: number (REQUIRED, 0-indexed — matches Stepper's activeStep)
    children: ReactNode (one child per step, only the active one is visible)
    className: string

## Compound Components
    Stepper (root)
      Step (label, description, icon)
    StepperContent (content panel, animates active step)

## Example
```jsx
<Stepper activeStep={1}>
  <Step label="Account" description="Create credentials" />
  <Step label="Profile" description="Add details" />
  <Step label="Review" />
</Stepper>
```

## Composability
- `Stepper` passes `activeStep` + `orientation` + each step's index down to every `Step` child via `StepperContext`. Each Step derives its own status (completed / active / pending) from its position vs `activeStep`.
- Step index is assigned by position in children — order matters. Don't conditionally render Steps via `&&` or `.filter()`; it shifts the indices and breaks the active highlight.
- `StepperContent` is separate from `Stepper` — it's the animated panel surface that shows one child per step index. Pass the same `activeStep` value to both.
- `orientation="vertical"` swaps the Step layout (stacked with connecting line on the left) AND changes how StepperContent animates (vertical crossfade instead of horizontal slide).
- Custom icons via `Step.icon` override the default number/checkmark — the icon slot still receives the status-based styling (muted for pending, accent for active/completed).

## Gotchas
- Steps before activeStep are "completed", at activeStep is "active", after is "pending"
- Don't conditionally render Step children — position is the index contract

## Changes
### v0.18.0
- **Fixed** `bg-interactive` changed to `bg-accent-9` (OKLCH migration)
- **Fixed** Wrapped Stepper context provider value in `useMemo` for performance

### v0.1.0
- **Added** Initial release
