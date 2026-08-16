# Development Guide

A step-by-step walkthrough of how this site is built, how its pieces fit together, and
how to extend it. Written for someone picking up this codebase for the first time.

---

## 1. Tech stack overview

| Layer | Technology |
|---|---|
| Framework | **TanStack Start** (Vite + React 19 + TanStack Router) — SSR, file-based routing, server functions |
| Content | **Sanity** headless CMS (GROQ queries, Portable Text for rich content) |
| Admin auth | **Better Auth** (email/password, single admin account) |
| Database | **PostgreSQL** via **Prisma** (auth sessions + contact form submissions) |
| Styling | Plain CSS custom properties (`src/styles.css`) + Tailwind import for utility classes, no component library |
| Analytics | PostHog (optional, client-side) |

This is **not** Next.js — routing, data loading, and server functions all follow
TanStack Start conventions. If you're coming from Next.js: a TanStack Start "route" is
a file in `src/routes/`, its `loader` is roughly Next's `getServerSideProps`/RSC data
fetching, and `createServerFn` is roughly a Next "server action."

---

## 2. Local setup

```bash
pnpm install
cp .env.local.example .env.local   # fill in values — see DEPLOYMENT.md for what each does
pnpm dev                           # starts on http://localhost:3000
```

Without any Sanity/database env vars set, the site still runs — public pages fall back
to seeded content in `src/lib/sanity/fallback.ts`, and admin/auth features fail closed
(no crash, just inaccessible). This makes local UI work possible with zero external
accounts.

Useful scripts (`package.json`):

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm build       # production build (client + server bundles)
pnpm sanity:dev  # run Sanity Studio locally
pnpm db:studio   # browse the Postgres database via Prisma Studio
```

---

## 3. Project structure

```
src/
  routes/                  # file-based routes — one file per URL (TanStack Router)
    __root.tsx              # <html> shell, header/footer, theme init, error/404 boundaries
    index.tsx                # /
    experience.tsx            # /experience
    skills.tsx                 # /skills
    portfolio.tsx                # /portfolio
    portfolio.$slug.tsx           # /portfolio/:slug
    blog.index.tsx                  # /blog
    blog.$slug.tsx                   # /blog/:slug
    contact.tsx                       # /contact
    login.tsx, _admin.dashboard*.tsx    # admin auth + dashboard (route group)
    api.contact.ts, api.revalidate.ts     # server-only API endpoints
    robots[.]txt.ts, sitemap[.]xml.ts       # generated text/XML responses
  components/               # shared React components (Header, Footer, Site.tsx primitives)
  components/admin/         # dashboard-only components (DocumentEditor, fields, SettingsEditor)
  lib/
    sanity/                  # queries.ts (GROQ), data.functions.ts (reads), mutations.functions.ts (writes),
                              # client.server.ts (Sanity clients), fallback.ts, types.ts
    auth.ts                  # Better Auth instance + session/admin helpers
    server/admin-middleware.ts # server-function middleware enforcing admin-only access
    validations.ts           # Zod schemas shared by admin forms and server-side mutation validation
    root-data.ts             # hooks for reading root-loader data (settings/media) without re-fetching
    page-head.ts, site-url.ts  # shared SEO meta helpers
  styles.css                 # the entire design system — CSS custom properties + one 800px breakpoint
