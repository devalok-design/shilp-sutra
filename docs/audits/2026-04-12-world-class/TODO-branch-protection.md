# TODO: Verify Branch Protection (Wave 2.8)

**Status:** Pending — requires manual GitHub settings check

**Action:** Go to GitHub repo settings → Branches → Branch protection rules for `main`.

Confirm:
- [ ] Require status checks to pass before merge (select the `ci` job)
- [ ] Require pull request reviews (or skip if solo/Claude Code workflow)
- [ ] Disable force push to main
- [ ] Require linear history (optional)
