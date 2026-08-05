# Build context MUST be the monorepo root, not apps/web — this app shares a root
# package-lock.json and a root prisma/schema.prisma with the rest of the workspace.
# Build from repo root with:
#   docker build -f apps/web/Dockerfile -t clock-in-out-web .

# Debian-based (glibc), not Alpine (musl) — @libsql's native binding has been
# unreliable under musl/QEMU cross-platform builds; glibc avoids that class of issue.
#
# --platform=linux/amd64 is pinned explicitly: App Runner only runs x86_64, and
# building on an Apple Silicon machine without this defaults to arm64, producing
# an image that can't even exec on the service (no app logs at all, just a health
# check timeout — that's what an arch-mismatched image looks like from outside).
FROM --platform=linux/amd64 node:20-slim AS base

# node:20-slim (Debian 12/bookworm) ships with no OpenSSL at all. Without it,
# `prisma generate` (in the builder stage below) can't detect a version and
# silently guesses the wrong engine binary (openssl-1.1.x), which then fails to
# load at runtime with "libssl.so.1.1: cannot open shared object file". Installing
# openssl here (bookworm's is 3.x) lets Prisma detect and target it correctly.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ---- deps: install once, cached unless lockfile/package.json changes ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
# packages/ui and packages/utils (declared in root package.json's workspaces glob)
# are currently empty placeholder dirs with no package.json in either -- git doesn't
# track empty directories, so `packages/` doesn't exist at all after a fresh clone
# (e.g. CI's checkout), even though it's present locally if you've ever mkdir'd it.
# npm silently skips them either way since they have no package.json to resolve as
# a workspace. If real content ever lands in either, add `COPY packages ./packages`
# back here.
RUN npm ci

# ---- build: compile the web app ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# npm workspaces also creates a per-workspace node_modules/.bin symlink dir
# (e.g. apps/web/node_modules/.bin/next) distinct from the hoisted root one.
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
# apps/web/src/lib/auth.ts throws at import time if JWT_SECRET is unset, and
# `next build`'s page-data collection imports it. This placeholder only needs
# to be non-empty to get past that build-time check — it is NOT baked into the
# runtime image (this ENV doesn't carry into the runner stage below). The real
# secret is supplied as a runtime env var by App Runner.
ENV JWT_SECRET=build-time-placeholder-not-used-at-runtime
RUN npm run build --workspace=apps/web

# ---- runtime: minimal image, only the standalone output ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