sanity/schemaTypes/          # Sanity content schema (source of truth for the data model)
prisma/                      # Prisma schema (auth tables + ContactSubmission)
```

---

## 4. The data layer

### 4.1 Sanity schema

`sanity/schemaTypes/index.ts` defines every document type: `siteSettings`,
`experience`, `education`, `language`, `skillCategory`, `capability`, `caseStudy`,
`post`. Each uses `defineType`/`defineField` from the `sanity` package.

### 4.2 Reading content

- **`src/lib/sanity/queries.ts`** — every GROQ query as a plain string constant. Always
  bind dynamic values as query parameters (`sanityRead.fetch(query, { slug })`), never
  string-interpolate user input into the query — that's a GROQ injection vector.
- **`src/lib/sanity/data.functions.ts`** — one `createServerFn` per read, wrapping the
  GROQ fetch, falling back to `fallback.ts` content if Sanity isn't configured or the
  request fails, and setting `Cache-Control` via `cachePublic()`.
- **`src/lib/sanity/client.server.ts`** — three clients: `sanityRead` (public,
  published-only), `sanityPreview` (drafts, used for admin preview), `sanityWrite`
  (requires a write token, used by mutations).

### 4.3 Writing content (admin)

- **`src/lib/sanity/mutations.functions.ts`** — every write (`saveContentDocument`,
  `saveSettings`, `deleteDocument`, `reorderDocuments`, `uploadImage`, plus the admin
  list/detail reads) is a `createServerFn` with `.middleware([adminMiddleware])` and a
  Zod `.validator(...)`. **This middleware is the real security boundary** — the
  dashboard's route-level `beforeLoad` check is UX only; server functions reject
  unauthorized callers regardless of how they're called.
- **`src/lib/validations.ts`** — the Zod schemas used both for that server-side
  validation and (ideally — see `audit.md` #3) client-side pre-submit checks.

---

## 5. Routing and data loading

Each route file exports a `Route` from `createFileRoute('/path')({...})` with:

- **`loader`** — runs on the server (and client, on navigation) before the component
  renders; return value is available via `Route.useLoaderData()`.
- **`head`** — returns `{ meta, links, scripts }` merged into `<head>`. Use the shared
  `pageHead({ title, description, path })` helper (`src/lib/page-head.ts`) for standard
  pages — it fills in title/description/OG/Twitter Card/canonical consistently. Pages
  that need OG image data from their own loader (home, blog post) build their `head()`
  manually since `head()` only sees its own route's `loaderData`, not the parent's.
- **`component`** — the page itself, reading `Route.useLoaderData()`.

### Avoid re-fetching root-level data

`__root.tsx`'s loader already fetches `settings` (site-wide config) and `media`
(Sanity CDN config) once per navigation. **Don't re-fetch these in a page loader** just
to display them — read them via the shared hooks instead:

```tsx
import { useSiteSettings, useMediaConfig } from '../lib/root-data'

