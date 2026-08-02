<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Durable project context

- Scaffold command: `npx @tanstack/cli@latest create my-tanstack-app --agent --package-manager pnpm --tailwind --add-ons form,shadcn,table,tanstack-query,better-auth,prisma,posthog` (run in `/tmp/kelvin-tanstack-retry.jqlWto`; `--tailwind` was deprecated/ignored because Tailwind is standard).
- Intent commands run: `npx @tanstack/intent@latest install`, `npx @tanstack/intent@latest list`; guidance loaded for Start core, Router core, server functions/routes, auth primitives/guards, and deployment.
- Stack: TanStack Start + React 19 + strict TypeScript + Tailwind 4, TanStack Form/Table/Query, shadcn config, Better Auth, Prisma/PostgreSQL, PostHog, Sanity.
- Architecture: file routes in `src/routes`; loaders are isomorphic, so secrets and Sanity writes belong only in server functions/server routes. Route guards are UX only—every mutation must independently verify a Better Auth session and `ADMIN_EMAIL`.
- Content: Sanity is the editorial source of truth. Prisma is only for auth/contact operational data. Draft IDs remain private until explicit publishing.
- Theme: CSS variables in `src/styles.css`; the inline script in `__root.tsx` must stay before hydration to prevent theme flash.
- Deployment: Vercel target. Add secrets from `.env.example`; configure the Sanity webhook for cache invalidation without redeploy.
- Known gotchas: pnpm 11 warns that the generated `package.json#pnpm.onlyBuiltDependencies` location is obsolete and blocks `core-js` scripts. The initial CLI dependency spinner was interrupted after files were generated, then dependencies were installed in the actual workspace.
- Next: finish Better Auth database adapter/session middleware, enable fail-closed Sanity mutations, add asset uploads/Portable Text editor/draft preview, and connect public loaders to GROQ with seeded fallbacks.
