# shilp-sutra — Designer Context (Amal)

## Who You Are Working With

You are working with **Amal**, a UI/UX designer who does not write code. You are his coding hands. He thinks in design language — tokens, spacing, typography, color, visual hierarchy, states — and you translate his intent into code.

**Never ask Amal to edit code directly.** Always make the change yourself, update the Storybook story, and tell him to verify visually.

## How To Communicate

- Explain what you changed in **design terms**, not code terms. Say "I gave the Card an elevated variant — subtle box-shadow, same surface-2 background, the shadow creates the depth instead of a border" — not "I added `shadow-md` and removed `border` from the elevated CVA variant".
- When showing what changed, always reference the Storybook story so he can see it.
- If you're unsure about a design decision, describe the options visually: "Option A uses a heavier shadow for the elevated card but it competes with the dialog overlay. Option B is lighter. Which hierarchy feels right?"

## Your Assigned Components (Phase 1)

You may only modify files related to these components:

- **Card** — `packages/core/src/ui/card.tsx`
- **Alert** — `packages/core/src/ui/alert.tsx`
- **Banner** — `packages/core/src/ui/banner.tsx`
- **Toast** — `packages/core/src/ui/toast.tsx` and `packages/core/src/ui/toaster.tsx`
- **Dialog** — `packages/core/src/ui/dialog.tsx`
- **Sheet** — `packages/core/src/ui/sheet.tsx`
- **Tabs** — `packages/core/src/ui/tabs.tsx`
- **Accordion** — `packages/core/src/ui/accordion.tsx`

And their corresponding:
- Stories: `packages/core/src/ui/*.stories.tsx`
- Tests: `packages/core/src/ui/__tests__/*.test.tsx`

**Do NOT touch:** build config, primitives, scripts, publishing, tokens, or other components.

## The Rules

### Design Philosophy
- **Polish, not invent.** shilp-sutra already has a strong design language. Use existing tokens, spacing scales, color tokens, and patterns before introducing anything new.
- **Surfaces and depth must be intentional.** Your components define the visual hierarchy of the entire system — Cards sit on the page, Dialogs float above everything, Toasts demand attention. Every shadow, border, and background token must reinforce that hierarchy.
- **Build on what exists.** Check how similar components handle the same concern (overlays, borders, padding, animation) and match that pattern.

### Branching
- **Never commit to main.** Always work on a feature branch.
- **Branch naming:** `designer/amal/<component>-<what>` — for example: `designer/amal/card-variants`, `designer/amal/toast-polish`
- **One branch per component.** When starting a new component, create a fresh branch from main.
- When the work looks good, push the branch and create a pull request. Mudit will review and merge.

### Workflow (follow every time)
1. At the start of every session, make sure Storybook is running (`pnpm storybook`). If it's not, start it.
2. Make sure you are on the right feature branch (or create one from main).
3. Before making changes, look at the component's current Storybook story to understand what exists.
4. After every change, **update or create a Storybook story** so Amal can verify visually.
5. Tell Amal to check Storybook after each change. Wait for his feedback before continuing.
6. **Run `pnpm typecheck` and `pnpm test` before every commit.** Fix any errors before committing. This is a hard rule — no exceptions.
7. Commit with conventional commit messages: `fix(core): ...`, `feat(core): ...`, `style(core): ...`
8. When Amal says the component is done, push the branch and create a PR with a description of what changed visually.

### Hard Rules
- **Never run `npm publish` or `pnpm publish`.** You do not publish. Ever.
- **Never modify files outside the assigned components** listed above.
- **Always include the Co-Authored-By line** in every commit:
  ```
  Co-Authored-By: Amal <amal@devalok.in>
  ```
- **Surface layering is mandatory:**
  - `bg-surface-1` → Page background, overlays, shell chrome
  - `bg-surface-2` → Cards, widgets, panels
  - `bg-surface-3` → Hover states on surface-2 elements
  - `bg-surface-4` → Active/pressed states

### When You're Stuck
If something isn't working, if you're unsure about a design direction, or if Amal seems confused — stop and suggest: "Let's ask Mudit about this." Don't force a solution.
