# Spec: Studio CMS for homepage content

Builds on [SPEC-cms-auth.md](SPEC-cms-auth.md) (login, allowlist) and [SPEC-cms.md](SPEC-cms.md) (Journal, rebuild hook).

## Objective

The owner manages everything the homepage lists from `/studio`, without touching code: projects, experience, certifications and contact (email, marquee text, social links). The homepage stays static: it is built from Supabase at build time, exactly like the Journal, and a **Publish site** action in the Studio triggers the Vercel rebuild.

On day one the homepage must look identical: the migration seeds every table with the content that is hardcoded today.

## Assumptions

1. One Supabase project ("Blog", `ntqfybkdhysogsfjkuua`), same `private.is_admin()` and RLS pattern as `posts`.
2. Edits save immediately to the database but reach visitors only on the next rebuild. Studio shows "Unpublished changes" until **Publish site** runs. Any other rebuild (publishing an article, a git push) also ships pending edits; this is accepted, not prevented.
3. Ordering is manual (a `position` column), changed with Move up / Move down buttons. No drag and drop in this iteration.
4. Hiding an item (`visible = false`) is the "draft" state; there is no per-item publish workflow.
5. Design work was dropped from the homepage and the Studio (2026-10-25); `20261025120000_drop_design_works.sql` removes its table.
6. Studio forms are plain HTML forms posting to their own `/studio/...` page (303 redirect + notice), so they work without JS and stay behind the existing middleware. Astro Actions are **not** used: their `/_actions/*` endpoints sit outside `/studio` and would bypass the admin guard.

## Data

All tables: `id uuid pk`, `position int not null`, `visible bool default true`, `created_at`, `updated_at` (trigger). RLS: anon and authenticated read only `visible = true`; admins read and write everything.

| Table | Columns | Homepage use |
| --- | --- | --- |
| `projects` | `title` (≤160), `category` (≤40), `technology` (≤60), `url` (https), `year` int null | Project rows |
| `experiences` | `role`, `organization`, `period` text null (e.g. `2023 — Now`) | Experience list |
| `certifications` | `name`, `issuer` null, `credential_url` null, `year` int null | Certifications list |
| `social_links` | `label` (≤24), `url` (https) | Footer pills |
| `site_settings` | single row (`id = 1` check): `contact_email`, `email_subject`, `email_body`, `marquee_text`, `about`, `availability`, `interests`, `content_changed_at`, `published_at` | Hero About, nav availability, Interests, contact block, publish state |

A statement trigger on every content table (and on `site_settings` contact fields) sets `content_changed_at = now()`, so deletes count as changes too. "Unpublished changes" = `content_changed_at > published_at`.

Build: one generic `tableLoader()` in `src/lib/build-client.ts                     → build-time Supabase client, shared with the Journal loader
src/lib/site-loader.ts                      → build-time loader factory
src/lib/site.ts                             → the only reader of the site collections
src/lib/studio/content.ts                   → section config, zod schemas from field config, notices
src/lib/studio/content-store.ts             → ordering, visibility, delete (+ image cleanup)
src/lib/studio/images.ts                    → byte sniffing (shared with the Journal upload)
src/components/studio/{StudioNav,FormField}.astro
src/pages/studio/[section]/{index,[id]}.astro
src/pages/studio/profile.astro
src/pages/studio/publish.ts                 → rebuild + stamp published_at (form POST)
```

Homepage components (`ProjectsSection`, `Certifications`, `ContactSection`, `FooterPage`) swap their hardcoded arrays for `src/lib/site.ts` reads; their markup stays.

## Boundaries

- Always: validate on the server, keep RLS identical in spirit to `posts`, keep migrations in the repo, run advisors after DDL, keep the homepage visually unchanged by the CMS itself.
- Ask first: new dependencies (none planned), any homepage visual change (see Polish proposals), moving the Journal list off `/studio`.
- Never: service-role key in app code, links to `/studio` from public pages, auto-rebuild on every keystroke.

