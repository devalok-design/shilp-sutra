# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Toast now announces to screen readers (`role="status"`, `aria-live`)
- Input sets `aria-invalid` on error state
- Calendar date cells have aria-labels and keyboard support (Enter + Space)
- Table headers have `scope="col"` for screen reader navigation
- Animations respect `prefers-reduced-motion`
- Z-index violations fixed in leave-request tooltips
- ESLint jsx-a11y rules elevated to error level
- `--color-danger` deprecated in favor of `--color-error`

### Added
- `prefers-reduced-motion` global CSS rule
- `--color-text-interactive` token for WCAG AA text contrast
- Spacing tokens exposed to Tailwind (`p-ds-05`, `gap-ds-03`, etc.)
- Sizing tokens exposed to Tailwind (`h-ds-md`, `w-ico-lg`, etc.)
- Branded gradient tokens (`bg-gradient-brand`)
- Vitest + React Testing Library test infrastructure
- CI quality gates (typecheck, lint, test, build)
- Custom branded Storybook theme
- CHANGELOG.md
- CONTRIBUTING.md
- Design philosophy manifesto

### Changed
- CustomButton `type` prop renamed to `variant` (`type` deprecated)
- `DashboardSkeleton` in karm/admin renamed to `AdminDashboardSkeleton`

## [0.1.0] - 2026-02-28

### Added
- Initial release: 114 components across ui/, shared/, layout/, karm/ modules
- 3-tier design token system (primitives, semantic, Tailwind)
- Vendored Radix UI primitives (zero @radix-ui runtime deps)
- Dark mode support via `.dark` class toggle
- Storybook 8.6 with 95 stories
- AdminDashboard compound component pattern
- Import boundary enforcement for module architecture
