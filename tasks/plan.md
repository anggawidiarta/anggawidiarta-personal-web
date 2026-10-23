# Implementation plan: Login + admin shell

Spec: [docs/specs/SPEC-cms-auth.md](../docs/specs/SPEC-cms-auth.md). Task checklist: [todo.md](todo.md).

## Architecture decisions

- Public pages stay static; only `/studio/*` runs on the server, so the public blog never depends on Supabase being awake.
- No Supabase client in the browser. Auth is a plain form POST plus httpOnly cookies, so it works without JS.
- Authorization is an allowlist table (`public.admins`) plus `is_admin()`, reused later by RLS policies on `posts`.
- "Hidden URL" is cosmetic. Real protection: Supabase Auth, allowlist, RLS, signup disabled.

## Order

T1 adapter/env → T2 database → checkpoint A → T3 client/middleware → T4 login → T5 dashboard/logout → checkpoint B → T6 hardening → checkpoint C.

## Manual steps (not possible through MCP)

1. Supabase Dashboard → Authentication → disable "Allow new users to sign up".
2. Authentication → Users → add the admin user (auto-confirm).
3. Vercel → Environment Variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key, never service role).

## Risks

| Risk | Mitigation |
|---|---|
| Session cached by the CDN | `no-store` plus Supabase `setAll` headers on every `/studio/*` response |
| Public signup left enabled | Manual step 1, anon `signUp` test, allowlist still rejects |
| Middleware turning public pages dynamic | Guard only `/studio`; inspect `dist/` |
