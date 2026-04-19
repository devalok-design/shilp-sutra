# Release Rollback Playbook

Every scenario below is a copy-pasteable command sequence. No prose to interpret under pressure.

Rule of thumb when something ships broken:
1. **First, flip `latest` back.** That stops new installs from pulling the bad version.
2. **Then, deprecate.** That warns consumers who already installed.
3. **Then (within 72h only), unpublish** if the bad version is actively harmful and no consumer should keep it.
4. **Then, patch.** Cut a fix release ASAP.

Do these steps in order. Don't skip step 1 — `npm deprecate` alone does NOT remove the bad version from `latest`; new installs keep getting it.

---

## Scenario 1: 0.37.0 just published, it's catastrophic (bricks consumer builds)

```sh
# 1. Demote 0.37.0 from @latest. New pnpm/npm installs will resolve to 0.36.1 again.
npm dist-tag add @devalok/shilp-sutra@0.36.1 latest

# 2. Deprecate 0.37.0 so consumers who already installed see a warning.
npm deprecate @devalok/shilp-sutra@0.37.0 \
  "Critical issue — downgrade to 0.36.1 or await 0.37.1. See https://github.com/devalok-design/shilp-sutra/issues"

# 3. Verify the flip took effect.
npm view @devalok/shilp-sutra dist-tags
# Should show: { latest: '0.36.1', 'latest-0.36': '0.36.1', next: '0.37.0-...' }

# 4. Unpublish ONLY if actively harmful. Available for 72h after publish.
#    This permanently removes the version from the registry. Cannot be re-published
#    at the same version number — you'd have to go to 0.37.0-hotfix.0 or 0.37.1.
# npm unpublish @devalok/shilp-sutra@0.37.0
```

Post-rollback: cut a 0.37.1 fix on a branch, repeat RC flow (see MIGRATION.md §RC).

---

## Scenario 2: RC (0.37.0-next.N) is broken, stable 0.37.0 not yet published

```sh
# No action on @latest — it still points to 0.36.1.
# Just deprecate the bad RC and publish a new one.

npm deprecate @devalok/shilp-sutra@0.37.0-next.0 \
  "Superseded. Use @next for the current prerelease."

# Then commit fix + let the Release workflow auto-publish 0.37.0-next.1.
```

---

## Scenario 3: Consumer is blocked post-0.37.0 publish but bug is small

Don't rollback. Cut 0.37.1 as a fast patch on the 0.37 branch.

```sh
# On your migration branch or fresh branch from 0.37.0 commit:
pnpm changeset                    # bump patch
# commit + push + PR + merge
# Release workflow auto-publishes 0.37.1 to @latest within ~15 min
```

Advise the affected consumer to wait for 0.37.1 (usually faster than their rollback).

---

## Scenario 4: Compromised NPM_TOKEN, may have published tainted versions

```sh
# 1. IMMEDIATELY rotate the token.
#    a. Revoke old token on npmjs.com
#    b. Generate new Automation token (Classic, bypass 2FA)
#    c. gh secret set NPM_TOKEN --repo devalok-design/shilp-sutra
#       (paste new token when prompted)

# 2. Audit the last N publishes.
npm audit signatures @devalok/shilp-sutra

# 3. Any version published under the old token that you cannot vouch for:
npm unpublish @devalok/shilp-sutra@<tainted-version>    # within 72h
npm deprecate @devalok/shilp-sutra@<tainted-version> "Compromised token — re-pull from <clean-version>"

# 4. Re-publish the same content from a known-good commit under the new token.

# 5. Migrate to OIDC trusted publishing so you don't have a long-lived token
#    at risk again. See docs/plans/2026-04-19-tw4-native-migration-0.37.md §−1d.
```

---

## Scenario 5: Needed to pin a consumer to an older stable while debugging

Consumer can pin via the `latest-0.36` dist-tag instead of hardcoding a version number:

```sh
# In the consumer repo:
pnpm add @devalok/shilp-sutra@latest-0.36
# Resolves to whatever we've tagged as latest-0.36 (currently 0.36.1)
```

Confirm the tag exists:
```sh
npm view @devalok/shilp-sutra dist-tags
```

Maintainer tip: any time we publish a new 0.36.x patch, also bump `latest-0.36` to point at it:
```sh
npm dist-tag add @devalok/shilp-sutra@0.36.2 latest-0.36
```

---

## Scenario 6: Accidentally published 0.37.0-next.N to @latest instead of @next

(Common Changesets mistake — `pre exit` was forgotten, or someone manually ran `pnpm publish` without `--tag`.)

```sh
# 1. Flip latest back.
npm dist-tag add @devalok/shilp-sutra@0.36.1 latest

# 2. Re-tag the prerelease correctly.
npm dist-tag add @devalok/shilp-sutra@0.37.0-next.N next

# 3. Verify.
npm view @devalok/shilp-sutra dist-tags
```

No deprecate or unpublish needed — the version is valid, it was just mis-tagged.

---

## Reference: npm command semantics

| Command | What it does | When to use |
|---|---|---|
| `npm dist-tag add <pkg>@<version> <tag>` | Points `<tag>` at `<version>`. Moves the tag if it already exists. | Flipping `latest`. Setting `latest-0.36`. Moving `next`. |
| `npm deprecate <pkg>@<spec> <msg>` | Adds install-time warning. **Does NOT remove the version.** New `@latest` installs still pull it unless the dist-tag is also flipped. | Warning consumers about a bad version. |
| `npm unpublish <pkg>@<version>` | Permanently removes the version from the registry. Allowed **only within 72h of publish**. Cannot re-publish the same version number. | Actively harmful versions. |
| `npm unpublish <pkg>` | Unpublishes the entire package. Almost never what you want. | Accidentally published a typosquat. |
| `npm audit signatures` | Verifies signatures of published versions. Useful post-token-compromise. | Suspected supply-chain incident. |

## What dist-tags are currently set

Run `npm view @devalok/shilp-sutra dist-tags` to see the live state. The list we maintain:

- `latest` — current stable.
- `latest-0.36` — pinned to the highest 0.36.x for consumers who can't yet migrate to 0.37.
- `next` — current prerelease (e.g., `0.37.0-next.N`).

If any of those show `undefined` or an unexpected version, treat it as an incident and escalate.
