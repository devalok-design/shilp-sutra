---
"@devalok/shilp-sutra": minor
---

feat: Wave 4 — agent-friendly install experience

Three changes that make the package easier to onboard for both human developers and AI coding agents (Codex, Cursor, Copilot, Aider, Claude Code, Windsurf, …):

## AGENTS.md ships inside the npm tarball

The repo-root `AGENTS.md` is now copied into the package at publish time and is available to consumers at `node_modules/@devalok/shilp-sutra/AGENTS.md`. The 25+ tools that auto-discover `AGENTS.md` from a project root (Codex, Cursor, Copilot, Aider, Windsurf, Devin, Jules, Gemini CLI, Zed, Warp, JetBrains Junie, …) will now also find ours alongside the recipes.

AGENTS.md is reframed as purely consumer-facing: "how to use shilp-sutra in a downstream app". Maintainer-internal docs (build pipeline, audit gates, internal patterns) stay in the repo-root `CLAUDE.md` and are not shipped.

> Anthropic Claude Code doesn't auto-load AGENTS.md yet — symlink it (`ln -s AGENTS.md CLAUDE.md`) or copy the contents into your own CLAUDE.md so the same rules apply.

Files: `packages/core/package.json#files` now includes `AGENTS.md`; `packages/core/scripts/copy-root-docs.mjs` copies repo-root AGENTS.md → `packages/core/AGENTS.md` at build time (gitignored, identical to the existing MIGRATION.md flow).

## `agents` field per npm-agentskills convention

`packages/core/package.json` now declares an `agents` field per the [npm-agentskills](https://github.com/onmax/npm-agentskills) spec:

```json
{
  "agents": {
    "skills": [{ "name": "shilp-sutra", "path": "./skill" }]
  }
}
```

Consumers running `pnpm dlx @codemcp/agentskills export` (or `pnpm dlx agentskills export --target claude`) will auto-discover the bundled skill and copy it into `.claude/skills/`, `.cursor/skills/`, `.github/skills/`, etc. No package-specific install command needed — opt into the emerging cross-tool convention.

The existing manual paths (`cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` and the curl installer) still work and are documented as fallbacks in the README.

## Pretty postinstall welcome banner

`packages/core/scripts/welcome.mjs` (new) prints a Devalok-branded ASCII-lotus + setup hint when consumers install the package for the first time per major.minor:

```
╭───────────────────────────────────────────────────────────────╮
│         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
│         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠹⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
│              … (13-row Braille lotus) …                       │
│                                                               │
│   ✦  @devalok/shilp-sutra  0.40.0                             │
│      Tailwind 4 design system · 110+ components · RSC-safe    │
│                                                               │
│   ▸ Setup recipe (pick your framework):                       │
│     node_modules/@devalok/shilp-sutra/docs/recipes/           │
│                                                               │
│   ▸ Theme it in 30 seconds:                                   │
│     https://shilp-sutra.devalok.in/themer                     │
│                                                               │
│   ▸ Wire your AI agent (Claude Code / Cursor / Codex):        │
│     cp -r node_modules/@devalok/shilp-sutra/skill \           │
│        ~/.claude/skills/shilp-sutra                           │
│                                                               │
│   Disable this banner: SHILP_SUTRA_NO_WELCOME=1               │
│                                                               │
│   Built by Devalok · devalok.in                               │
╰───────────────────────────────────────────────────────────────╯
```

### Safety guards (all silent failures, never throws)

- `process.env.CI` set → silent
- `process.env.SHILP_SUTRA_NO_WELCOME=1` → opt-out
- `process.env.NO_COLOR` → strip ANSI
- `process.stdout.isTTY === false` → silent (piped builds, Docker)
- `npm_config_loglevel === 'silent'` → silent
- `INIT_CWD` absent OR inside the package itself → silent (dev install)
- Sentinel `node_modules/.shilp-sutra-welcomed` carries the version → re-fires only on version change
- Terminal narrower than 70 cols / shorter than 28 rows → falls back to 6-line compact banner
- Try/catch wraps everything → consumer install can never break because of this script

### Preview mode for maintainers

`node packages/core/scripts/welcome.mjs --preview` (or `--compact`) bypasses all guards. Used to verify rendering before publish.

### Note for pnpm consumers

Modern `pnpm` blocks postinstall scripts on dependencies by default for supply-chain safety. First-time pnpm consumers will see:

```
WARN  postinstall scripts blocked — run `pnpm approve-builds` to allow
```

…then the banner appears on the next install. `npm`/`yarn`/`bun` consumers see it immediately. This is the modern pnpm contract — same shape as `esbuild`, `sharp`, `husky`, etc.

## Updated troubleshoot.md

New symptom entry: `Cannot find module 'sonner' / 'input-otp' / 'date-fns' / '@tiptap/react' / …`. Table maps each Wave-2 peer-cliff component to the install command. Counts ticked: 13 symptoms total (was 12).

`<Toaster />`'s JSDoc also gained an ⚠ peer-required callout — IDE hover shows the `pnpm add sonner` hint inline.

## What this patch does NOT include

- **F-22 runtime warning when Toaster mounts without sonner** — not achievable. `toaster.tsx` static-imports sonner, so if the peer is missing the file never loads and runtime code never runs. Replaced with louder JSDoc + the new troubleshoot table above.
- **Consumer AGENTS.md mutation (F-17)** — deferred to Wave 5 init CLI. No file mutation in postinstall.

## Closes

- tbf-tracker F-08a (ship AGENTS.md in tarball)
- tbf-tracker F-08b (postinstall hint — implemented as pretty banner)
- tbf-tracker F-16 (skill discoverability — via npm-agentskills convention)
- hiring-platform F-22 (sonner peer surface — JSDoc + troubleshoot, runtime warn not possible)
