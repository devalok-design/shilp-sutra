#!/usr/bin/env bash
# Install the shilp-sutra Agent Skill into ~/.claude/skills (or $INSTALL_DIR).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
#
# Custom install dir (e.g. project-scoped):
#   curl -fsSL ... | INSTALL_DIR=.claude/skills bash
#
# Lightweight chat variant (Claude Desktop, and other AI chat surfaces):
#   curl -fsSL ... | VARIANT=chat bash

set -euo pipefail

REPO="devalok-design/shilp-sutra"
BRANCH="${BRANCH:-main}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude/skills}"

VARIANT="${VARIANT:-agent}"   # "agent" (default) | "chat"
if [[ "$VARIANT" == "chat" ]]; then
  SKILL_NAME="shilp-sutra-chat"
  SKILL_SUBDIR="chat"          # fetch from skills/shilp-sutra/chat/
else
  SKILL_NAME="shilp-sutra"
  SKILL_SUBDIR=""              # existing behaviour — whole skills/shilp-sutra/ tree
fi
DEST="$INSTALL_DIR/$SKILL_NAME"

if [[ -d "$DEST" ]]; then
  echo "warning: $DEST already exists. Overwriting."
  rm -rf "$DEST"
fi

mkdir -p "$DEST"
if [[ "$VARIANT" != "chat" ]]; then
  mkdir -p "$DEST/references"
fi

FETCH_ROOT="skills/shilp-sutra${SKILL_SUBDIR:+/$SKILL_SUBDIR}"

# Fetch the skill tree via the GitHub trees API and download each file.
echo "Fetching skill manifest from github.com/$REPO@$BRANCH ..."
tree_json="$(curl -fsSL "https://api.github.com/repos/$REPO/git/trees/$BRANCH?recursive=1")"

# Extract every path under the target skill root that is a blob.
paths="$(printf '%s\n' "$tree_json" \
  | python3 -c "
import json, sys
tree = json.load(sys.stdin).get('tree', [])
root = '$FETCH_ROOT/'
for item in tree:
    path = item.get('path', '')
    if item.get('type') != 'blob' or not path.startswith(root):
        continue
    # Skip source-only files that aren't meant to be installed.
    if path.endswith('/install.sh'):
        continue
    if path.endswith('SKILL.md.template') or path.endswith('/.gitignore'):
        continue
    print(path)
")"

if [[ -z "$paths" ]]; then
  echo "error: no files found under $FETCH_ROOT/ on $REPO@$BRANCH" >&2
  exit 1
fi

count=0
while IFS= read -r path; do
  rel="${path#$FETCH_ROOT/}"
  target="$DEST/$rel"
  mkdir -p "$(dirname "$target")"
  curl -fsSL "https://raw.githubusercontent.com/$REPO/$BRANCH/$path" -o "$target"
  count=$((count + 1))
done <<< "$paths"

echo
echo "installed $count files to $DEST"

if [[ "$VARIANT" == "chat" ]]; then
  echo ""
  echo "── Claude Desktop: add this to claude_desktop_config.json ──────────"
  echo '{'
  echo '  "mcpServers": {'
  echo '    "shilp-sutra": {'
  echo '      "type": "http",'
  echo '      "url": "https://shilp-sutra.devalok.in/mcp"'
  echo '    }'
  echo '  }'
  echo '}'
  echo "────────────────────────────────────────────────────────────────────"
  echo "Config file location:"
  echo "  Mac:     ~/Library/Application Support/Claude/claude_desktop_config.json"
  echo "  Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
  echo "  Linux:   ~/.config/Claude/claude_desktop_config.json"
  echo ""
  echo "Restart Claude Desktop after saving."
else
  echo "restart Claude Code (or open a new session) to pick up the skill."
  echo "verify with: ask Claude 'what skills are available?'"
fi
