# Spec: Native blog ("The Journal")

## Objective

Bring the blog inside the Astro portfolio (`/blog`, `/blog/[slug]`) in the existing "Night Press" design (see DESIGN.md, Journal section) so readers stay on a path that ends at Contact. Content is static Markdown for now; the data layer is shaped so a CMS or database can replace it later without touching pages.

## Tech stack

Astro 7 content collections (`glob` loader, zod schema), Tailwind 4, GSAP (ScrollTrigger, Flip, SplitText), Locomotive Scroll v5, `@astrojs/rss`.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Project structure

```
src/content.config.ts        collection + schema (the only place that knows the source)
src/content/blog/*.md        articles (currently sample: true placeholders)
src/lib/blog.ts              the only module that imports astro:content
src/pages/blog/              index.astro, [slug].astro
src/pages/rss.xml.ts         feed
src/components/blog/         masthead, filter, lead, row, title, meta, header, contents, progress, pager
src/js/core/                 scroll (Locomotive + parallax), reveals (lines, fade-in, contact)
src/js/pages/                Home, BlogIndex, BlogPost
```

## Article fields

`title`, `description` (max 200), `pubDate`, `updatedDate?`, `tags[]` (min 1), `cover?` + `coverAlt?`, `draft` (hidden in production), `sample`.

## Moving to a CMS or database later

Replace `glob()` in `src/content.config.ts` with a custom loader returning the same fields and rendering Markdown through the loader context. Pages and components only use `src/lib/blog.ts`. Publishing instantly (without a rebuild) means either a deploy hook on save or an SSR adapter; neither is built yet.

## Boundaries

- Always: follow DESIGN.md (Gold only for interaction, pixel floors, flat at rest); respect `prefers-reduced-motion`; keep content visible without JS (the topic filter is hidden without it).
- Ask first: new dependencies, token changes in DESIGN.md.
- Never: invent metrics or claims in articles; mark real writing as `sample`.

## Success criteria

1. `npm run build` outputs `/blog`, one page per article and `/rss.xml`.
2. Nav "Blog" opens `/blog` in the same tab; the homepage behaves as before.
3. Topic filter reorders with Flip, mirrors `?tag=` in the URL, opens pre-filtered from `?tag=`, and survives rapid clicking.
4. Article reading column is 68ch, body at least 17px; contents list is sticky on wide screens and collapsible on small ones; reading progress fills while scrolling.
5. Reduced motion: no spatial movement; all content visible.
6. Works at 320, 768, 1024 and 1440 widths; keyboard reachable; no console errors.
7. Every article has title, description, canonical, Open Graph/Twitter tags and `BlogPosting` JSON-LD.

## Not doing (yet)

CMS and admin UI, database, comments, search, pagination, MDX components, i18n, migrating posts from the old Nuxt blog.

## Open questions

- Which database or CMS will hold posts (decides the loader and the publish flow)?
- Real articles to replace the five samples.
- Cover images / Open Graph image per article.
