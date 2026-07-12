# Wave 5 Audit — Shell + AI (final wave)

> Same rubric. **External note:** the four references *do* have shell peers — MUI `AppBar`/`Drawer`, Carbon `UIShell` (`Header`/`SideNav`) — so Shell is benchmarked against them. **No reference DS has an AI-native component layer at all**, so the AI layer is a pure frontier differentiator (Devadoot / Karm-driven).
> Scope: `shell/` (Sidebar, TopBar, BottomNavbar, NotificationCenter, NotificationPreferences, CommandRegistry, LinkContext, AppCommandPalette) + `ai/` (Conversation, CommandBar, BlockRenderer, AiCommandProvider, DevadootIcon, + `ai/blocks/*`).
> Date: 2026-07-12 · Method: profile + composition greps + depth read of top-bar, conversation, block-renderer, command-bar.

---

## Cross-cutting findings

### W5-1 — The entire AI layer ships as public exports but has no docs 🔴 HIGH
`package.json` exports `./ai`, `./ai/command-bar`, `./ai/conversation`, etc. — these are **public, installable, versioned** components. Yet:

| Component | doc | story |
|---|---|---|
| conversation | ✗ | ✓ |
| command-bar | ✗ | ✓ |
| block-renderer | ✗ | ✓ |
| devadoot-icon | ✗ | ✓ |
| ai-command-provider | ✗ | ✗ |
| `ai/blocks/*` (9 block components) | ✗ (likely) | ? |

No `docs/components/ai/*.md`. Consequences: the **hosted docs MCP** (`get_component`, `find_component`) and **`llms.txt`** — the DS's entire AI-agent-facing documentation strategy — have a blind spot exactly over the components most likely to be consumed *by* AI agents. The pre-publish-audit's per-component docs gate evidently doesn't cover `ai/` (grep found no `ai/`-specific docs assertion). **Recommendation:** either (a) author `docs/components/ai/*.md` + manifest entries and bring `ai/` under the docs gate, or (b) if the AI layer is deliberately experimental/unstable, mark it clearly (a `@experimental` tag + a note in the exports) so consumers know it's undocumented on purpose. Right now it's silently under-documented, which is the worst of both.

### W5-2 — Shell-chrome surface tier may deviate from the stated rule 🟡 MEDIUM (verify)
CLAUDE.md's surface rule lists **"shell chrome (Sidebar, TopBar), sticky headers"** under **surface-1**. But `TopBar` renders `bg-surface-raised` (the surface-2 "raised" token), and the grep found **no `bg-surface-1` anywhere in `shell/`**. Either (a) chrome intentionally uses `surface-raised` and the CLAUDE.md rule is aspirational/wrong for chrome, or (b) this is a real deviation. The `pre-publish-audit` only flags *illegitimate surface-1 usage* (surface-1 on a card) — it does **not** flag *missing* surface-1 on chrome, so this class of deviation is invisible to the gate. **Recommendation:** reconcile the code with the rule — either fix TopBar/Sidebar to surface-1, or correct the CLAUDE.md surface table to say chrome uses surface-raised. Don't leave the doc and code disagreeing.

### W5-3 — Shell composition discipline is the best in the codebase ✅
`shell/` components assemble more `ui/` primitives than any other layer, cleanly:
- `notification-preferences` → Button, Card, Dialog, Icon, IconButton, Select, Spinner, Switch (8)
- `notification-center` → Button, Icon, Popover, Sheet, Spinner, Tooltip, TruncatedText (7)
- `top-bar` → Avatar, DropdownMenu, Icon, Tooltip, TruncatedText (6)
- `sidebar` → Avatar, Button, Collapsible, Sidebar-primitive, TruncatedText (6)

