---
"@devalok/shilp-sutra": patch
---

**docs:** comprehensive sweep of every component doc — Composability sections, prop accuracy, and a new publish gate that prevents drift.

Most of the work is in `docs/components/**/*.md` (which ships in the npm bundle via the `files` array) and `llms-full.txt` (the compiled AI-agent reference, also shipped). No component APIs change.

**What changed for consumers:**

- **Every one of the 119 component docs now has a `## Composability` section** — covers required providers, context cascade, sibling/companion components, alternatives, router/framework integration. AI agents reading `llms-full.txt` get richer guidance on how pieces fit together, not just props + defaults.
- **Prop accuracy fixes on 11 components:** Alert (added `size`, documented `solid` variant), Card (added `color` / `size` / `accent` / `accentColor`), Combobox (`size`), NumberInput (`size` + `state`), Select (`variant` + `color`, size expanded to `xs`), Sidebar (SidebarMenuButton's `variant` / `size` / `isActive` / `tooltip` / `asChild`), Slider (`size` + `color`), Tabs (TabsList `size` + `orientation`), Text (full variant list enumerated), Textarea (`xs` size), Toggle (`color`). These props existed in source but weren't documented — consumers had to read the `.tsx` to find them.
- **Composability deepening** on 26 context-heavy components — Card (size cascade), ButtonGroup (position-aware radius, focus isolation), Form (FormField auto-consumption by Input/Textarea/NumberInput/InputOTP; explicit for Checkbox/Radio/Switch/Slider), Icon (IconProvider cascade), Sidebar (SidebarProvider state model + three-provider setup), DataTable (server vs client mode switching), etc.
- **InputOTP** — Props section finally lists `maxLength`, `value`, `onChange`, `onComplete`, `pattern`, `state`, `size` (was "standard input-otp props"). Documented the InputOTPSizeContext cascade.

**New publish gate:** `scripts/audit-component-docs.mjs --check` runs in `pre-publish-audit.mjs`. Fails the publish on any HIGH drift between a component's CVA source and its Props-section axes. Medium flags (TS-only props the script can't see) stay advisory.
