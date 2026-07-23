---
"@devalok/shilp-sutra": patch
---

Fix Themer output silently dropping the pasted brand override, and harden the agent theming contract.

- **Themer CSS output no longer emits a nested `/* */` comment in its header.** CSS comments do not nest, so the inner `*/` closed the header early and the stray `*/` corrupted the `:root{}` block right after it — the entire accent ramp + radius override was silently dropped at build (a warning only, exit 0), so the fetched brand color never applied. Masked whenever the chosen color happened to match the package default.
- **AGENTS.md theming recipe is explicit about the contract.** The `result.json` endpoint accepts only `archetype` or numeric `hue`/`chroma` — there is no `hex`/`color` param, and passing one is silently ignored (you get the default theme, wrong color, no error). The recipe now tells agents to convert a hex to OKLCH first, sanity-check the echoed `hue`/`chroma`, and verify the accent actually changed.
- **`verify_setup` now flags nested CSS comments** so a dropped override is caught before it ships instead of failing silently.
