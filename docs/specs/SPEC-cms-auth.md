# Spec: Login + admin shell for the blog CMS

## Objective

The site owner signs in at a hidden URL (`/studio/login`), lands on `/studio`, and can sign out. Anyone else cannot reach `/studio/*` and cannot create an account. This iteration is the foundation only; the article editor, a `posts` table and image upload come next.

## Tech stack

Astro 7 (`output: "static"`, admin routes opt out with `prerender = false`), `@astrojs/vercel` ^11, `@supabase/ssr` ^0.12, `@supabase/supabase-js` ^2.118, `astro:env`. Hosting: Vercel. Database/Auth: Supabase project "Blog" (`ntqfybkdhysogsfjkuua`). Login: email + password, public signup disabled.

## Commands

```
Dev:     npm run dev
Build:   npm run build
Preview: npm run preview
```

No test runner; verification is curl + headless Chrome (see Success criteria).

## Project structure

```
supabase/migrations/        → SQL applied to the Blog project (kept in the repo)
src/lib/supabase/server.ts  → createClient(cookies): httpOnly, secure in prod, sameSite lax
src/middleware.ts           → guards /studio/*, getClaims(), admin check, no-store/noindex headers
src/layout/StudioLayout.astro
src/pages/studio/{login.astro,index.astro,logout.ts}
.env.example                → PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Code style

Match the repo: Astro components with Tailwind utility classes from `src/utils/classes.ts`, `cn()` for merging, TypeScript in `src/lib`.

## Testing strategy

Manual + scripted: curl for redirects/headers/cookies, headless Chrome screenshots at 390/820/1440, Tab-only walkthrough, Supabase `get_advisors(security)` after every DDL change.

## Boundaries

- Always: validate input on the server, protect pages with `getClaims()` (never `getSession()`), keep migrations in the repo, check advisors after DDL.
- Ask first: dependencies beyond the three above, touching public pages other than the `noindex` prop.
- Never: service-role key in app code or `.env`, secrets in the repo, links to `/studio` from public pages, public signup, a `robots.txt` Disallow for `/studio`.

## Success criteria

1. `npm run build` passes; public pages stay static and unchanged; `/studio/*` become server functions.
2. No cookie: `GET /studio` returns 302 to `/studio/login`.
3. Wrong credentials: 200 with a generic message and no session cookie. Admin credentials: 302 to `/studio` with an httpOnly cookie. A non-admin user is rejected and signed out.
4. `/studio/*` responses carry `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`; the login HTML has `noindex` and no GA/Partytown.
5. Sign out clears the cookie and `/studio` redirects to login again.
6. Security advisors are clean and anon `signUp` is rejected.
7. Usable by keyboard only, without JS, at 390/820/1440.

## Deployment notes

- Vercel env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key only).
- Supabase: public signup must be disabled (Authentication > Sign In / Providers). Verify with `GET /auth/v1/settings` (`disable_signup: true`).
- Session checks use `auth.getUser()` (not `getClaims()`) so a signed-out cookie is rejected immediately. Login verifies the password and the allowlist on a cookie-less client and only then writes the session cookie, so a non-admin never receives one.
- `npm audit` reports a ReDoS in `path-to-regexp` through `@astrojs/vercel` (build-time routing only); the suggested fix downgrades the adapter and is not compatible with Astro 7.

## Open questions

None blocking. The path name `/studio` can be changed by renaming `src/pages/studio/`.
