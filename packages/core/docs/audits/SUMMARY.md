# shilp-sutra Design System — Audit Summary (plain-English)

*A component-by-component health check of our design system, compared against the four best-known design systems in the industry. Written to be readable without an engineering background.*

Date: 2026-07-12 · Covers: **~120 components across 5 waves** · Full detail in `wave-1` … `wave-5` docs alongside this file.

---

## What we did, in one paragraph

We went through every component we ship — buttons, inputs, dialogs, tables, cards, the app sidebar, the AI chat surface, everything — and checked two things. **First: is it consistent with our own rules and with its siblings?** (Does a "size small" mean the same thing on a button as on a checkbox? Do our own spacing and color tokens get used, or do components sneak in hand-typed numbers?) **Second: how does it compare to the industry's benchmarks** — shadcn/ui (the popular open-source kit), Radix Themes (the polished one we're most similar to), IBM Carbon (the enterprise gold-standard for rigor), and Google's Material/MUI (the mature, everything-included one)?

---

## The headline

**We are in genuinely good shape — better than we probably expected.**

Against **shadcn and Radix Themes** — the systems most like ours — we **match or beat them almost everywhere** on features and polish. In several places (our Card, our data table, our notifications, our AI chat) we ship things **none of the four have**.

Against **Carbon and MUI** — the big, disciplined, decades-old systems — we're competitive on features but trail them on two boring-but-important things: **strict consistency** and **housekeeping**. Those are the things we should fix, and none of them require redesigning anything.

Think of it like a restaurant: the food is excellent and the menu is more ambitious than the competition. The gaps are in the kitchen's standardization — some recipes are written down precisely, others are "to taste," and a few dishes are missing their menu descriptions.

---

## Where we genuinely lead the industry

- **Card** — our card is the best of the five systems. It has a spacing system where you set one value and the whole card re-tunes itself; nobody else does this.
- **Tables + Data grid** — competitive with the heaviest enterprise grids, and our tables turn into tidy cards on mobile, which the enterprise ones don't.
- **Notifications (toasts)** — ours can show file-upload progress, "undo," and loading→done transitions. The others show a basic message and stop there.
- **Mobile-aware pop-ups** — our dialogs and menus adapt to phones (slide up from the bottom, swipe to dismiss). The reference systems don't do this automatically.
- **The AI layer** — a chat/conversation surface with pluggable "blocks." **No other design system attempts this at all.** It's our most forward-looking asset.
- **App-level pieces** — page headers, filter bars, empty states, the command palette. These are things teams normally build from scratch; we ship them.

---

## The recurring problems (the same handful, over and over)

Across 120 components, the issues cluster into **five repeating themes**. Fixing the theme fixes it everywhere.

### 1. "Is this field broken?" is expressed three different ways 🔴
When an input has an error, some components use `state="error"`, some use `color="error"`, and some use a simple on/off `error` switch. Same idea, three dialects. A developer using our system has to remember which component speaks which. **The mature systems (Carbon, MUI) use one consistent way everywhere.** This is our single biggest ease-of-use gap.

### 2. Hand-typed measurements instead of our own design tokens 🟡
We have a "ruler" of approved sizes and spacings (our tokens). Most components use it — but a meaningful minority type in raw numbers like "8 pixels" or "38 pixels" instead. It works visually, but it means our ruler has gaps, and those components won't automatically follow if we ever re-tune the system. Carbon would reject every one of these in review.

### 3. The same bit of plumbing copied 6+ times 🟡
The logic for "is this pop-up open or closed?" is copy-pasted across six different pop-up components (dialog, menu, tooltip, sheet, etc.). If we ever need to fix a bug in it, we'd have to fix it in six places. It should live in one shared helper.

### 4. Some components rebuild things we already own 🟡
A few components hand-build a badge, a breadcrumb, or a progress bar from scratch — even though we already ship a polished Badge, Breadcrumb, and Progress. It's wasted effort and it means those copies drift out of sync. (Encouragingly, the team already spotted one case — an old "ContentCard" — and formally retired it. We just need to apply that same instinct to a few more.)

### 5. Our AI components have no instruction manual 🔴
The AI chat components are finished, shipped, and available to install — but they have **no documentation**. That matters especially because a big selling point of our system is that it's *readable by AI coding assistants*. Right now the AI-facing components are the ones the AI assistants can't read about. Either we write the docs, or we clearly stamp them "experimental / not ready."

---

## What's already excellent (don't touch)

- **Accessibility** — screen-reader labels, keyboard navigation, focus outlines, and "reduce motion" support are consistent and thorough across the board. This is often where systems cut corners; we didn't.
- **The way components snap together** — especially the app shell (sidebar, top bar, notifications). These assemble our building blocks cleanly with no shortcuts.
- **Server-rendering safety** — the components correctly declare where they can and can't run, which keeps Next.js apps fast. This is fiddly and we got it right.
- **Documentation coverage** — every component in the first four waves has both written docs and interactive examples. (The AI layer is the one exception — see problem #5.)

---

## Recommended order of work

Ranked by value-for-effort. None of these are redesigns — they're consistency and housekeeping.

| # | Fix | Why it matters | Size |
|---|---|---|---|
| 1 | **Document the AI components** (or mark them experimental) | They're shipped but unreadable; undercuts our "AI-readable docs" pitch | Medium |
| 2 | **One consistent way to show field errors** | Biggest day-to-day ease-of-use win for developers using us | Medium (a breaking change — needs a version bump + notice to Karm) |
| 3 | **One shared "is it open?" helper** for pop-ups | Removes the worst copy-paste; safer to maintain | Small |
| 4 | **Rebuild the 3-4 components that reinvent Badge/Breadcrumb/Progress** on top of the real ones | Stops drift; follows the ContentCard precedent | Small–Medium |
| 5 | **Add the missing size tokens + a check that catches hand-typed numbers** | Closes theme #2 permanently instead of case-by-case | Small |
| 6 | **Make our own dialogs follow our own "soft button" house style** | Our reference examples should model our rules | Tiny |
| 7 | **Confirm the surface-color rule matches the code** for the sidebar/top bar | Our written rule and the code currently disagree | Tiny (investigation) |

**Bottom line:** the design and features are ahead of where we'd guess. The work ahead is discipline, not reinvention — write down the few "to taste" recipes, print the missing menu descriptions, and stop rebuilding dishes we already serve.

---

---

## Follow-ups discovered while fixing

- **Fix #1 (AI docs) — DONE.** 5 AI component docs authored, `ai` wired into the doc-coverage + manifest + drift gates, `ai/blocks` marked internal. Doc count 124 → 129; all gates green.
- **Backlog: ~21 component docs lack a machine-parseable `## Props` (10 lack `## Example`).** Manifest advisory, not a gate failure. Most are compound components documented by parts (dialog, dropdown-menu, popover, tooltip, toast, data-table-*) — likely intentional. Genuine gaps to fill: `button-processing`, `chat`, `oauth-button`, `icon-context` (Props), `split-button` (Example). To be fixed after the main roadmap.

---

*Detailed per-component scorecards and code references: see `wave-1-core-form-primitives.md`, `wave-2-overlay-interaction.md`, `wave-3-data-display.md`, `wave-4-composed.md`, `wave-5-shell-ai.md` in this folder.*
