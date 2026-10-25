# The Journal

## Problem statement

How might the portfolio host Angga's writing as proof of fullstack range, without sending readers to a separate site and away from Contact?

## Recommended direction

A journal inside the same Astro site, designed as the "Night Press" printed as a journal: a monumental masthead, a lead story, and ruled rows (the same grammar as the project list). Reading pages keep a calm 68ch column; the world lives in the frame. Data is Markdown behind a single helper module so the source can change to a CMS or database later.

## Key assumptions to validate

- [ ] Recruiters and clients read technical posts. Track article views and contact clicks per article in Google Analytics.
- [ ] Markdown is enough until the database is chosen. Revisit when the CMS decision is made.
- [ ] Five sample articles are representative of real length and elements (code, lists, quotes, images).

## MVP scope

In: index with lead and ruled rows, topic filter with Flip, article pages with contents list, reading progress, prev/next, RSS, SEO meta and JSON-LD, GSAP motion with reduced-motion fallback.
Out: anything needing a backend.

## Not doing

- CMS or admin UI: the database is not chosen yet.
- Comments and likes: need a backend and do not serve the contact goal.
- Search: too few articles; the topic filter is enough.
- Pagination: not needed under about 20 articles.
- MDX components: no article needs them yet.
- Migrating the old Nuxt blog: samples chosen for now.

## Open questions

- Which database or CMS?
- When do the sample articles get replaced with real ones?
