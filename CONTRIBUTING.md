# Contributing to Shilp Sutra

## Setup

```bash
pnpm install
pnpm dev        # Start Storybook at localhost:6006
pnpm test       # Run tests
pnpm typecheck  # Type check
pnpm lint       # Lint
```

## Component Checklist

Every component MUST have:

- [ ] `React.forwardRef` with proper element type
- [ ] `displayName` set
- [ ] `className` prop accepted and merged via `cn()`
- [ ] Remaining props spread (`...props`)
- [ ] CVA for any component with `variant` or `size` props
- [ ] Exported prop types interface
- [ ] Unit test with `vitest-axe` assertion
- [ ] Storybook story with `tags: ['autodocs']`

## Compound Component Policy

Convert to compound component pattern when:
- Component exceeds 8 props, OR
- Contains 2+ independently renderable sections

Example: `AdminDashboard.Root` / `AdminDashboard.Calendar` / `AdminDashboard.Content`

## Module Boundaries

```
ui/ ← shared/ ← layout/ ← karm/
```

- `karm/` imports from: `ui/*`, `shared/*`, `layout/*`, `hooks/*`, sibling karm/
- `karm/` must NOT import from: `primitives/_internal/`, `@primitives/*`
- `shared/` must NOT import from: `karm/`

## Commit Convention

```
type(scope): description

feat(ui): add new component
fix(a11y): resolve contrast issue
refactor(karm): extract hook
test(shared): add tests for DatePicker
docs: update README
```

## Testing

- Every component needs a `.test.tsx` file
- Use `@testing-library/react` for rendering
- Include at least one `vitest-axe` accessibility assertion
- Test behavior, not implementation details

## Pull Requests

- Run `pnpm typecheck && pnpm lint && pnpm test` before submitting
- Include story updates for any visual changes
- Update CHANGELOG.md under `[Unreleased]`
