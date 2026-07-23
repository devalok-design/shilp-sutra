# Shilp Sutra site — handoff

This is a working handoff for whoever picks up `apps/site` next. It covers: how to run
things, what changed in this work session (and why), exactly which files to look at,
what's verified vs. not, and open items I deliberately left for you rather than guessing.

Repo: `shilp-sutra-main` monorepo (pnpm workspaces) — `packages/core` (the published
design system), `packages/brand` (Devalok/Karm corporate brand assets — NOT this site's
own brand, see below), `apps/site` (this marketing site, `shilp-sutra.devalok.in`).
Not a git repo on this machine (no `.git` — check with whoever owns the remote before
assuming version control conventions).

## Running it

```bash
pnpm install
pnpm build:core && pnpm build:brand   # packages/core ships no prebuilt dist; site imports fail without this
pnpm --filter site dev                # localhost:3000
pnpm --filter site typecheck
pnpm --filter site lint
```

Screenshot verification tooling already exists: `pnpm --filter site shot <url> [--viewport=WxH] [--full] [--out=path]`
(`apps/site/scripts/screenshot.mjs`, Playwright-based). Needs `pnpm exec playwright install chromium`
once if the browser isn't installed. It waits for Playwright's `networkidle`, which
sometimes times out on this dev server (PostHog/analytics keep a connection open) —
if it does, write a one-off script using `waitUntil: 'load'` instead (see git-blame-less
history of this doc's author's session for the pattern, or just ask Claude to redo it).

## What happened this session, in order

1. **IA restructuring** (biggest structural change): merged `/blocks` into `/showcase`
   (blocks first, then the six-brand showcase library, "how this works" explainer,
   per-card "take this brand into the editor" CTA, "more coming" box); regrouped the
   125-component library by function (Buttons & Actions, Forms & Inputs, Feedback &
   Alerts, Data Display, Navigation, Overlays, Layout & Utilities) instead of internal
   layer; merged `/theming` + all `/themer/*` pages into one page; gave `/components`
   and `/docs` categorized sidebars (one shared `CategorySidebar` component, two
   different category sets). All old `/themer/*` and `/blocks` routes now `redirect()`
   to the merged destinations, preserving query strings where relevant.

2. **ThemingHub rebuild** (`apps/site/components/themer/ThemingHub.tsx`) to match a
   set of literal reference mockups the user provided: two tabs ("Use my brand color" /
   "Pick an archetype"), each in its own bordered card next to a separate "Live preview"
   card (NOT one shared outer box — this tripped me up once, see the two-box layout
   note below), an archetype demo card driven by real `mergeArchetype()` role tokens,
   a collapsible "Export CSS" section, and a sticky left panel so it stays in view
   while the taller right panel scrolls. `ThemeSummaryBar`, `AgentPromptHero`,
   `ResultActions`, and `lib/themer-prompt.ts` were deleted once nothing referenced
   them anymore — don't resurrect them without checking why they were removed.

3. **Showcase brand differentiation**: the five fictional showcase brands (Atlas,
   Lendis, Mira, Vaidya, Patrika) each got distinct typography/corner-radius/shadow
   treatment matching their industry description, via `apps/site/lib/showcase-visuals.ts`
   (`showcaseVisualStyle()` returns a scoped CSS-var override object for
   `--font-display`/`--font-sans`/`--shadow-*`; radius uses the DS's own official
   `[data-shape]` attribute, not a reinvented system).

4. **Site header nav fix**: the floating pill nav used to go fully transparent at the
   top of the page and only "materialize" (bg/border/shadow) on scroll. Per explicit
   instruction it's now persistent at all scroll positions — only the vertical offset
   still tweens on scroll, not the surface.

5. **Full brand rebrand — teal identity** (the big one, see below in detail).

6. **Type system fix + color hierarchy** (also below).

## The brand rebrand — what, why, and the exact scoping line

The user pointed at a "Branding" page in Figma (`node 103:1617`, 12 slides — file key
`0QVftdDpia1iCxI3TI9Bt3`, file name "Ship-Sutra") and asked me to implement it. It turned
out to be a brand-new visual identity for **shilp-sutra itself** (one mockup slide is
literally a browser chrome showing `shilp-sutra.devalok.in` with a new logo) — not a
demo brand. It defines: a new logo (wordmark + glyph), teal/blue/lime colors, Museo
Moderno as display typeface (Inter stays body), and a squircle-ish rounded logo-mark
treatment.

**The one scoping decision everything else hangs off**: this rebrands `apps/site`'s own
identity only. `packages/core`'s published default OKLCH primitives (the pink "Devalok"
ramp every consumer app gets out of the box) are untouched — the whole point of the
Theming/archetype feature is proving the DS is brand-agnostic, so its own neutral
default must not change. Confirmed explicitly with the user that the new teal becomes
the site's **default** (not just a switcher option) — Devalok pink/Indigo/Sage stay
selectable in `BrandSwitcher` for anyone who wants them.

