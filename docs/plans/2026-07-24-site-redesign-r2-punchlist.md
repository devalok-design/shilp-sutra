# Site Redesign R2 — Feedback Punch List (2026-07-24)

Source: full verbal feedback pass from Mudit. Branch: `feat/site-redesign-r2`.
**Global principle:** LAYMAN copy everywhere. Reduce text. Kill AI-slop. Apply
Setu UI rules + consistent typography/padding/spacing. Everything intentional.

Status key: ☐ todo · ◐ in progress · ☑ done

---

## A. Top bar / IA
- ☐ A1. IA rethink — audience = people who want to USE shilp-sutra. Merge **Docs into Components** (or, if Docs stays, make it *very* AI-friendly).
- ☐ A2. "For AI editors" — no dedicated page exists. Decide keep-or-cut (agent's call; lean keep only if it earns a real page).
- ☐ A3. Brand/preset selector — animate open (currently pops with no transition).
- ☐ A4. Top bar **dark mode is missing** — add dark styling.
- ☐ A5. Theme toggle on homepage — when switching light↔dark on the lander, the landing section disappears and the intro animation **replays from scratch** in the new theme.

## B. Hero / lander
- ☐ B1. Background grid must be **functional**, not decorative: text left-edge aligns to a grid line; the concentric-ellipses conjoint point sits **on** a grid line (currently off). Everything positioned to the geometric grid.
- ☐ B2. Add **more component specimens**, snapped into grid cells (not random scatter).
- ☐ B3. "Learn More" chip — reposition + **fade into background** (reads clickable now).
- ☐ B4. Right-side 4 tiles — colors must **follow the selected preset**, not stay static.
- ☐ B5. Subcopy → **layman**: "one click / one prompt install", not "no re-render, no config files".
- ☐ B6. Primary CTA "Try it on" → **copies the install prompt** to clipboard + shows a **toaster/banner** ("Prompt copied — paste it in your AI tool").
- ☐ B7. Secondary CTA "See what's inside" → rename (Themer / "Tune it your way" / "Make it yours").
- ☐ B8. Trust chips — kill slop: remove leading green dot; remove "Powers Karm, Hiring + studio tools"; drop "forced-colors verified" + "1,750+ tests". Keep WCAG-AA + "120+ components"; add **variables that actually matter for a DS**.

## C. Homepage sections (below fold)
- ☐ C1. BrandOrbit — animate more than toggles; longer, more random gaps. Put "120+ components" in the middle. Background = **faded components on a conveyor belt** showing breadth. Design carefully.
- ☐ C2. StackSupport ("fits the stack you already run") — subheader makes no sense; better framework icons (Next/Vite/Astro/Remix); layout = heading LEFT, items in a grid RIGHT.
- ☐ C3. UnifiedCanvas ("one library, many worlds") — **rebuild from scratch**. Typography inconsistent, wrong sizing/padding, too packed, fonts misused. Every piece.
- ☐ C4. "We sweat the small stuff" — showcase more; reduce text.
- ☐ C5. ButtonShowcase ("same Button across 10 products") — reduce text; make contextual/visual (read-at-a-glance).
- ☐ C6. BuiltWith ("Devalok ships its own tools") — keep Karm card; install `@devalok/shilp-sutra-brand`, use Karm **curly-braces mark** (not full logo). Don't link "open Karm" — link to "install the way Karm uses it". Better right-side mockup. Remove repeated "studio runs on Karm / AI tool" duplication. **Remove BharatTools, Devalok Hiring, Gurukul** for now.
- ☐ C7. ComponentShowcase ("same care, every component") — reduce text.
- ☐ C8. "Build to ship real products" — **redesign** with cards/structure (no text chunks).
- ☐ C9. AgentCallout ("your editor already knows") — good, keep.
- ☐ C10. DevalokBlock — add **Devalok branding that stays regardless of theme**; "Learn more about Devalok" → **button**, not backlink.
- ☐ C11. Footer — **full redesign**; plain/ugly, wrong structure.

## D. Components page
- ☐ D1. Each component → **dedicated page** (only that component). Pretty, structured, correct type sizes + padding. Verify for ALL components.

## E. Theming page
- ☐ E1. Full revisit. Show more components, in **real-life use cases** (not isolated). Kill AI tabs / apply Setu UI rules. Consistent padding/typography. Fix the broken "four-way same CSS out" section. Reduce text.

## F. Docs
- ☐ F1. Make docs **much more AI-friendly** (AI can pull info easily).

---

## Proposed execution order
1. **Foundational** (unblocks the rest): grid-alignment system for the hero (B1/B2), layman-copy pass primitives, top-bar dark mode + selector animation (A3/A4).
2. **Hero** finish: B3–B8.
3. **Top bar IA** (A1/A2) + theme-replay (A5).
4. **Homepage sections** top→bottom: C2, C1, C3, C4, C5, C6, C7, C8, C10, C11.
5. **Components pages** (D1).
6. **Theming** (E1).
7. **Docs** (F1).

Deploy in batches after each coherent chunk is verified.
