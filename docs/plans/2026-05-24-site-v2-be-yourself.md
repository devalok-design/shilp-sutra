# Site v2 — "Be Yourself"

> **Status:** Plan. Awaiting execution sign-off.
> **Author:** Mudit Lal + Claude (planning session 2026-05-24).
> **Branch:** stacks on `feat/site-v1-and-skill` (or new `feat/site-v2-be-yourself` post-merge).
> **Target release:** `@devalok/shilp-sutra@0.40.0` ("be yourself").
> **Budget:** ~6 working days across this week.

---

## 1. Brand thesis (why this exists)

shadcn/ui solved discoverability and copy-paste. It also accidentally homogenized the web — every YC-stage SaaS now looks identical. shilp-sutra's wedge is the opposite:

> **Be yourself, beautifully. In a sea of identical design systems, shilp-sutra is the one that disappears into your brand.**

The site doesn't ship a feature list. It ships proof:

1. **Customizability is the headline**, not a docs page. Theming sits in the chrome and on every demo.
2. **"Thought through" is shown, not claimed.** Component pages include composability, gotchas, accessibility notes, and forced-colors behavior — depth artifacts shadcn-style sites don't bother with.
3. **Real-world scale** via `/blocks`. Not toy demos. Multi-component pages that mirror what a consumer actually ships.

Every v2 phase below maps to one of these three pillars. If a feature doesn't serve a pillar, it's not in v2.

---

## 2. Architectural decisions (locked)

These cascade. Lock them before building.

### 2.1 Brand presets

