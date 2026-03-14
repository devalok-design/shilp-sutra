# Code

- Import: @devalok/shilp-sutra/ui/code
- Server-safe: Yes
- Category: ui

## Props
    variant: "inline" | "block"
    children: ReactNode

## Defaults
    variant="inline"

## Example
```jsx
<Code>onClick</Code>
<Code variant="block">{`const x = 1;\nconsole.log(x);`}</Code>
```

## Gotchas
- "block" renders as `<pre><code>`, "inline" renders as `<code>`

## Changes
### v0.1.1
- **Fixed** `leading-[150%]` replaced with `leading-ds-relaxed` for token compliance

### v0.1.0
- **Added** Initial release
