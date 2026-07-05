# shilp-sutra MCP server — Railway deploy.
# Build context: repo root (Railway root directory setting: /)
# Only this package's files are needed; deps install standalone (no workspace links).
FROM node:22-alpine

WORKDIR /app

COPY packages/mcp-server/package.json ./
# Standalone install — the package has no workspace dependencies.
RUN npm install --omit=dev --no-audit --no-fund

COPY packages/mcp-server/src ./src

ENV NODE_ENV=production
EXPOSE 3111

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3111/health || exit 1

CMD ["node", "src/index.mjs"]
