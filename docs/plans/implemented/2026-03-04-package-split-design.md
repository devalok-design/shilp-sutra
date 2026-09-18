# Package Split Design — @devalok/shilp-sutra

**Date**: 2026-03-04
**Status**: Approved
**Approach**: 3 npm packages (Approach B)

## Decision Summary

Split shilp-sutra from a single 111 MB package into 3 independently published npm packages:

| Package | Scope | Est. size |
|---|---|---|
| `@devalok/shilp-sutra` | Core UI, composed, shell, tokens, tailwind, fonts | ~15 MB |
| `@devalok/shilp-sutra-brand` | SVG logo components, favicon utils, brand config | ~2 MB |
| `@devalok/shilp-sutra-karm` | 6 karm domain sub-modules | ~1 MB |

## Registry & License

- **Registry**: npm public (npmjs.com)
- **License**: MIT with credits
- **Fonts**: Google Sans (SIL OFL, released Dec 2025) + Ranade — stay in core package

## Directory Structure

```
shilp-sutra/
├── packages/
│   ├── core/                          ← @devalok/shilp-sutra
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── ui/
│   │       ├── composed/
│   │       ├── shell/
│   │       ├── tokens/
│   │       ├── tailwind/
│   │       ├── hooks/
│   │       └── primitives/
│   │
│   ├── brand/                         ← @devalok/shilp-sutra-brand
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── brand.config.ts
│   │       ├── devalok/
│   │       ├── karm/
│   │       └── assets/                (SVGs only, PNGs excluded from publish)
│   │
│   └── karm/                          ← @devalok/shilp-sutra-karm
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── src/
│           ├── board/
│           ├── tasks/
│           ├── chat/
│           ├── dashboard/
│           ├── client/
│           └── admin/
│
├── fonts/                             (shared, referenced by core)
├── pnpm-workspace.yaml
├── package.json                       (root workspace)
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Package Exports Maps

### @devalok/shilp-sutra (core)

```json
{
  "exports": {
    "./tokens": "./dist/tokens/index.css",
    "./ui": { "import": "./dist/ui/index.js", "types": "./dist/ui/index.d.ts" },
    "./composed": { "import": "./dist/composed/index.js", "types": "./dist/composed/index.d.ts" },
    "./shell": { "import": "./dist/shell/index.js", "types": "./dist/shell/index.d.ts" },
    "./tailwind": { "import": "./dist/tailwind/index.js", "types": "./dist/tailwind/index.d.ts" },
    "./fonts/*": "./fonts/*"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  },
  "peerDependenciesMeta": {
    "next": { "optional": true }
  }
}
```

### @devalok/shilp-sutra-brand

```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./devalok": { "import": "./dist/devalok/index.js", "types": "./dist/devalok/index.d.ts" },
    "./karm": { "import": "./dist/karm/index.js", "types": "./dist/karm/index.d.ts" },
    "./assets/*": "./dist/assets/*"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}
```

### @devalok/shilp-sutra-karm

```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./board": { "import": "./dist/board/index.js", "types": "./dist/board/index.d.ts" },
    "./tasks": { "import": "./dist/tasks/index.js", "types": "./dist/tasks/index.d.ts" },
    "./chat": { "import": "./dist/chat/index.js", "types": "./dist/chat/index.d.ts" },
    "./dashboard": { "import": "./dist/dashboard/index.js", "types": "./dist/dashboard/index.d.ts" },
    "./client": { "import": "./dist/client/index.js", "types": "./dist/client/index.d.ts" },
    "./admin": { "import": "./dist/admin/index.js", "types": "./dist/admin/index.d.ts" }
  },
  "peerDependencies": {
    "@devalok/shilp-sutra": ">=0.1.0",
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}
```

## Quality Fixes (all packages)

### Critical
1. Add `'use client'` to ~20 missing interactive components:
   - `button.tsx`, `accordion.tsx`, `alert-dialog.tsx`, `dialog.tsx`, `navigation-menu.tsx`
   - `tooltip.tsx`, `select.tsx`, `toast.tsx`, `radio.tsx`, `switch.tsx`, `slider.tsx`
   - `toggle.tsx`, `toggle-group.tsx`, `menubar.tsx`, `context-menu.tsx`, `popover.tsx`
   - `hover-card.tsx`, `collapsible.tsx`, `tabs.tsx`, `transitions.tsx`, `link.tsx`
   - `shell/sidebar.tsx`

### High
2. Fix README import paths: `/shared` → `/composed`, `/layout` → `/shell`
3. Update README for 3-package structure
4. Create LICENSE file (MIT)

### Medium
5. Exclude from dist: `.mdx`, Storybook `.tsx`, `test-setup.d.ts`, `scripts/`
6. Remove `_registerSvg`/`_registerKarmSvg` from public barrel exports
7. Remove PNG→JS compilation from brand build (ship raw SVGs only)

## Storybook Updates

### Navigation reorganization
- **Foundations/** — Tokens, Motion, Iconography (from core)
- **UI/** — Core UI primitives (from core)
- **Composed/** — Higher-level components (from core)
- **Shell/** — App shell layout (from core)
- **Brand/** — Logo components (from brand)
- **Karm/** — Domain components (from karm)

### About page
New `About.mdx` page based on `docs/design-philosophy.md`:
- Devalok Design & Strategy Studios introduction
- Shilp Sutra philosophy (accessible, composable, culturally grounded)
- Color heritage (Blooming Lotus, Sapta Varna)
- Architecture overview
- Credits section

## Credits (for README + Storybook About page)

- [Radix UI](https://radix-ui.com) — Accessible primitive components (vendored in primitives/)
- [Carbon Design System](https://carbondesignsystem.com) — Motion system inspiration (productive/expressive model)
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [class-variance-authority](https://cva.style) — Variant management
- [Google Sans](https://fonts.google.com) — Typography (SIL Open Font License)
- [Ranade by Indian Type Foundry](https://www.fontshare.com/fonts/ranade) — Display typography
- [Storybook](https://storybook.js.org) — Component documentation
- Sapta Varna — Cultural color system heritage

## Dependency Graph

```
@devalok/shilp-sutra-karm
    └── peerDep: @devalok/shilp-sutra (core)

@devalok/shilp-sutra-brand
    └── peerDep: react, react-dom (no core dependency)

@devalok/shilp-sutra (core)
    └── peerDep: react, react-dom
    └── optional peerDep: next
```

## Version Strategy

All 3 packages start at `0.1.0`. Independent versioning — core can release without brand/karm and vice versa. Consumer apps install only what they need:

```bash
# Just UI components
pnpm add @devalok/shilp-sutra

# Add brand logos
pnpm add @devalok/shilp-sutra-brand

# Add karm domain components
pnpm add @devalok/shilp-sutra @devalok/shilp-sutra-karm
```