function Page() {
  const settings = useSiteSettings()  // no extra network round trip
  const media = useMediaConfig()
}
```

Only fetch `settings`/`media` again inside a page's own `loader` if that page's
`head()` function needs them (e.g. for `og:image` — `head()` can't see hooks, only its
own `loaderData`).

### Caching

`router.tsx` sets `defaultStaleTime: 30_000` — loader data for a route is reused for
30s before a revisit re-fetches it. If you add a route with fast-changing data, either
override `staleTime` per-route or accept the 30s window.

---

## 6. The public site, feature by feature

- **Home (`index.tsx`)** — hero (headline/subcopy from `siteSettings`), status board,
  capabilities grid, 3 featured case studies, CTA. Full SEO `head()` (OG image derived
  from `siteSettings.seo.ogImage` via `sanityImageUrl`).
- **Experience (`experience.tsx`)** — timeline + education/languages split section.
- **Skills (`skills.tsx`)** — grouped skill tags.
- **Portfolio (`portfolio.tsx` / `portfolio.$slug.tsx`)** — case study list and detail;
  detail page supports an optional dashboard mock visualization
  (`study.hasSampleDashboard` + `study.dashboardMock`, edited as raw JSON in the admin
  editor).
- **Blog (`blog.index.tsx` / `blog.$slug.tsx`)** — post list and detail; detail page
  supports a `?preview=1` query param (admin-only, gated in the loader) to view an
  unpublished/scheduled draft with a "DRAFT PREVIEW" banner and `noindex` meta.
- **Contact (`contact.tsx`)** — form posts to `api.contact.ts`, which validates with
  Zod, stores to Postgres via Prisma, and falls back to a `mailto:` link if the
  database isn't configured.

All public pages share `Header`/`Footer` from `__root.tsx`'s `shellComponent`, and a
theme-init inline script that applies the saved/system light-dark preference before
React hydrates (avoids a flash of the wrong theme).

---

## 7. The admin dashboard

- **Auth**: `/login` uses Better Auth's email/password sign-in
  (`src/lib/auth-client.ts` client, `src/lib/auth.ts` server instance). Authorization
  is single-admin: `isAdmin()`/`requireAdmin()` compare the session email against
  `process.env.ADMIN_EMAIL` — no roles/permissions system, by design.
- **Dashboard shell**: `_admin.dashboard.tsx` — sidebar nav over the editable content
  types (`editableTypes` in `mutations.functions.ts`).
- **List/detail**: `_admin.dashboard.$section.index.tsx` (list + reorder + delete),
  `_admin.dashboard.$section.$id.tsx` (edit an existing doc or `id: 'new'` to create
  one) → renders `DocumentEditor`.
- **`DocumentEditor.tsx`** — one component handling every content type via a
  `type: EditorType` prop; conditionally renders the right fields per type (title,
  slug, tags, Portable Text body, cover image upload, body image inserter with
  required alt text, etc.), then serializes into the shape each Zod schema expects on
  save.
- **`SettingsEditor`** — the one-off form for the `siteSettings` singleton document.

---

## 8. Styling system

`src/styles.css` is intentionally framework-free (aside from a Tailwind import for
utility classes elsewhere): CSS custom properties define the palette
(`--bg`, `--text`, `--amber`, `--teal`, `--border`, etc.) with a `.dark` class override
for dark mode, toggled by `ThemeToggle.tsx` and applied via the pre-hydration script in
`__root.tsx`.

There is exactly **one** responsive breakpoint, `@media(max-width:800px)`, which
collapses every multi-column grid to a single column and switches the header to a
hamburger menu. When adding a new grid-based layout, add its collapse rule to that same
media query block rather than introducing a new breakpoint, unless you have a specific
reason to.

---

## 9. SEO

- **`src/lib/site-url.ts`** — the canonical production origin (`SITE_URL`) and an
  `absoluteUrl(path)` helper.
- **`src/lib/page-head.ts`** — `pageHead({title, description, path})` for standard
  pages (title, description, OG, Twitter Card, canonical link, all in one call).
- **`robots[.]txt.ts`** / **`sitemap[.]xml.ts`** — generated responses; the sitemap
  pulls dynamic slugs via `getAllSlugs()`/`allSlugsQuery`, which excludes
  scheduled/unpublished posts (case studies have no publish-date concept, only
  Sanity's draft/published document state, which `sanityRead` already excludes).
- JSON-LD (`Person` on home, `BlogPosting` on posts, `Article` on case studies) is
  embedded via each route's `head().scripts`.

---

## 10. Worked example: adding a new content type end-to-end

Say you want a new `testimonial` type (quote, author, role) shown on the home page.

1. **Schema** — add to `sanity/schemaTypes/index.ts`:
   ```ts
   defineType({
     name: 'testimonial',
     type: 'document',
     fields: [
       defineField({ name: 'quote', type: 'text', validation: r => r.required() }),
       defineField({ name: 'author', type: 'string' }),
       defineField({ name: 'role', type: 'string' }),
       defineField({ name: 'order', type: 'number' }),
     ],
   })
   ```
2. **Query** (`src/lib/sanity/queries.ts`):
   ```ts
   export const testimonialsQuery = `*[_type == "testimonial"]|order(order asc){
     _id, _type, quote, author, role, order
   }`
   ```
3. **Read function** (`src/lib/sanity/data.functions.ts`) — a `createServerFn` mirroring
   `getCapabilities()`, with a matching `fallbackTestimonials` array in `fallback.ts`.
4. **Type** — add a `Testimonial` interface to `src/lib/sanity/types.ts`.
5. **Validation schema** — add a Zod shape to `src/lib/validations.ts` for admin writes.
6. **Admin wiring** — add `'testimonial'` to `editableTypes` in
   `mutations.functions.ts`, add a section entry to the dashboard nav lists
   (`_admin.dashboard.tsx`, `_admin.dashboard.index.tsx`,
   `_admin.dashboard.$section.index.tsx`, `_admin.dashboard.$section.$id.tsx` — these
   currently hardcode the type↔label mapping per section, following the
   `education`/`language` pattern), and a `type === 'testimonial'` branch in
   `DocumentEditor.tsx`'s field rendering.
7. **Public rendering** — call the new read function from `index.tsx`'s `loader`, add a
   section to the `Home` component.
8. **Verify**: `pnpm typecheck && pnpm build`, then check the new admin section can
   create/edit/reorder/delete, and the public page renders it.

This same shape (schema → query → read fn → type → validation → admin wiring → public
render) is how every existing content type was built — follow `capability` or
`skillCategory` as the simplest reference implementations.

---

## 11. Quality gates

Run before every commit that touches app code:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm lint` is wired as a build gate (see recent commit history) — CI should fail if it
doesn't pass. There's no automated test suite in this repo yet; manual verification via
`pnpm dev` + curling/clicking through affected routes is the current practice.

---

## 12. Where to go next

- **`audit.md`** — current list of known gaps (missing features, polish items),
  ranked by severity, re-verified each pass.
- **`security.md`** — security-specific findings and hardening recommendations.
- **`DEPLOYMENT.md`** — how to take this from `pnpm dev` to a live Vercel deployment.
