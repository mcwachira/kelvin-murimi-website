# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps + build
# ---------------------------------------------------------------------------
FROM base AS builder

# Build-time-only placeholder — prisma.config.ts requires DATABASE_URL to be
# defined to run `prisma generate`, but generate doesn't connect to it. The
# real value is supplied to the *runtime* container instead (see
# docker-compose.prod.yml), never baked into image layers.
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate \
 && pnpm generate-routes \
 && pnpm build

# ---------------------------------------------------------------------------
# production runtime — Nitro's node-server output (.output/) is
# self-contained: every dependency is either bundled into its .mjs chunks or
# vendored into .output/server/node_modules (only @prisma/client needs
# this, since its runtime code generation can't be safely inlined). No
# package manager, install step, or node_modules copy needed here at all.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
