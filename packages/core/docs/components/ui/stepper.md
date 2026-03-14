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

## Compound Components
    Stepper (root)
      Step (label, description, icon)

## Example
```jsx
<Stepper activeStep={1}>
  <Step label="Account" description="Create credentials" />
  <Step label="Profile" description="Add details" />
  <Step label="Review" />
</Stepper>
```

## Gotchas
- Steps before activeStep are "completed", at activeStep is "active", after is "pending"

## Changes
### v0.18.0
- **Fixed** `bg-interactive` changed to `bg-accent-9` (OKLCH migration)
- **Fixed** Wrapped Stepper context provider value in `useMemo` for performance

### v0.1.0
- **Added** Initial release
