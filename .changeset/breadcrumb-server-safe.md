---
"@devalok/shilp-sutra": minor
---

**`Breadcrumb` is now server-safe**, and `PageHeader` composes it.

`Breadcrumb`'s only client dependency was the `Icon` component (its chevron/dots glyphs). Those are now inline SVGs, so `Breadcrumb` renders in a React Server Component with no `"use client"` boundary — import it directly in server components. API and markup are unchanged.

`PageHeader` (itself server-safe) previously hand-rolled its breadcrumb trail (inline chevron SVG + raw `<a>`/`<span>`). It now composes the real `Breadcrumb` / `BreadcrumbList` / `BreadcrumbItem` / `BreadcrumbLink` / `BreadcrumbPage` / `BreadcrumbSeparator` — one breadcrumb implementation instead of two — while staying server-safe. `PageHeader`'s API is unchanged; the trail's colours now match the `Breadcrumb` component (links `surface-fg-muted` → `surface-fg` on hover; current page `surface-fg`).
