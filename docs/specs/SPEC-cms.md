# Spec: Studio CMS for the Journal

Builds on [SPEC-cms-auth.md](SPEC-cms-auth.md) (login, allowlist, hidden `/studio`).

## Objective

The owner writes, edits, publishes and deletes Journal articles from `/studio`. The public site stays static: it is built from published rows in Supabase, and publishing triggers a Vercel Deploy Hook rebuild.

## Data

- `public.posts`: `slug` (unique, `^[a-z0-9]+(-[a-z0-9]+)*$`), `title`, `description` (≤200), `body` (Markdown), `tags text[]`, `cover_path`, `cover_alt`, `status` (`draft` | `published`), `published_at` (required when published), `sample`, timestamps (`updated_at` by trigger).
- RLS: anon reads only `status = 'published'`; authenticated reads published or, for admins, everything; only `private.is_admin()` can insert, update, delete.
- Storage bucket `blog-media` (public read by URL, no anon listing): jpeg, png, webp, avif, gif up to 4 MB; only admins write. Paths: `covers/<post id>/<uuid>.<ext>`, `body/<post id>/<uuid>.<ext>`.
- The public build reads published rows through `src/lib/blog-loader.ts` (publishable key, so RLS applies). A missing key or a Supabase error fails a production build instead of deploying an empty blog.

## Studio API (all under `/studio/api`, admin only, JSON)

| Request | Behaviour |
| --- | --- |
| `PATCH posts/[id]` | Partial save, strict schema. Drafts save freely (autosave). A published article needs `live: true`, otherwise 409. Slug clash 409. Published + `live` triggers a rebuild. |
| `DELETE posts/[id]` | Deletes the row and its images; rebuilds if it was published. |
| `POST posts/[id]/publish` | Requires title, description, content, a tag and (with a cover) alt text; else 422. Keeps an existing `published_at`. Rebuilds. |
| `POST posts/[id]/unpublish` | Back to draft; rebuilds. |
| `POST upload` | `multipart/form-data` (`file`, `kind` cover|body, `postId`). Format is detected from the bytes, not the declared type. 4 MB limit. |
| `POST /studio/posts/new` | Creates an empty draft and redirects to the editor (works without JS). |

Without a session the API answers 401 JSON; any non-GET request must carry a matching `Origin` (403 otherwise). Rebuild results are `triggered`, `skipped` (no hook configured) or `failed` and are shown to the author.

## Rules worth keeping

- Autosave is for drafts only. A live article is edited with an explicit **Update live**, so a rebuild never publishes half-finished edits.
- Article numbers (`NO.001`) follow the order of published dates among published articles, so publishing or unpublishing can renumber the others. URLs (slugs) never change.
- Changing the slug of a published article breaks its existing link (the editor warns; no redirects yet).
- Preview uses `marked` and is not syntax-highlighted; the published page uses Shiki. Content is written by the admin and is not sanitised.

## Configuration

- Env: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional `VERCEL_DEPLOY_HOOK_URL` (secret).
- Content changes need a rebuild; in local dev, restart the dev server to reload published articles.

## Verification done

- RLS: anon cannot write posts or upload; `is_admin` is not exposed; advisors clean except leaked-password protection (an Auth setting) and a harmless multiple-policy performance notice on `posts` SELECT.
- Render parity: a published article built from the database matches the former Markdown render (headings, TOC, Shiki, JSON-LD).
- API and editor were exercised end to end in a browser against the real routes and middleware with an in-memory Supabase stand-in (validation, slug conflicts, autosave, live rule, publish gating, uploads, two-step delete). The real Supabase path with a signed-in admin still needs a manual pass by the owner.

## Not included

Scheduled publishing, revision history, full-page draft preview, slug redirects, multiple admins, live deploy status.
