---
"@devalok/shilp-sutra": patch
---

Add the missing `./ui/truncated-text` subpath export.

0.44.0 shipped the new `TruncatedText` primitive in `dist/` and re-exported it
from the package root (`@devalok/shilp-sutra` and `@devalok/shilp-sutra/ui`), but
the granular subpath was never added to `package.json#exports`. As a result:

```ts
import { TruncatedText } from "@devalok/shilp-sutra/ui/truncated-text";
// -> Module not found, before 0.44.1
```

Root-barrel imports were unaffected and continue to work. This patch restores
parity with every other `./ui/*` component.

To prevent recurrence, `pre-publish-audit.mjs` now gates on every flat
`src/ui/*.tsx` component having a matching `./ui/<name>` subpath export (or an
explicit barrel-only allowlist entry). The SSR smoke test iterates the exports
map, so it now also imports `truncated-text` — closing the gap that let this slip.
