# MCP `check_slop` — plan (2026-07-23)

**Goal.** A hosted MCP tool `check_slop(code)` on the shilp-sutra docs MCP (`shilp-sutra.devalok.in/mcp`) that runs a **comprehensive, deterministic** anti-slop ruleset over component source a consumer AI agent is about to write. Slop prevention as a **network effect**: every Cursor/Claude/Copilot agent building on shilp-sutra self-gates through the DS's own rules before emitting code — not just our repo's CI.

**Why.** Our `check-slop.mjs` corpus (6 rules) only runs on OUR src in CI. The impeccable auto-detector is markup-only and missed our Tailwind/CVA slop. Consumer agents have nothing. `check_slop` puts the DS's amalgamated rules in the agents' hands at author-time (the "pre-emit self-critique" Hallmark ships, but sourced from the brand's real rules).

**Model: deterministic, not LLM.** Binary pattern checks (regex + light AST) — fast, free, reproducible, no API key. Mirrors Hallmark's "65 binary gates". An optional LLM "second opinion" is a v2, not v1.

## Amalgamated ruleset (the value)
Merge every source into one categorized, severity-tagged rule set:
- **Ours** — `slop-corpus.json` (side-stripe, gradient-text, sparkle, large-radius, heavy-shadow, caps-overuse).
- **Setu UI law + anti-patterns** (`setu_get_dimension('ui')`, `setu_get_anti_patterns`) — the authoritative brand rules: eyebrow-ban, tracked-caps discipline, card-shadow ban, accent-rail, filled+outline duo, chip-spam, middle-dot, one-accent, tonal-elevation, motion (hover-boop, uniform-entrance, spring-overshoot, no-reduced-motion), surface tokens.
- **impeccable absolute bans** — side-stripe, gradient-text, glassmorphism-default, hero-metric template, identical card grids, eyebrow/kicker, 01/02/03 numbering, text-overflow.
- **Web/Hallmark 2026 tells** — Inter/Roboto safe-face carrying identity, purple→blue gradient hero, dark-mode-default + neon-on-dark, gradient orbs/blobs, glass-everywhere, hover-does-nothing, uniform fade-in, snap-not-ease buttons, hero→features→testimonials→CTA skeleton.
- **a11y (axe-style)** — missing alt, low contrast (token misuse), skipped heading levels, unlabeled controls, non-token raw hex.

Each rule: `{ id, category (visual|type|color|layout|motion|spacing|a11y|structure), severity (P0|P1|P2), detect (regex | ast-hint), message, fix, source }`. Escape: `// slop-allow: <id> <reason>`.

## Positive dimension — coach toward good, not just flag bad
A linter that only says "don't" leaves the agent guessing what "do" looks like. `check_slop` returns TWO things: **findings** (anti-patterns) AND **guidance** (the DO-side). Sources for the positive rules:
- **Setu `premium` block** (`setu_get_anti_patterns` → premium) — signature-first, tonal-elevation-not-lines, bespoke-geometry, licensed/characterful type, real-material light/grain, say-less, authored-motion.
- **Setu UI law DO columns** — the exact token/class/component to reach for per rule (heading = one tier + semibold; spacing = the 4 relational tiers; one accent; surface tokens; press-not-hover motion).
- **impeccable fundamentals** — type pairing on a contrast axis, ~60–75ch measure, ≥1.25 type-scale ratio, flex-1D/grid-2D, semantic z-scale, ease-out-expo motion.
- **Visual-hierarchy heuristics** — size/scale + contrast + position as the core trio; 2–3 type sizes; whitespace as a tool (not a gap); grid + alignment; ONE focal accent; F/Z scan placement.

Two forms of positive check:
1. **Deterministic "good-practice presence"** (checkable): is type on the DS scale (not raw px)? spacing on the 4-tier scale? exactly one accent family (not sprayed)? focus-visible states present? tokens not raw hex? one radius vocabulary? These become PASS/IMPROVE signals, not just DON'T.
2. **Principles payload** — a curated, ranked `guidance[]` the tool always returns (hierarchy, rhythm, type pairing, whitespace, one focal accent, tonal depth, purposeful motion), each with a one-line "how" and, where detectable, whether THIS code exhibits it. So the agent gets a positive target, not only a rejection list.

## Output shape
`check_slop({code})` → `{ findings: [...anti-patterns...], strengths: [...good-practices detected...], guidance: [...ranked DO principles with how-to...], score }`. The agent fixes findings, keeps strengths, and pulls unmet guidance toward the design.

## Architecture — one ruleset, two consumers (no drift)
- Extract the corpus + engine into a **shared module** both the core `check-slop.mjs` and the mcp-server import. Candidate: publish the expanded corpus (`slop-corpus.json`) from core; mcp-server reads it (version-exact, like the manifest). For v1, if cross-package sharing is heavy, ship the superset corpus IN mcp-server and have core subset it — but document the single-source intent + add a drift advisory.
- **MCP tool** `check_slop({ code, filename?, framework? })` → `{ findings: [{id, severity, category, line?, message, fix, source}], summary }`. Mirror `validateSnippet` in `tools.mjs` + register in `index.mjs` (with `instrument`). Report format matches `check-slop.mjs`.
- Tool description frames it as the **pre-write gate**: "run before writing a shilp-sutra component; fix P0/P1 or annotate."

## Companion tool: `how_to_use` (self-teaching bootstrap)
Mirrors Setu's `how_to_use_this_brand`. An agent's recommended FIRST call — returns the MCP's own operating manual as JSON: the tool map (what each tool is for), the two sequences ("SETTING UP" → detect_framework→get_setup→preflight→validate_snippet; "WRITING a component" → check_slop before emit), the version-passing rule, and the escape-hatch convention. Why a tool (not just the server `instructions` string): callable + structured + richer, and its call-count is an **adoption metric** (are agents bootstrapping?). Registered like any tool; its description says "call first to learn how to use this MCP."

## Setu anti-AI integration + growth loop
- **Snapshot, not live-couple.** Bake a **versioned snapshot** of Setu's *universal* anti-patterns — the `principle` block (make-a-real-decision, cohesion-over-parts, no-recoloured-skeleton, dead-is-a-fail) — into the `guidance` payload, **attributed to Setu**. These are brand-agnostic + stable, so drift risk is low; re-sync on Setu updates. Do NOT duplicate Setu's brand-specific rules (palette/voice/logo) — that's Setu's job.
- **Clean division of labour:** shilp-sutra MCP = component/DS design quality (this tool). Setu = whole-brand anti-AI (voice, palette, logo, messaging). The two complement, don't overlap.
- **Advertisement = ONE tasteful line** on the `check_slop` + `how_to_use` summary (never per-finding, never a paragraph — a pitch in a lint result is itself slop): *"Design taste by Devalok. Setu checks your whole brand — voice · palette · logo — not just components → setu.devalok.dev."* Turns every consumer agent's slop-check into a soft Setu discovery moment.

## Build steps
1. **Author the amalgamated corpus** (`slop-corpus.json` grown from ~6 → ~40+ rules across all sources; keep each rule's `source`). Regex-first; mark AST-only rules as v2.
2. **Refactor `check-slop.mjs`** to load the shared corpus + engine (so core CI uses the same rules).
3. **Guidance + Setu snapshot** — author `slop-guidance.json` (positive DO principles) including the versioned Setu `principle` snapshot (attributed) + the one-line Setu ad string.
4. **mcp-server tools**: `tools.checkSlop({code,...})` + `tools.howToUse()`; register `server.tool('check_slop', …)` and `server.tool('how_to_use', …)` in `index.mjs` (with `instrument`); update the server `instructions` preamble ("WRITING a component? call check_slop"; "New here? call how_to_use").
5. **Tool-list + count**: regen via `generate-tool-list.mjs` (README/AGENTS `<!-- BEGIN:mcp-tools -->` markers — drift gate); update **11→13** everywhere asserted (AGENTS.md, smoke, manifest).
6. **Smoke** (`packages/mcp-server/scripts/smoke.mjs`) — check_slop (clean passes; purple-gradient/eyebrow/side-stripe flags; ad line present), how_to_use (returns tool map + sequences).
7. **Docs** — MCP manifest tool entries; `docs/specs/mcp-manifest-standard.md`; AGENTS.md "before you write" sequence gains check_slop; welcome banner note.
8. **Deploy** — Railway (mcp-server). GATED on explicit go (outward). Verify live by hitting the endpoint.

## Decisions / risks
- **Rule breadth v1**: ship the regex-detectable subset (most of the above); defer AST-only rules (nested-cards, hero-metric structure, skipped-heading-levels) to v2 with a clear "not-yet-detected" note (no silent gaps).
- **Drift**: two copies of the corpus (core CI + mcp) is the main risk — pick the single-source approach (core publishes, mcp reads) if feasible; else document + advisory.
- **False positives**: same escape-hatch discipline (`slop-allow`) + start advisory-leaning severities; the tool REPORTS, the agent decides.
- **Deploy** is the only outward/irreversible step — build + smoke locally first, deploy on explicit approval.
- Cost: zero (deterministic). Latency: negligible.

## Not in v1
- LLM second-opinion pass. Figma/visual-render checks. Auto-fix. Per-framework AST parsing (regex covers class-string tells).
