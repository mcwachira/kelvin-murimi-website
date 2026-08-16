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

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate \
 && pnpm generate-routes \
 && pnpm build

# ---------------------------------------------------------------------------
# production runtime — no dev tooling, no Sanity Studio, no Prisma CLI
# ---------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY server-entry.mjs ./

EXPOSE 3000
CMD ["node", "server-entry.mjs"]
