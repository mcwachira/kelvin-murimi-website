Vercel deployment checklist

This repository builds locally with pnpm and Vite. If Vercel build fails, follow these steps:

1. Ensure Vercel uses pnpm
   - Project Settings > General > Install Command: `pnpm install`
   - Ensure pnpm-lock.yaml is committed (it exists in this repo).

2. Set Build Command
   - Build Command: `pnpm run build`
   - Output Directory: leave default (Vercel will detect serverless functions from `dist/server` for this Start app)

3. Node version
   - Project Settings > General > Node.js Version: set to 18.x
   - package.json contains `engines.node` = 18.x to guide selection

4. Environment variables (at least for build/SSR)
   - SANITY_PROJECT_ID (optional, but recommended)
   - SANITY_DATASET (default: production)
   - PUBLIC_SITE_URL (e.g. https://yourdomain.com)
   - If using admin or database features, also set:
     - BETTER_AUTH_URL, BETTER_AUTH_SECRET, ADMIN_EMAIL
     - DATABASE_URL (for Prisma)
     - VERCEL_PURGE_TOKEN (if using revalidate endpoint)
   - Use Vercel > Project > Settings > Environment Variables

5. Prisma
   - The repo runs `prisma generate` in `postinstall` (safe fallback). If you need migrations at deploy time, add `prisma migrate deploy` in a prebuild step and ensure DATABASE_URL is set.

6. Common build-time errors
   - "Command failed with exit code" due to wrong package manager: switch Install Command to `pnpm install`
   - Prisma "query engine" or native binary errors: ensure DATABASE_URL is set and Prisma client was generated; run `pnpm prisma generate` locally to verify.
   - Missing env at build: some server-side code may read process.env during build/SSR; provide necessary envs in Vercel.

7. Debugging steps
   - Run locally the exact commands Vercel runs:
     rm -rf node_modules dist && pnpm install --frozen-lockfile && NODE_ENV=production pnpm run build
   - If that succeeds, copy the failing Vercel log and paste here.

If you share the Vercel build log (the failing lines), paste them and I will diagnose the exact failure and provide a targeted fix.
