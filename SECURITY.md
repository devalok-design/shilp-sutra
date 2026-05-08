# Security Policy

## Supported Versions

We patch security issues on the latest minor release line only. Older minors do not receive backported fixes; upgrade to a supported version.

| Version  | Status                  |
|----------|-------------------------|
| `0.38.x` | ✅ Active               |
| `0.37.x` | ✅ Critical fixes only  |
| `< 0.37` | ❌ Unsupported          |

## Reporting a Vulnerability

**Please do not open a public GitHub issue.** Coordinate disclosure privately first.

- **Email:** `shilp-sutra@devalok.in`
- **Subject:** `[SECURITY] @devalok/shilp-sutra <short description>`

Please include:

- Affected version(s) and a minimal reproduction (or proof-of-concept)
- Impact assessment (what an attacker could achieve, who is exposed)
- Suggested mitigation if known
- Whether you wish to be credited in the advisory

We will acknowledge receipt within **72 hours**. Coordinated disclosure timelines depend on severity:

| Severity  | Patch target | Public disclosure                  |
|-----------|--------------|------------------------------------|
| Critical  | 7 days       | After patched release              |
| High      | 14 days      | After patched release              |
| Medium    | 30 days      | With patched release               |
| Low       | Next minor   | With release notes                 |

## Provenance & Verification

All releases since `0.37.0` are signed with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) via OIDC trusted publishing. The `release.yml` workflow uses `id-token: write` and npm `>= 11.5.1` to mint sigstore attestations on the public Rekor transparency log.

Verify a published version:

```bash
npm view @devalok/shilp-sutra@<version> --json
```

The `dist.attestations` field links to the sigstore log entry. The corresponding GitHub Actions run is recorded in the attestation subject — confirm it matches a tag on `main`.

## Scope

In scope:

- The published packages `@devalok/shilp-sutra` and `@devalok/shilp-sutra-brand`
- The release workflow `.github/workflows/release.yml` and pre-publish audit `scripts/pre-publish-audit.mjs`
- The vendored Radix primitives at `packages/core/src/primitives/`

Out of scope:

- Storybook, MIGRATION.md, marketing/docs site (informational only — report typos as regular issues)
- Vulnerabilities in transitive dependencies that do not affect Shilp Sutra's runtime surface (report upstream first; we will track and bump)

## Disclosure history

No advisories have been issued. When the first one lands it will be linked here and from `CHANGELOG.md`.