Zero re-rolling of primitives here (contrast Wave 4's ScheduleView). This is what the whole `composed/` layer should look like.

### W5-4 — The AI block system is a genuinely novel architecture ✅
`BlockRenderer` is a **typed, extensible block registry**: 9 built-in blocks (`text`/`table`/`confirm`/`success`/`error`/`info`/`loading`/`divider`/`stat_row`), consumer `customBlocks` merged over built-ins (prop wins over context), `onAction` resolution (prop over context), a graceful `FallbackBlock` (renders unknown types as an `Alert` with the raw JSON — smart for forward-compat with server-emitted block types), staggered entrance, reduced-motion aware. `Conversation` layers streaming `ProcessingStep`s + agent headers + confirm/cancel/undo actions on top. **No reference DS has anything like this** — it's the structural core of an AI-native product surface. The only thing it lacks is the docs to make it usable by others (W5-1).

---

## Component scorecards

### TopBar — Internal A− · External A
- ✅ Composition root (`TopBar.Left/Center/Right/Section/IconButton/Title/UserMenu`), auto grid-vs-flex when a Center zone is present, `z-sticky` token, composes Avatar/DropdownMenu/Tooltip/TruncatedText, color-mode toggle.
- 🟡 W5-2 surface tier (`bg-surface-raised` vs the rule's surface-1). `UserMenuItem.color` is a raw `string` mapped to `text-{color}` — stringly-typed, no union (a typo silently yields a dead class).
- **External:** MUI `AppBar` / Carbon `Header` are the peers. Our compositional subcomponent API is more flexible than MUI's monolithic AppBar; parity with Carbon UIShell.

### Sidebar (shell) — Internal A− · External A
- ✅ Composes the `ui/sidebar` primitive + Avatar/Button/Collapsible/TruncatedText. (Two-tier: `ui/sidebar` = mechanism, `shell/sidebar` = opinionated app sidebar — reasonable split.)
- 🟡 W5-2 surface tier applies here too.
- **External:** MUI `Drawer` / Carbon `SideNav` peers — parity+, our collapsible + role-aware composition is competitive.

### NotificationCenter — Internal A · External A
- ✅ 7-primitive composition (Popover/Sheet responsive, Button, Tooltip, Spinner, TruncatedText), likely the responsive overlay pattern from W2. Clean.
- **External:** no direct peer; differentiator.

### NotificationPreferences — Internal A · External A
- ✅ 8-primitive composition. The most primitive-dense component in the DS and it re-rolls nothing. Exemplary.

### BottomNavbar — Internal A− · External A
- ✅ Composes Icon/IconContext; mobile tab bar. `z`-layer + safe-area presumably (verify safe-area-inset token usage for notch devices).
- **External:** MUI `BottomNavigation` peer; parity.

### AppCommandPalette / CommandRegistry / LinkContext — Internal A · External A
- ✅ `CommandRegistry` (58 LOC) + `LinkContext` (6 LOC) are infrastructure (context/registry) — correctly thin, no UI to document as a visual component (though `command-registry` has a doc; `link-context` has a doc but no story — fine for a 6-line context).
- `AppCommandPalette` composes Icon + the command infrastructure.

### Conversation (AI) — Internal A− · External A
- ✅ Streaming thread: `ProcessingStep` status icons (done/active/error/pending), agent header, `BlockRenderer` integration, `customBlocks`, autoScroll, maxHeight, action callbacks. Uses the `motion-provider` (reduced-motion). Composes Icon.
- 🔴 W5-1 no docs. 🟢 `font-body` (W4-3) present in AI files.
- **External:** zero peers — frontier.

### CommandBar (AI) — Internal A− · External A
- ✅ 906 LOC, 3 variants (hero/inline/floating), floating variant reuses the Dialog primitive (`DialogContentRaw` — the escape hatch from W2), global keybinding via `lib/keybinding`, animated brand-gradient processing border, placeholder rotation. Ambitious and cohesive.
- 🟡 Largest AI file; W5-1 no docs; confirm the brand-gradient colors are token-driven not hardcoded hex.
- **External:** cmdk/`CommandPalette` is the nearest structural peer but has no AI-submission path — we're beyond it.

### BlockRenderer + blocks/ (AI) — Internal A · External A+
- ✅ See W5-4. Best-architected extensibility in the DS. Fallback-to-Alert is a standout forward-compat call.
- 🔴 W5-1 — the 9 `blocks/*` components + the renderer are undocumented despite being the extension surface consumers most need to understand.

### DevadootIcon (AI) — Internal A · External —
- ✅ 217-LOC animated brand mascot SVG, no `ui/` imports (correct — it's a leaf brand asset). Has a story.
- 🟡 no doc (W5-1), though as a brand glyph that's lower-stakes than the functional AI components.

---

## Wave 5 grade summary

| Component | Internal | External | Top defect |
|---|---|---|---|
| TopBar | A− | A | surface tier (W5-2); stringly `color` |
| Sidebar (shell) | A− | A | surface tier (W5-2) |
| NotificationCenter | A | A | — |
| NotificationPreferences | A | A | — (exemplary) |
| BottomNavbar | A− | A | verify safe-area token |
| Conversation | A− | A | no docs (W5-1) |
| CommandBar | A− | A | no docs; verify gradient tokens |
| BlockRenderer + blocks/ | A | **A+** | no docs on the extension surface |
| DevadootIcon | A | — | no doc |

**Wave verdict:** Shell is the DS's **cleanest composition layer** — NotificationPreferences assembles 8 primitives with zero re-rolling, the opposite of Wave 4's ScheduleView. The AI layer is the DS's **most forward-looking asset** — a typed, extensible block/conversation architecture no reference DS attempts. But it carries the wave's one serious debt: **it's shipped, exported, and versioned with no documentation**, which directly undercuts the hosted-MCP/llms.txt strategy that is itself a headline DS feature. The other item is the shell-chrome surface-tier question (W5-2), which is really a "make the code and the CLAUDE.md rule agree" task.

---

## Recommended actions (ranked)

1. **W5-1 — Document the AI layer** (`docs/components/ai/*.md` + manifest entries for conversation, command-bar, block-renderer, ai-command-provider, and the 9 `blocks/*`), and bring `ai/` under the docs-coverage gate — or explicitly mark it `@experimental`. It's public and undocumented today; that's the highest-severity gap in the whole audit for a DS whose thesis is machine-readable docs.
2. **W5-2 — Reconcile shell-chrome surface tier** with the CLAUDE.md rule (fix code to surface-1, or fix the rule to say chrome uses surface-raised). Then consider a gate that flags chrome *not* on the expected tier.
3. **TopBar `UserMenuItem.color`** — replace the raw `string` with the intent-color union (ties to Wave 1's X-3 color-vocabulary work).
4. **Verify token-drift in AI/shell**: CommandBar gradient colors (tokens not hex), BottomNavbar safe-area inset, `font-body` (W4-3) in the AI files.

> **Audit complete (Waves 1–5).** Cross-wave layman summary follows in `SUMMARY.md`.
