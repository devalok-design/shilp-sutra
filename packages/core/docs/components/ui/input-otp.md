# InputOTP

- Import: @devalok/shilp-sutra/ui/input-otp
- Server-safe: No
- Category: ui

## Props
### InputOTP
    maxLength: number (REQUIRED) — total number of slots
    value: string (controlled value; defaults to empty string)
    onChange: (value: string) => void
    onComplete: (value: string) => void — fires when all slots filled
    pattern: string | RegExp — restrict input (e.g. `REGEXP_ONLY_DIGITS`)
    state: "default" | "error" (error adds red border; auto-inherits from FormField)
    size: "sm" | "md" | "lg" (slot dimensions — propagates to InputOTPSlot via context)
    disabled: boolean
    containerClassName: string (on the outer group container — separate from inner input's className)

### InputOTPSlot
    index: number (REQUIRED, 0-based) — which position this slot renders

## Compound Components
    InputOTP (root — maxLength, value, onChange, size propagated via context)
      InputOTPGroup (visual group of slots)
        InputOTPSlot (index: number, REQUIRED — reads size from context)
      InputOTPSeparator (visual separator, e.g. between two groups of 3)

## Defaults
    size="md", state="default"

## Example
```jsx
<InputOTP maxLength={6} onComplete={verifyCode}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

## Composability
- Size propagates from InputOTP → InputOTPSlot via `InputOTPSizeContext` — don't set size on individual slots.
- Inside `<FormField>`: auto-inherits state, aria-describedby, aria-required from context. Explicit `state="error"` overrides.
- Underlying library is `input-otp` (OTPInput) — all standard library props (pattern, inputMode, autoFocus, etc.) pass through.

## Gotchas
- Each InputOTPSlot requires an `index` prop (0-based) matching its position
- `onComplete` only fires when ALL slots are filled — use `onChange` for per-character reactivity
- `containerClassName` (outer visual group) is distinct from `className` (the hidden input element itself)

## Changes
### v0.18.0
- **Added** `InputOTPProps` type export

### v0.1.1
- **Fixed** `animate-caret-blink` keyframe added to Tailwind preset — caret animation was silently broken

### v0.1.0
- **Added** Initial release
