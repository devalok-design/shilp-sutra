# @devalok/shilp-sutra

> See the root [CHANGELOG.md](../../CHANGELOG.md) for detailed per-release notes.
> This file is the Changesets-generated summary shipped alongside releases.

## 0.35.0

### Minor Changes

- World-Class Audit wave 1–5: dark-mode contrast fix, responsive clamp() typography, letter spacing, surface-fg-subtle darkening, size/color axes on Combobox/NumberInput/Slider/InputOTP/Toggle, Tabs `orientation="vertical"`, Stepper `onStepClick`, AlertDialog `responsive`, Chart keyboard a11y + `ariaDescription`, typography composite utilities (text-heading-xl/text-body-md/etc.), layout/link/duration tokens, `useFormField` wired into 8 components, Autocomplete portal, NotificationCenter mobile Sheet, 136+ new tests + coverage thresholds.

### Breaking

- `MessageList` prop `isLoadingMore` → `loadingMore`.
- `AppCommandPalette` Karm defaults removed — use `CommandRegistryProvider`.
- `NumberInput` shape: pill → rounded rectangle.
- `Alert.variant="filled"` deprecated → use `"solid"` (alias still works).
- `SegmentedControl.variant="accent"` deprecated → use `"solid"` (alias still works).
- `@floating-ui/dom`, `@tiptap/*`, `prosemirror-state` now bundled (moved to devDeps).

## 0.34.1

### Patch Changes

- Upgrade Vite 7 → 8 (Rolldown bundler) + @vitejs/plugin-react 6 (Oxc). SSR safety patch for Rolldown CJS interop.

## 0.34.0

### Minor Changes

- Tailwind CSS 4, TypeScript 6, ESLint 10, tailwind-merge 3.5, react-zoom-pan-pinch 4 — full toolchain upgrade

## 0.33.2

### Patch Changes

- Upgrade TypeScript 6.0.2, ESLint 10, typescript-eslint 8.58.1, react-zoom-pan-pinch 4 (peer dep)

## 0.33.1

### Patch Changes

- Bump all safe patch/minor dependencies: React 19.2.5, Storybook 10.3.5, Vitest 4.1.4, framer-motion 12.38, @floating-ui/dom 1.7.6, @tabler/icons-react 3.41.1, esbuild 0.28, jsdom 29, and more

## 0.33.0

### Minor Changes

- Custom EmojiNode with spritesheet rendering, SplitButton component, schedule send, ButtonGroup rebuild, RichChatInput v2 enhancements, TipTap v3 upgrade