**Color math**: don't just eyeball hex-to-OKLCH or uniformly scale another preset's
chroma curve onto a new hue — different hues have different in-gamut chroma ceilings
(teal peaks around L 0.7–0.78 then falls off in both directions; pink rises monotonically
to a step-9/10 peak). I converted the actual Figma palette swatches (`node 103:1155`) to
OKLCH point-by-point and interpolated onto the DS's standard 12-step L curve
(`0.99, 0.97, 0.93, 0.89, 0.84, 0.78, 0.7, 0.62, 0.55, 0.5, 0.43, 0.32` light /
`0.11, 0.17, 0.23, 0.29, 0.34, 0.38, 0.44, 0.53, 0.54, 0.49, 0.76, 0.88` dark). If you
need to add a fourth color later, repeat that fit — don't just hue-rotate an existing
ramp's chroma numbers.

**Colour hierarchy** (Figma labels these Primary / Secondary / Accent):

| Role | Hue | Token | Where it lives |
|---|---|---|---|
| Primary (teal) | 188° | `--color-accent-*` | `apps/site/lib/brand-presets.ts` — the `SHILP_SUTRA` preset, default brand, swappable via `BrandSwitcher` |
| Secondary (blue) | 255° | `--color-secondary-*` | `apps/site/app/globals.css` — overrides the DS's existing (previously-purple, previously-unused-in-this-site) secondary role. Site-wide, NOT part of the brand switcher. |
| Accent (lime) | 119° | `--color-highlight-*` | `apps/site/app/globals.css` — net-new role, registered via a local `@theme` block (Tailwind4 lets a consuming app extend the theme in its own CSS). Called "highlight" in code because the DS's own "accent" name was already taken by Primary. |

Secondary and highlight are deliberately **not** tied to `data-brand` — they're the
site's fixed identity, same as the logo and the display font. Only Primary (accent)
recolors when you pick a different `BrandSwitcher` preset.

Applied so far (don't assume these are the only "correct" spots — I picked the two
lowest-risk, most Figma-faithful ones and stopped there, see "left alone" below):
- Highlight/lime → hero's "Try it on" primary CTA button (`apps/site/components/hero.tsx`),
  matching the Figma mockup's own lime CTA button.
- Secondary/blue → the "For AI editors" nav item + its dot indicator, in both the desktop
  nav and mobile drawer (`apps/site/components/site-header.tsx`).

**Logo**: pulled real SVGs straight out of Figma dev mode (`node 103:619` for the full
wordmark+glyph lockup, `node 103:1277` for the standalone glyph). Files live at
`apps/site/public/brand/shilp-sutra/{wordmark.svg, wordmark-white.svg, glyph-white.svg}`.
Two things I had to fix after the first pass, worth knowing before you touch these:
- The source SVG has a baked-in "1.0" version-superscript mark tucked next to the last
  letter that visually collided with the site's own real `v{SHILP_SUTRA_MINOR}` text
  next to the logo — I stripped that group out and re-cropped the viewBox (see the
  `Group_6`/`Vector_19` removal if you ever re-extract from Figma).
- The `<Link>` wrapping the header logo needs `overflow-hidden` — the old plain-text
  wordmark had `truncate` doing this invisibly; swapping in a wider image logo without
  a clipping safety net makes it visually overflow into the nav at typical viewport
  widths (the header pill is `max-w-4xl`, and logo+nav+controls are already tight there
  — pre-existing, not something to "fix" by widening the pill).
- White variant regenerated from the black one for dark mode (`fill: #131514` →
  `#ffffff`, teal accent path left untouched).

