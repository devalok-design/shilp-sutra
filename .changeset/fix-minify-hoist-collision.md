---
'@devalok/shilp-sutra': patch
---

Fix a runtime crash in consumer production builds caused by a minify-hoisting collision in the bundled Radix primitives (issue #146).

The shipped `dist/_chunks/primitives.js` contained a **block-scoped function declaration** inside the `usePointerDownOutside` handler (vendored `react-dismissable-layer`). Our own minifier gave that function the same mangled identifier as the `isPointerInsideReactTreeRef` ref. Under block scoping this is fine, but when a consumer's build downlevels the chunk, Annex-B semantics hoist the block-level function declaration to a function-scoped `var`, shadowing the ref for the whole handler — so the guard read `!ref.current` resolves to the hoisted-undefined function and throws `TypeError: Cannot read properties of undefined (reading 'current')` from a `document` pointerdown listener. Symptom: outside-click dismiss stops closing overlays (Dialog/Sheet/DropdownMenu/Popover/Select/etc.), producing rage-clicks. Reproduced across esbuild and terser; consumers could not fix it from their own config.

Fix: emit the affected handlers as non-hoisting `const` arrows instead of block-level function declarations, in `react-dismissable-layer` and — defensively, same hazard class — `react-focus-scope`. Arrows are never Annex-B hoisted, so no consumer downlevel can alias them to a ref. Verified: the pre-fix minified shape throws the exact `#146` error under sloppy/downlevel execution; the post-fix shape runs clean, and the rebuilt chunk gives the inner handler a distinct identifier after downlevel.

No public API change.
