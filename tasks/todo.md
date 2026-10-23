# Tasks: Login + admin shell

- [x] T0 Save spec, plan and task list
- [x] T1 Adapter + env (`@astrojs/vercel`, Supabase packages, `astro:env`, `.env.example`). Verify: `npm run build`, public pages unchanged
- [x] T2 Migration `admins` + `private.is_admin()` (moved out of the API schema after an advisor WARN); admin row still pending the manual user creation. Verify: RLS on, advisors clean, anon cannot call `is_admin()`

## Checkpoint A: build green, database correct, advisors clean

- [x] T3 Server client + middleware + `Astro.locals` types. Verify: `curl -i /studio` gives 302 + no-store/noindex; `/` and `/blog` untouched
- [x] T4 `StudioLayout` (+ `noindex` prop) and login page. Verify: generic error, httpOnly cookie, no GA, works without JS
- [x] T5 Dashboard + logout. Verify: sign out clears the cookie and `/studio` redirects

## Checkpoint B: login → dashboard → logout end to end

Unauthenticated paths verified (302 + no-store/noindex, generic error, no cookie, cross-origin POST 403). Signed-in path verified with temporary accounts: admin login → 303 + httpOnly cookie, dashboard, logout clears the cookie, a replayed cookie is rejected, a non-admin receives no cookie.

- [x] T6 (partly done: non-admin, replay, keyboard, screenshots, detector. Open: delete test accounts, disable public signup) Hardening: non-admin and signup rejected, advisors, screenshots 390/820/1440, keyboard, `impeccable detect`, PRODUCT.md + README notes

## Checkpoint C: ready to deploy to Vercel


# Iteration 2: Studio CMS + sign-in polish

Plan: see the approved plan (publish = Vercel deploy hook, Markdown editor with preview, samples imported as drafts, inline image upload, autosave).

- [x] T1 Polish sign-in (error mapping, busy state, Show/Hide, Caps Lock, autofill, focus, wayfinding)
- [x] T2 Migration `posts` + `blog-media` bucket + RLS (anon cannot write; policies merge declined, harmless perf warning)
- [x] T3 Database loader + import samples as drafts + remove Markdown
- [x] T4 Middleware 401/Origin + posts API (verified by curl)
- [x] T5 Article list at /studio
- [x] T6 Editor fields + save
- [x] T7 Editor client: autosave, preview, slug, tags
- [x] T8 Uploads (cover + inline)
- [x] T9 Publish / unpublish / update live + deploy hook
- [x] T10 Hardening + docs

Checkpoints: A (database + loader) and B (editor flows) verified against a Supabase stand-in; the signed-in path on the real project still needs a manual pass by the owner. Open items for the owner: disable public signup, create the Vercel Deploy Hook and set `VERCEL_DEPLOY_HOOK_URL`.
