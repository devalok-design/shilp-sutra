---
"@devalok/shilp-sutra": patch
---

docs(recipes/llms/skill/AGENTS): close docs drift surfaced by three downstream consumer audits

Three independent consumer audits against 0.39.0 landed in the last 48 hours
(`tbf-tracker`, `hiring-platform`, `karm-v2` #44). None reported runtime or
type bugs — every finding was a documentation gap, a stale claim, or an AI
agent following a doc rule that produced no-op churn. This patch fixes the
documentation-only subset. No component code, types, runtime behavior, peer
deps, or exports changed — safe to install over 0.39.0 with zero consumer
edits.

**Recipes** (`packages/core/docs/recipes/`)

- All six install recipes (Next App Router, Next Pages, Vite, Astro, Remix,
  TanStack Start) now carry a `2a. Optional peer dependencies` table with
  exact `pnpm add` commands for `d3-*` (charts), `@tanstack/react-table` +
  `@tanstack/react-virtual` (DataTable), `date-fns` (date pickers), `@tiptap/*`
  (RichTextEditor), `input-otp`, `react-pdf` + `react-zoom-pan-pinch`
  (FilePreview), `react-markdown` + `react-syntax-highlighter`
  (MarkdownViewer), `@tabler/icons-react`. The README's "Optional Peer
  Dependencies" section existed but the per-framework recipes never linked
  to it — AI agents following the recipe linearly only discovered missing
  peers at the first `next build` failure.
- `install-next-app-router.md` §1 — dropped stale "OR `pages/` exists with
  only `_app`/`_document`" clause. `create-next-app@16+` no longer scaffolds
  `pages/` for App Router projects.
- `install-next-app-router.md` §8 — `p-3` vs `p-ds-03` rule reworded. DS
  spacing tokens (`p-ds-04`) and TW4 numeric scale (`p-4`) coexist by design
  per `tokens/semantic.css:68` — both are valid. The previous "use p-ds-04,
  not p-4" framing was pushing consumers (and their AI agents) into
  churn-PR territory. Explicitly say "do NOT mass-codemod" now.

**`llms.txt`** (`packages/core/llms.txt`)

- New "IMPORT PATH CHEATSHEET" section enumerating the exact subpath for
  every component whose import path is NOT the kebab-case of its name
  (`FormField` → `ui/form`, `AppSidebar` → `shell/sidebar`, charts barrel,
  date-picker family, AI primitives, motion primitives, hooks). Fresh AI
  agents no longer have to guess and hit a TS error before learning the
  truth.
- `IconButton` entry rewritten to make the `icon=` prop vs `children`
  constraint loud: type omits `children` deliberately, raw
  `<IconButton><Icon /></IconButton>` is a TS error, correct form is
  `<IconButton icon={<Icon icon={X} />} aria-label="…" />`. Surfaced by
  hiring-platform's "discovery cost: I tried `children` first" note.
- `toast` entry rewritten to spell out the positional signature
  `toast.success(message, options?)`. Previously implied object-first API
  (Mantine / Chakra-style), which hiring-platform reporter assumed and got
  wrong. Concrete examples for `success`, `error` with `description`,
  `promise`, `upload`. Reminder that calls without a mounted `<Toaster />`
  are no-ops.

**Root docs**

- `README.md`: troubleshoot.md tagline `8 most common breakages` → `12 most
  common` (file actually has 12 `## Symptom:` headers).
- `AGENTS.md`: line 64 "barrel will fail in RSC contexts" rewritten. With
  all peers installed Next 16 honours each per-file `"use client"` and the
  barrel works in RSC — what it does fail on is the peer-dep cliff
  (`input-otp` in `src/ui/index.ts:49`, etc.). New wording covers both:
  "Per-component imports keep RSC fast AND avoid peer-dep cliffs … the
  barrel forces hard peers to be installed AND inflates the client bundle.
  Existing barrel usage is not an emergency." Closes karm-v2 #44 sub-A.
- `AGENTS.md`: line 65 "Use `p-ds-04`, not `p-4`" rewritten — explicit
  coexistence stance, "do NOT mass-codemod". Matches the design intent in
  `tokens/semantic.css:68`. Closes karm-v2 #44 sub-B.
- `AGENTS.md`: troubleshoot tagline → "twelve most common breakages" with
  matching list (Tailwind tokens, framer-motion duplicates,
  `transpilePackages`, CSS import order, dark mode, RSC errors, font 404s,
  hydration, missing optional peer deps, bare `shadow`, missing
  `<Toaster />`, Storybook MCP 404).

**Agent Skill** (`skills/shilp-sutra/SKILL.md` + bundled
`packages/core/skill/SKILL.md`)

- `metadata.version` `0.38.0` → `0.39.0` to match shipped package version.
  Skill had drifted one release behind.
- Description "eight most common breakages" → "twelve most common".
- New `scripts/sync-skill-version.mjs` chained into `pnpm version-packages`
  (`changeset version && node scripts/sync-skill-version.mjs`). Future
  changeset bumps now auto-update both skill source and bundled copy.

**CI gate** (`scripts/pre-publish-audit.mjs`)

- New gate: `skill/SKILL.md metadata.version matches
  packages/core/package.json#version`. Checks both
  `skills/shilp-sutra/SKILL.md` (source) and `packages/core/skill/SKILL.md`
  (build artifact). Blocks future drift recurrence.

**Investigated, no code change needed**

- `hiring-platform` reported "Button height is more than Input height in
  comparable sizes". Verified via Playwright @2x against fresh storybook
  build: heights identical at every size (xs=28, sm=32, md=40, lg=48) and
  border-radii identical (`rounded-control` = 6px everywhere). Both
  components use the same `h-ds-*` and `rounded-control` semantic role
  tokens — confirmed across source, fresh build, and pixel measurements.
  Original observation was against a stale local storybook-static built
  before commit `e698df94` (shape-presets radius unification). Closed
  without code change.

**What this patch does NOT cover** (tracked for 0.40.0 / 0.41.0)

- Build / packaging: F-02 (barrel `input-otp` static-export drop), F-03
  (per-chart d3 split) → Wave 2.
- Type system: F-01 (polymorphic Text/Stack generic loss) → Wave 3.
- Agent integration: F-08a/b (ship AGENTS.md in tarball, postinstall hint,
  optional managed-block injection into consumer AGENTS.md), F-22
  (`<Toaster />` runtime warning when sonner missing) → Wave 4.
- DX tooling: F-10 (icon API consistency), F-11 (eslint plugin — now
  open-question per F-19 coexistence stance), F-15 (init CLI), F-18
  (`llms-quick.txt` split), F-23 (TW3→TW4 codemod) → Wave 5.

Each remaining finding will be its own changeset.