**Favicon/apple-icon/OG image** (`apps/site/app/icon.tsx`, `apple-icon.tsx`,
`opengraph-image.tsx`): these are `next/og` `ImageResponse` generators with hardcoded
hex (can't read CSS custom properties in that runtime) — swapped pink → teal directly,
and swapped the placeholder Devanagari "स" glyph for the real logo glyph as inline SVG
paths (Satori/`next/og` supports raw `<svg>`). `icon.tsx`'s corner radius bumped from
6px to 8px on its 32px canvas (~25%, matching the squircle ratio measured off the
Figma icon slide: 120px radius / 464px size).

## Type system fix

Museo Moderno is loaded via `next/font/google` in `apps/site/app/layout.tsx`
(`variable: '--font-museo-moderno'`, applied via `museoModerno.variable` className on
`<html>`). It's wired into `--font-display` as a **persistent site-wide base** in
`apps/site/app/globals.css`:

```css
html {
  --font-display: var(--font-museo-moderno), var(--font-sans);
}
```

**Do not** write `--font-display: var(--font-museo-moderno), var(--font-display);` here
— that's self-referential. A CSS custom property redefined on the same selector can't
reference its own previous value the way a Sass variable can; the browser treats it as
circular/invalid at computed-value time and the property silently becomes empty. I hit
this exact bug — `getComputedStyle` on `--font-display` came back as `""`, and every
heading silently fell back to inherited body font. If font changes ever stop working
again, check for this first.

Separately, discovered the site's own headings mostly never applied `--font-display`
in the first place — they're raw `<h1>`/`<h2>` elements composing `text-[length:var(--typo-heading-*-size)]`
etc. by hand and just... never included a `font-display`/`font-sans` utility class, so
they silently inherited whatever `body`'s font-family was. Added the `font-display`
class to: `hero.tsx`, `page-header.tsx` (shared by every top-level page's H1), and the
section-header `h2`s in `app/components/page.tsx`, `app/docs/page.tsx`,
`app/showcase/page.tsx`, `aurora-playground.tsx`, `featured-components.tsx`,
`lotus-showcase.tsx`, `unified-canvas.tsx`.

**Deliberately left alone** (still body/Inter, not an oversight):
- `CardTitle` (`packages/core/src/ui/card.tsx`) — hardcodes `font-sans`. This is a
  published DS component decision (dense card titles stay in body font); don't "fix"
  it without a separate conversation about breaking every consumer's card styling.
- `apps/site/components/markdown.tsx` (renders docs/recipe prose headings, h1–h4) —
  same reasoning as CardTitle: long-form reading content favors legibility over
  decorative display type. If the next person wants docs headings in Museo Moderno
  too, that's a legitimate call to make, just flag it as a deliberate choice, not a bug.

## Verified

- `pnpm --filter site typecheck` and `pnpm --filter site lint` — clean after every
  change described above.
- Visual: homepage in light + dark, header/footer logo in both themes, `BrandSwitcher`
  dropdown (all four presets + "Build your own"), the Theming page's two-tab panel and
  archetype rows, the hero CTA colors, computed `getComputedStyle` checks on `<h1>`
  confirming Museo Moderno actually renders and survives a brand switch.
- Not screenshot-diffed pixel-for-pixel against every Figma slide — visual fidelity was
  checked by eye against the pulled reference screenshots, not automated.

## Open items / things I did NOT do

- **Blue and lime are only applied in one spot each.** I stopped there deliberately
  (matching "note the colour hierarchy" literally, without redesigning components I
  wasn't asked to touch). There's a real argument for using highlight/lime more widely
  wherever a CTA needs to pop, and secondary/blue for actual "secondary" information
  moments (info banners, etc.) — that's a design call for whoever's driving this next,
  not something I want to have silently decided for the whole site.
- **`markdown.tsx` and `CardTitle` still use body font for headings** — see above.
  If Museo Moderno should show up in docs content too, that's a quick follow-up
  (add `font-display` to the four heading renderers in `markdown.tsx`), just make it
  an intentional call.
- **The pre-existing "For AI editors" nav wrapping to two lines** at ~1200–1440px
  viewport widths — I noticed this while debugging the logo overflow, it predates
  this session's changes, and I didn't fix it (out of scope for a rebrand pass, but
  worth a ticket — the header pill's `max-w-4xl` plus five nav items plus the
  right-side controls cluster is generally tight).
- **No changeset / publish step.** Nothing here touches `packages/core`'s published
  surface, so nothing needs a changeset — but if a future change DOES touch
  `packages/core` defaults (e.g. someone decides Manrope should actually be replaced
  DS-wide), see this repo's root `CLAUDE.md` for the publishing pipeline and the
  hard rule about classifying type/prop changes as breaking.

## Figma reference (Ship-Sutra file, key `0QVftdDpia1iCxI3TI9Bt3`)

If you need to re-pull anything, these are the nodes referenced this session:
- `103:1617` — "Branding" section container (12 slides total)
- `103:1155` — colour palette slide (Primary/Secondary/Accent + Gray/Black swatches)
- `103:1202` / `103:1203` — corner radius/card reference ("Build something people
  actually use." mockup)
- `103:1277` — teal app-icon squircle mockup (radius/size ratio reference)
- `103:619` — primary logo lockup on white (source of the wordmark SVG)
- `103:1335` — typography specimen slide (Museo Moderno display / Inter body)
- `103:660` — browser-chrome mockup showing the logo + `shilp-sutra.devalok.in`
- `112:766` / `112:779` — archetype-row component states (selected/unselected) used
  to fix the Theming page's archetype-picker spacing/borders

Figma dev-mode MCP tools used: `get_metadata` (structure only, sparse), `get_design_context`
(real generated code + asset URLs — works better on smaller sub-frames than whole
sections), `get_screenshot`. Logo assets were downloaded directly from the localhost
asset server Figma's desktop app exposes during a dev-mode session
(`http://localhost:3845/assets/<hash>.svg`) — that server only exists while someone has
the Figma file open with dev mode active on their machine, so if you need to re-extract
anything, you'll need Figma open locally, not just the file URL.
