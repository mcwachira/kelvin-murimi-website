# Kelvin Murimi portfolio

A TanStack Start portfolio and content dashboard for a Nairobi-based Monitoring, Evaluation & Learning and Business Intelligence professional. The public site currently includes seeded fallback content; Sanity is the intended source of truth once environment variables are supplied.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The project was generated from the requested TanStack CLI dashboard stack. It retains TanStack Form, Table, Query, shadcn configuration, Better Auth, Prisma, PostHog and Tailwind.

## Environment

- `SANITY_PROJECT_ID`, `SANITY_DATASET`: public read configuration.
- `SANITY_API_WRITE_TOKEN`: server-only editor token. Never use a `VITE_` prefix.
- `SANITY_REVALIDATE_SECRET`: verifies Sanity webhook calls.
- `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`: fallback Studio configuration.
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`: dashboard sessions.
- `ADMIN_EMAIL`: the only email allowed into the admin area.
- `DATABASE_URL`: PostgreSQL for Better Auth and contact submissions.
- `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`: optional browser analytics.
- `PUBLIC_SITE_URL`: canonical URL for sitemap and previews.

## Content and publishing

Schemas live in `sanity/schemaTypes`. Draft documents use Sanity's `drafts.*` IDs and must be explicitly published before public queries can return them. The write token is imported only from `.server.ts` code. The dashboard mutation boundary is intentionally fail-closed until Better Auth persistence and the single-admin bootstrap are configured.

Run fallback Studio with `pnpm sanity:dev`. Configure a Sanity webhook targeting `/api/revalidate` with `SANITY_REVALIDATE_SECRET`; on Vercel, purge the tagged/cache-controlled content response so edits appear without a redeploy.

## Follow-up setup

1. Create a Sanity project/dataset and fill `.env.local`.
2. Create PostgreSQL, run `pnpm db:generate` and `pnpm db:push`.
3. Bootstrap exactly one Better Auth user matching `ADMIN_EMAIL`, then enable dashboard mutation handlers.
4. Replace placeholder contact details and import/seed the sample content.
5. Add a Vercel project using `pnpm build`; configure all server secrets there.

The pre-hydration script in `src/routes/__root.tsx` applies the saved/system theme before React hydrates, preventing a wrong-theme flash.