- **Chrome dropdown:** small. Ship with **2–3 presets max** + "Custom →/theming".
  - **Devalok** (current accent ramp — house brand)
  - **Karm** (Devalok's product — proves eat-own-dog-food)
  - **Custom** → routes to /theming editor (no preset, user-defined)
- **Showcase strip** (separate from chrome switcher): on landing, a single horizontal strip / 4-column grid showing the same `Card` or `Dashboard` block rendered in 4–6 industry brands. Not interactive. Visual proof of breadth.
  - SaaS B2B (blue, sharp)
  - Fintech (green, dense)
  - Consumer / D2C (warm, organic)
  - Healthcare (teal, clinical)
  - Editorial / publishing (mono, typographic)
  - One Indian D2C / hospitality (earthy, festive — Devalok's hometown advantage)

### 2.2 Brand-switching mechanism

CSS-vars-only. No re-render. No theme provider component.

```ts
// apps/site/lib/brand-presets.ts
export type Brand = { id: string; name: string; ramp: Record<string, string /* OKLCH */> }
// applyBrand(brand) writes <style id="brand-vars">:root { --accent-1: ...; --accent-2: ...; }</style>
// to <head>. <html data-brand="karm"> attribute for analytics/CSS targeting.
```

- Brand selection persists via `localStorage('brand')`.
- Inline `<script>` in layout reads localStorage before hydration → no flash.
- Tailwind 4 reads the CSS vars live; every component recolors instantly.
- Edge: `--accent-fg` (foreground-on-accent) needs to flip black/white based on accent step-9 luminance. Either auto-compute via OKLCH `L` channel in JS, or bundle each preset with explicit fg values.

### 2.3 Live preview strategy

Hybrid. 25–30 hero components get **hand-curated** preview snippets; the remaining ~89 get markdown-rich + Storybook link.

**Hero list (lock in phase 9):** Button, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider, Card, Badge, Alert, Avatar, Dialog, Sheet, Popover, Tooltip, Tabs, Accordion, Toast, DataTable, Form (FormField), DatePicker, ProgressBar, Spinner, Breadcrumb, Pagination, EmptyState, Skeleton, Stepper.

**Preview component pattern:**
```
apps/site/content/components/button.preview.tsx
  export const ButtonPreview = () => <Button>Click</Button>
  export const ButtonVariants = () => <div>{variants.map(...)}</div>
```
Build-time registered into a map keyed by slug. Brand switcher applies automatically because previews use DS components with semantic tokens.

### 2.4 Block source viewing

shadcn pattern: tabs `Preview | Code | Files`. v2 cut: **Preview + Code (single file)**. Multi-file viewer deferred to v3.

Each block lives at `apps/site/content/blocks/<slug>/`:
- `block.tsx` — full source, copied verbatim into the page
- `meta.ts` — title, description, tags, brand-tested presets
- `index.tsx` — page composition (preview frame + code panel)

### 2.5 Storybook subpath

Build Storybook with `--base-url /storybook/`. Output → `apps/site/public/storybook/`. Next serves static. GH Pages URL gets a meta redirect.

Out of scope: streaming Storybook's MCP server into the site (deferred to v3 — needs SSE proxy).

---

## 3. Phase breakdown

### Phase 7 — Theming foundation (1 day)

**Goal:** Brand switching works site-wide. Pillar 1 unlocked.

**Files (new):**
- `apps/site/lib/brand-presets.ts` — preset definitions (Devalok, Karm) + Brand type
- `apps/site/lib/brand-runtime.ts` — apply/persist/init helpers (no-flash inline script generator)
- `apps/site/components/brand-switcher.tsx` — header dropdown (client)
- `apps/site/components/brand-init.tsx` — inline script for no-flash
- `apps/site/app/layout.tsx` — wire ThemeInit + BrandInit + BrandProvider context (lightweight)

**Files (modified):**
- `apps/site/components/site-header.tsx` — add `<BrandSwitcher />` next to ThemeToggle

**Smoke test:** Switch brand in dropdown → header accent recolors → reload → brand persists.

**Risk:** `--accent-fg` luminance flip. Pre-compute in preset JSON. Verify forced-colors mode still works.

---

### Phase 8 — `/theming` editor (1 day)

**Goal:** OKLCH live editor. Pillar 1 amplified. The moneyshot page.

**Files (new):**
- `apps/site/app/theming/page.tsx` — editor page (client component)
- `apps/site/components/oklch-editor.tsx` — sliders (H/C/L) + ramp generator
- `apps/site/components/ramp-preview.tsx` — 12-step preview
- `apps/site/components/theming-preview-panel.tsx` — sample components in chosen brand (Button row + Card + Form + Alert)
- `apps/site/lib/ramp-generator.ts` — OKLCH algorithm (port of DS's `generate-scale.ts`)
- `apps/site/components/export-panel.tsx` — CSS export with copy

**Files (modified):**
- `apps/site/components/site-header.tsx` — "Custom →" item routes here
- `apps/site/components/site-footer.tsx` — add /theming to Explore links

**Risk:** OKLCH ramp generation must match DS's algorithm exactly. Reuse `packages/core/src/tokens/generate-scale.ts` via workspace import or re-port.

---

### Phase 9 — `/components/[slug]` detail pages (1.5 days)

**Goal:** Per-component depth. Pillar 2.

**Files (new):**
- `apps/site/app/components/[slug]/page.tsx` — detail page (server, generateStaticParams from registry)
- `apps/site/content/components/*.preview.tsx` — 25–30 hand-curated preview files
- `apps/site/lib/preview-registry.ts` — slug → dynamic import map (build-time)
- `apps/site/components/component-detail-shell.tsx` — page layout (hero preview / variants / props / composability / gotchas / Storybook link)
- `apps/site/components/variant-gallery.tsx` — render all variant axes

**Files (modified):**
- `apps/site/lib/component-registry.ts` — `getDoc(slug)` helper to fetch full markdown sections (props, defaults, example, composability, gotchas)
- `apps/site/app/components/page.tsx` — cards link to `/components/<slug>` (not Storybook)
- `apps/site/components/component-grid.tsx` — same

**Hero comp list (30, locked):**
> Button, Input, Textarea, Select, Combobox, Autocomplete, Checkbox, Radio, Switch, Slider, NumberInput, InputOTP, Card, Badge, BadgeGroup, Alert, Avatar, Dialog, Sheet, Popover, Tooltip, Tabs, Accordion, Toast, Spinner, Breadcrumb, Pagination, EmptyState, Skeleton, Stepper.

**Risk:** Dynamic-importing 30 client components into Next inflates the dependency graph. Use `next/dynamic` with ssr-friendly fallbacks. Measure first-load JS.

---

### Phase 10 — `/blocks` curated examples (1.5 days)

**Goal:** Real-world proof. Pillar 3.

**Blocks shipped (5):**
1. **Dashboard** — sidebar nav + stats cards + activity feed + chart placeholder
2. **Settings** — section nav + form fields + danger zone + save bar
3. **Pricing** — tier cards + comparison table + FAQ
4. **Sign-up** — split form + brand panel + social auth + benefits list
5. **Data table** — search + filters + bulk actions + pagination

**Files (new):**
- `apps/site/app/blocks/page.tsx` — index grid
- `apps/site/app/blocks/[slug]/page.tsx` — detail with Preview/Code tabs
- `apps/site/content/blocks/<slug>/block.tsx` × 5 — full source files
- `apps/site/content/blocks/<slug>/meta.ts` × 5
- `apps/site/components/block-detail-shell.tsx` — tabbed Preview/Code shell
- `apps/site/lib/blocks-registry.ts` — slug → meta + dynamic source loader

**Files (modified):**
- `apps/site/components/site-header.tsx` — add Blocks nav item
- `apps/site/components/site-footer.tsx` — add Blocks to Explore

**Risk:** "Look serious not toy." Each block must use 6+ DS components, real-world spacing, no Lorem Ipsum. Budget 2 hours each, polish > complete.

---

### Phase 11 — Landing redesign (0.5 day)

**Goal:** Front-of-funnel reframe. Brand thesis surfaces above the fold.

**Files (modified):**
- `apps/site/components/hero.tsx` — new headline ("Be yourself, beautifully."), tagline shift, brand switcher CTA inline
- `apps/site/components/feature-grid.tsx` — reframe 4 cards: **Customizable** / **Crafted** / **RSC-safe** / **Agent-ready**
- `apps/site/app/page.tsx` — insert new `<BrandShowcase />` section after Hero, before Install

**Files (new):**
- `apps/site/components/brand-showcase.tsx` — strip of 4–6 industry brand previews (same Card or mini-dashboard, recolored)

**Risk:** "Same component, different brands" must be visually striking. If it looks weak, the whole thesis falls flat. Allocate design-eye time, not just dev time.

---

### Phase 12 — Storybook subpath (0.5 day)

**Goal:** Close the loop. shilp-sutra.devalok.in becomes the single front door.

**Steps:**
1. Update `.storybook/main.ts` (or config) to set `viteFinal` / `managerHead` for `/storybook/` base
2. Add `build:storybook` script: `storybook build -o apps/site/public/storybook --webpack-stats-json`
3. Update Dockerfile to run Storybook build before Next build
4. Update all hardcoded Storybook URLs in:
   - `apps/site/components/site-header.tsx`
   - `apps/site/components/site-footer.tsx`
   - `apps/site/components/component-grid.tsx`
   - `apps/site/lib/component-registry.ts` (`storybookUrl` derivation)
5. Add 301 redirect at devalok-design.github.io/shilp-sutra → shilp-sutra.devalok.in/storybook (or accept the link decay)

**Risk:** Storybook static build is big (~50MB+). Verify Railway image size limit not exceeded. Trim Storybook deps in `.dockerignore` if needed.

---

## 4. Release plan

- Stack v2 phases on `feat/site-v1-and-skill` OR cut new branch `feat/site-v2-be-yourself` after PR #46 merges.
- 0.39.0 publishes today (skill bundle + site v1).
- 0.40.0 publishes when phases 7–12 land — single big version-bump moment with announcement.
- No separate npm changes during v2 unless a DS bug surfaces while building. The site work doesn't touch `packages/core/src`.

## 5. Success criteria (how we know v2 worked)

1. A new visitor lands on shilp-sutra.devalok.in and within 30 seconds can name the differentiator. Hypothesis: "it's customizable" or "you can make it yours".
2. Brand switcher in chrome demonstrably recolors a live component without page reload.
3. `/theming` editor produces a CSS export that, pasted into a fresh consumer project, recolors it instantly.
4. `/components/Button` page is **objectively better** than `https://ui.shadcn.com/docs/components/button` for variant discovery + accessibility notes.
5. `/blocks/dashboard` is **postable as a screenshot** without context — looks like a real app.
6. Storybook serves at `/storybook/` with no broken links.
7. Lighthouse perf > 90 on landing + /components.

## 6. Open questions (resolve before/during phase 7)

- [ ] **Karm brand colors:** does Karm have a documented accent ramp we can copy? (Check Karm app repo `packages/core/src/tokens/` or designer.) Need exact OKLCH values.
- [ ] **`--accent-fg` flip rule:** algorithm — auto-compute from accent-9 lightness, or hand-tune per preset?
- [ ] **Industry showcase brands** — which 5–6 industries get featured in `<BrandShowcase />`? Suggestion above; user to confirm/swap.
- [ ] **/blocks copy authority:** who writes the realistic copy inside each block? (Devalok writing rules apply — must fetch writing/AI-RULES.md from Karm Intel.)
- [ ] **Storybook subpath redirect:** OK to lose GH Pages indexing, or proxy until SEO recovers?

## 7. Out of scope for v2 (explicit non-goals)

- Multi-file source viewer for `/blocks` (single-file only)
- react-live in-browser JSX editor on `/components/[slug]` (markdown + hand-curated previews only)
- MDX Storybook MCP bridge (deferred to v3)
- Marketing-blog / changelog page
- Search across all content (Algolia/Mintlify-style)
- i18n / multi-language
- Auth or accounts (no reason to)
- Customer logos / testimonials (no real ones yet; would be hollow)

---

## 8. Sequencing inside the week

| Day | Phases | Outcome |
|---|---|---|
| **Mon** | 7 — Theming foundation | Brand switcher works end-to-end |
| **Tue** | 8 — /theming editor | Moneyshot page live |
| **Wed–Thu** | 9 — /components/[slug] | 30 detail pages with previews |
| **Fri** | 10 — /blocks (3 of 5) | Dashboard / Settings / Pricing |
| **Sat** | 10 cont. + 11 — Sign-up / Table + Landing redesign | All blocks + new front page |
| **Sun** | 12 — Storybook subpath + 0.40.0 publish | Release |

(Slip protection: phase 9 can extend into Wed–Fri. Skip phase 12 if budget runs out — Storybook GH Pages link works.)
