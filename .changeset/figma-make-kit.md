---
"@devalok/shilp-sutra": minor
---

Ship Figma Make kit guidelines. New `make-kit/` directory in the published tarball at `node_modules/@devalok/shilp-sutra/make-kit/` containing:

- `Guidelines.md` — top-level entry, product character + mandatory rules.
- `setup.md` — install + provider tree + Vite config.
- `foundations/` — 7 files (color, typography, spacing, surfaces, radius, motion, dark-mode, icons).
- `components/overview.md` — catalog + decision trees across actions / inputs / overlays / feedback / nav / layout / data display.
- `components/{button,card,input,dialog,badge,select,tabs,toast,form,table,dropdown-menu,popover,text,stack,icon}.md` — 15 component deep guides.

Authored for Figma Make to consume when registering this package as a Make kit (per https://developers.figma.com/docs/code/bring-your-design-system-package/). Use these files as paste-in content when configuring the kit in Figma Make.

New subpath exports: `@devalok/shilp-sutra/make-kit` → `Guidelines.md`, `@devalok/shilp-sutra/make-kit/*` → individual files.

Smoke-tested in a fresh Vite 8 + React 19 + TW4 + framer-motion 12 app — build green, dev server clean, DS utilities emit. shilp-sutra is Figma Make kit eligible as of this release.
