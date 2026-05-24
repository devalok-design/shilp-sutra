# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for the shilp-sutra marketing/docs site.
# Build context: repo root.
# Build:  docker build -f apps/site/Dockerfile -t shilp-sutra-site .
# Run:    docker run -p 3000:3000 shilp-sutra-site

# ─── Stage 1: deps + build ─────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /repo

# pnpm via corepack — pinned in pnpm-lock.yaml via packageManager field
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfile + workspace manifests first for better layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/brand/package.json packages/brand/package.json
COPY apps/site/package.json apps/site/package.json
COPY .changeset/ .changeset/

RUN pnpm install --frozen-lockfile

# Full source after deps so source edits don't bust install layer
COPY . .

# Build DS (site needs dist/) then site
RUN pnpm -F @devalok/shilp-sutra-brand build || true
RUN pnpm -F @devalok/shilp-sutra build
RUN pnpm -F site build

# ─── Stage 2: minimal runtime ───────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output bundles everything site needs into one tree
COPY --from=builder --chown=nextjs:nodejs /repo/apps/site/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/site/.next/static ./apps/site/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/site/public ./apps/site/public

# Recipes + docs are read at request time from packages/core/docs/components
# and packages/core/docs/recipes. Standalone tracing should include them via
# outputFileTracingRoot, but copy explicitly as a belt-and-suspenders backup.
COPY --from=builder --chown=nextjs:nodejs /repo/packages/core/docs ./packages/core/docs

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/site/server.js"]
