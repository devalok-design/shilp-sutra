# InputOTP

- Import: @devalok/shilp-sutra/ui/input-otp
- Server-safe: No
- Category: ui

## Props
    Standard input-otp props (maxLength, pattern, etc.)

## Compound Components
    InputOTP (root)
      InputOTPGroup
        InputOTPSlot (index: number, REQUIRED)
      InputOTPSeparator

## Example
```jsx
<InputOTP maxLength={6}>
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

## Gotchas
- Each InputOTPSlot requires an `index` prop (0-based)

## Changes
### v0.18.0
- **Added** `InputOTPProps` type export

### v0.1.1
- **Fixed** `animate-caret-blink` keyframe added to Tailwind preset — caret animation was silently broken

### v0.1.0
- **Added** Initial release
