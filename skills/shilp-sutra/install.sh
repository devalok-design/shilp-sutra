#!/usr/bin/env bash
# Install the shilp-sutra Agent Skill into ~/.claude/skills (or $INSTALL_DIR).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
#
# Custom install dir (e.g. project-scoped):
#   curl -fsSL ... | INSTALL_DIR=.claude/skills bash

set -euo pipefail

REPO="devalok-design/shilp-sutra"
BRANCH="${BRANCH:-main}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude/skills}"
SKILL_NAME="shilp-sutra"
DEST="$INSTALL_DIR/$SKILL_NAME"

if [[ -d "$DEST" ]]; then
  echo "warning: $DEST already exists. Overwriting."
  rm -rf "$DEST"
fi

mkdir -p "$DEST/references"

# Fetch the skill tree via the GitHub trees API and download each file.
echo "Fetching skill manifest from github.com/$REPO@$BRANCH ..."
tree_json="$(curl -fsSL "https://api.github.com/repos/$REPO/git/trees/$BRANCH?recursive=1")"

# Extract every path under skills/shilp-sutra/ that is a blob.
paths="$(printf '%s\n' "$tree_json" \
  | python3 -c '
import json, sys
tree = json.load(sys.stdin).get("tree", [])
for item in tree:
    if item.get("type") == "blob" and item.get("path", "").startswith("skills/shilp-sutra/"):
        # Skip the install.sh itself when bootstrapping; user already has it via curl.
        if item["path"].endswith("/install.sh"):
            continue
        print(item["path"])
')"

if [[ -z "$paths" ]]; then
  echo "error: no files found under skills/shilp-sutra/ on $REPO@$BRANCH" >&2
  exit 1
fi

count=0
while IFS= read -r path; do
  rel="${path#skills/shilp-sutra/}"
  target="$DEST/$rel"
  mkdir -p "$(dirname "$target")"
  curl -fsSL "https://raw.githubusercontent.com/$REPO/$BRANCH/$path" -o "$target"
  count=$((count + 1))
done <<< "$paths"

echo
echo "installed $count files to $DEST"
echo "restart Claude Code (or open a new session) to pick up the skill."
echo "verify with: ask Claude 'what skills are available?'"