## Success criteria

1. After the migration, `npm run build` produces a homepage whose HTML content matches today's (same projects, order, links, experience, certifications, contact, socials).
2. Adding, editing, hiding, reordering and deleting an item in each section is reflected after **Publish site** and the rebuild.
3. Hidden rows are not readable with the publishable key (checked with an anon query).
4. A production build without Supabase env fails with a clear message.
5. Invalid input (http URL, missing alt text, bad email) is rejected server-side with the message beside the field; values are kept.
6. Studio works by keyboard only and without JS at 390/820/1440; `/studio/*` keeps `no-store` and `noindex`.
7. Security advisors show nothing new.

## Polish proposals (homepage, need approval)

Found in the current code and the 2026-10-22 critique. Each is independent; none is required for the CMS.

1. **Projects can't be opened on tablets with touch.** `ProjectCard.astro` sets `pointer-events-none` on the title link unless the pointer is fine, and `ProjectLink.astro` hides the "View site" pill above 550px. A touch iPad sees no working link. Fix: the title link works on every pointer; the gold hover swap stays fine-pointer only.
2. **Dated, ledger-style experience.** With the new `period` field, each row reads `Role` in Ash, `Organization` in Boulder below it, and the period right-aligned in 12px, the same grid as the Journal rows. It's more credible for recruiters and easier to scan.
3. **Verifiable certifications.** Show the issuer and year, and make the row a link to the credential when `credential_url` is set (with a small ↗ in Boulder that turns Gold on hover), in line with "every claim points to proof".
4. **Project numbering.** Add a 12px `01 / 08` index beside each project's category label, echoing the Journal's `NO.001`. It gives the long title list a rhythm and a sense of progress, using an existing pattern rather than a new ornament.
5. **Contact on touch.** The "Click to copy" hint is hidden on touch devices (`hidden fine:block`). Add a visible "Write an email" pill under the address on every device, so the mailto link no longer lives only inside the moving marquee.
6. **Social order.** Instagram leads the footer today. With CMS ordering, GitHub and LinkedIn first suits the recruiter audience in PRODUCT.md. This is a content change you can make yourself in the Studio.

## Decisions (2026-10-25)

1. About, availability and Interests are editable (`/studio/profile`).
2. All six polish proposals ship with this work. Socials are seeded in the new order (GitHub, LinkedIn, Instagram, iCodeThis).
3. Rebuild only through **Publish site**.


## Verification done (2026-10-25)

- Migration applied to the Supabase project (named "Blog", which cannot be renamed from the repo); security advisors show nothing new (only the existing leaked-password notice). Policies and triggers checked on all six tables.
- Production build from Supabase: homepage text and links match the pre-CMS build except the approved polish (numbering, experience layout, "Write an email", social order).
- Studio exercised end to end over HTTP against the real routes and middleware with an in-memory Supabase stand-in: list, add, validation (https, year, email, alt text, fake image bytes), edit, move, hide/show, two-step delete without JS, image upload/remove, profile, Publish site (deploy hook called once, open-redirect `next` values fall back to /studio), cross-origin POST rejected, UTF-8 round trip.
- Screenshots at 390 (true device width via CDP), 820 and 1440.
- Not yet run: a write attempt as `anon` against the live database (declined during the session), and a pass with the real admin session.

## Change: design work removed (2026-10-25)

The Design work section and its Studio section were removed; the Experience section was rebuilt as a ledger to take its place, and a branded 404 page was added. Apply `supabase/migrations/20261025120000_drop_design_works.sql` to drop the unused table (it held only the three seeded rows and no stored images). `20261025130000_rename_blog_media_to_journal_media.sql` renames the empty Storage bucket to `journal-media` to match the code (`MEDIA_BUCKET` in `src/lib/studio/rules.ts`); apply it before uploading cover or body images.

## Not included

Drag-and-drop ordering, revision history, scheduled publishing, case-study pages per project, multiple admins, live deploy status.
