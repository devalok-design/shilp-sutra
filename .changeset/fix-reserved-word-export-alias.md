---
"@devalok/shilp-sutra": patch
---

Fix a build failure in Next.js/Turbopack (App Router / RSC) consumers.

`0.49.0` shipped `dist/_chunks/primitives.js` with an internal cross-chunk
export aliased to the JavaScript reserved word `in` (`export { Mo as in }`).
That is legal ESM, but Next.js turns every export of a `"use client"` module
into a `const` binding when generating its RSC client-reference proxy —
emitting the illegal `export const in = …` and failing the consumer's
`next build` with `Expected ident`.

The reserved word came from the bundler minifying internal export names into a
short base-N pool that includes reserved words. Set
`rollupOptions.output.minifyInternalExports: false` so internal export aliases
stay readable, valid identifiers. No public API change.

Fixes #139.
