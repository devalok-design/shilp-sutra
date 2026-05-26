# @devalok/eslint-plugin-shilp-sutra

ESLint rules for the [`@devalok/shilp-sutra`](https://github.com/devalok-design/shilp-sutra) design system. Catches deprecated APIs, peer-cliff barrel imports, TW3-era class names, and ships autofixes that turn breaking-change migrations into one-command codemods.

```bash
pnpm add -D @devalok/eslint-plugin-shilp-sutra
```

## Use it

### Flat config (ESLint 9+)

```ts
// eslint.config.ts
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'

export default [
  shilpSutra.configs['flat/recommended'],
]
```

### Legacy `.eslintrc`

```jsonc
{
  "extends": ["plugin:@devalok/shilp-sutra/recommended"]
}
```

## Three presets

| Preset | Use case |
|---|---|
| `recommended` | Daily: migration rules at `error`, advisory rules at `warn`. What most consumers want. |
| `strict` | Every rule at `error`. CI gate for clean repos. |
| `migration` | Migration rules only. Run once after a DS upgrade: `pnpm eslint --fix --config <plugin/flat-migration> src/`. Skip after the upgrade lands. |

## The migration codemod loop

When you upgrade `@devalok/shilp-sutra`:

```bash
pnpm up @devalok/shilp-sutra@latest
pnpm eslint --fix src/                # autofixes 9 of 12 rules
git diff                              # review
pnpm test
```

Most breaking changes from 0.23 → today fix themselves. Per-site judgment calls (e.g. `no-tailwind-config-preset` removal, `useToast()` call-site rewrite, `toast({})` → `toast.success()`) flag without autofix.

## All 12 rules

| Rule | What | Autofix? | Applies from |
|---|---|---|---|
| `no-deprecated-button-variant` | `<Button variant="default">` → `variant="solid"`; `variant="destructive">` → `variant="solid" color="error"`; `color="default">` → `color="accent"` | ✅ | 0.32.0 |
| `no-deprecated-surface-token` | `bg-surface-1` → `bg-surface-base`, `bg-surface-2` → `bg-surface-raised`, etc. Same for `border-surface-N`, `text-surface-N`, etc. | ✅ | 0.23.0 |
| `no-deprecated-shadow-token` | `shadow-01` → `shadow-raised`, `shadow-02` → `shadow-raised-hover`, etc. `shadow-05` flagged (removed entirely). | ✅ (except `shadow-05`) | 0.23.0 |
| `no-deprecated-chip` | `<Chip>` → `<Badge>`. Imports + JSX rewritten. | ✅ | 0.32.0 |
| `no-tailwind-config-preset` | Flags `import shilpSutra from '@devalok/shilp-sutra/tailwind'` and `presets: [shilpSutra]` in `tailwind.config.*`. | ❌ (multi-file migration) | 0.38.0 |
| `prefer-per-component-import` | Splits barrel imports of cliff symbols (Toaster, DatePicker, RichTextEditor, MarkdownViewer, FilePreview, InputOTP, EmojiPicker, BlockRenderer, ErrorBlock, TextBlock) into their per-component subpaths. | ✅ | 0.40.0 |
| `use-toast-deprecated` | Flags `useToast()`. Autofix renames the import to `toast`; call-site rewrite is left for human review. | partial | 0.30.0 |
| `no-bg-gradient-to` | TW3 `bg-gradient-to-r` → TW4 `bg-linear-to-r`. | ✅ | 0.37.0 |
| `no-css-var-bracket` | TW3 `w-[--var]` → TW4 `w-(--var)`. | ✅ | 0.37.0 |
| `no-iconbutton-children` | `<IconButton>{...}</IconButton>` → `<IconButton icon={...} />`. | ✅ (single child) | 0.1.0 |
| `no-bare-shadow` | Bare `shadow` class — renders no shadow in TW4. Pick `shadow-raised` / `shadow-floating` / `shadow-overlay`. | ❌ (consumer chooses intent) | 0.37.0 |
| `toast-object-syntax` | `toast.success({title})` or `toast({title})` — both are old shapes. Use positional `toast.success("message", { description })`. | ❌ (context-dependent rewrite) | 0.30.0 |

## Bail on dynamic class names

Rules that scan `className` strings (`no-deprecated-surface-token`, `no-deprecated-shadow-token`, `no-bg-gradient-to`, `no-css-var-bracket`, `no-bare-shadow`) only inspect **literal** className values. They bail silently on:

```tsx
className={cn('bg-surface-1', maybe && 'bg-surface-2')}  // not linted
className={`bg-surface-${n}`}                              // not linted
```

False positives on dynamic class names are worse than false negatives. If you want stricter coverage, run a separate tailwind-merge audit OR migrate the cn() expressions to literals.

## Peer dependencies

```jsonc
{
  "peerDependencies": {
    "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0"
  }
}
```

No `@devalok/shilp-sutra` peer required — these rules work on consumer code regardless of which DS version is installed (the migration rules even work *before* you install the new version, so you can lint old code and see the autofix preview).

## Status

`v0.1.0` — initial release. Tracking via `appliesFrom` field on each rule; version matrix at `docs/version-matrix.md`.

## License

MIT.
