# Kelvin Murimi — Portfolio & Field Notes

The personal site and content platform for **Kelvin Murimi**, a Nairobi-based
Monitoring, Evaluation & Learning (MEL) and Business Intelligence professional.
It showcases his experience, skills, and case studies from humanitarian, public
health, and agricultural development work, alongside a blog and a
contact channel — all backed by a private CMS dashboard for managing content
without touching code.

**Live site:** [kelvinmurimi.com](https://kelvinmurimi.com)

---

## What it does

- **Public site** — home, experience timeline, skills, portfolio case studies,
  blog, and a contact form.
- **Admin dashboard** (`/dashboard`, single admin account) — create/edit/publish
  every content type, manage drafts and scheduled posts, upload images with
  required alt text, and read contact-form submissions in a built-in inbox.
- **Content-managed, not hardcoded** — every piece of text, project, and post
  lives in Sanity, editable through the dashboard or Sanity Studio directly.
- **SEO-conscious** — canonical URLs, Open Graph/Twitter Card metadata,
  structured data (JSON-LD), a dynamic sitemap, and `robots.txt` all generated
  from live content.
- **Themeable** — light/dark mode with a system-preference default and no
  flash-of-wrong-theme on load.

---

## Built with

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (Vite + React 19 + TanStack Router), TypeScript |
| Content | [Sanity](https://www.sanity.io/) headless CMS, Portable Text, GROQ |
| Auth | [Better Auth](https://www.better-auth.com/) (single-admin, email/password) |
| Database | PostgreSQL via [Prisma](https://www.prisma.io/) (driver adapters, no native engine binary) |
| Styling | Hand-written CSS design system (custom properties, light/dark themes) + Tailwind utilities |
| Data fetching | TanStack Query, server functions |
| Analytics | [PostHog](https://posthog.com/) (optional) |
| Hosting | [Vercel](https://vercel.com/) or self-hosted via Docker |
| CI/CD | GitHub Actions — typecheck, lint, build, and a Docker image build on every push/PR |

---

## Project structure

```
src/
  routes/            # file-based routes (TanStack Router) — public pages, admin dashboard, API endpoints
  components/         # shared UI components
  components/admin/    # dashboard-only editor components
  lib/sanity/            # GROQ queries, data-fetching and mutation server functions, Sanity clients
  lib/auth.ts               # Better Auth instance and session/admin helpers
  styles.css                  # the site's design system
sanity/schemaTypes/    # Sanity content schema
prisma/                  # database schema (auth + contact form storage)
```

See **`development.md`** for a full architecture walkthrough and a guide to
extending the content model.

---

## Local development

Requires Node 24.x and pnpm.

```bash
pnpm install
cp .env.local.example .env.local   # fill in Sanity/database/auth values
docker compose up -d                # local Postgres container
pnpm db:push                        # create the database schema
pnpm admin:create                   # create your local admin account
pnpm dev                            # http://localhost:3000
```

Without any environment variables set, the public site still runs — pages fall
back to seeded content, and admin/auth features stay safely inaccessible
rather than erroring.

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm build       # production build
```

---

## Deployment

Two supported paths — **Docker** (self-hosted, connects to a Supabase
Postgres database) or **Vercel** (serverless). Full step-by-step instructions,
environment variable reference, and a post-deploy checklist are in
**`DEPLOYMENT.md`**.

---

## Content model

Every content type (case studies, blog posts, experience, education,
languages, skill groups, capabilities, and site-wide settings) is defined as a
Sanity schema and editable through `/dashboard`. Drafts stay private until
published; scheduled blog posts go live automatically at their publish date
and are excluded from the sitemap until then.
