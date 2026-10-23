# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: hiring managers and recruiters** evaluating Angga for full-time or contract roles. They skim the site to judge range, seniority and credibility, then decide whether to reach out.
- **Secondary: freelance clients** (businesses, founders, organizations) deciding whether to commission a project.

Both audiences should leave knowing what Angga builds and how to contact him. Contact is the main goal.

## Product Purpose

The personal portfolio of Angga Widiarta, a developer based in Lombok, Indonesia. It presents his work, experience and credentials, and gets qualified people to make contact. Angga is currently **open to work**.

## Positioning

**Fullstack developer**, no longer front-end only. Angga now has hands-on backend experience and experience in system architecture, alongside his front-end craft and a data background (Azure AI and Data fundamentals, Google Analytics).

Confirmed wording: the hero reads "FULL —— STACK / DEVELOPER" ("FULL — / STACK / DEVELOPER" on phones), and the nav availability line reads "Open to full-time & freelance work".

## Operating Context

- Visitors usually arrive from a resume, LinkedIn, GitHub or a direct referral link, and decide fairly quickly.
- Conversion is a `mailto:` link (ContactSection) plus social profiles in the footer: Instagram, GitHub, LinkedIn, iCodeThis.

## Capabilities and Constraints

- Single-page Astro site (`src/pages/index.astro`) with sections: hero, project list, design work, experience and certifications, contact, footer.
- **Journal** (`/blog`, `/blog/[slug]`): a native blog, static for now. Articles are written in the Studio and stored in Supabase, then read through `src/lib/blog.ts` at build time. It ends in the same contact marquee and footer. The five imported sample articles are drafts (`sample: true`); publish or replace them before promoting the Journal.
- **Studio** (`/studio/login`, `/studio`, `/studio/posts/[id]`): a private, server-rendered CMS behind Supabase Auth (email and password, single admin on the `admins` allowlist). Articles live in the `posts` table; the public Journal is built from published rows at build time, and publishing triggers a Vercel Deploy Hook rebuild. It is an Operate surface, not linked from any public page, and always `noindex`, `no-store` and free of analytics. The rest of the site stays static.
- Stack: Astro 7 and Tailwind 4, with no UI framework runtime. Motion uses GSAP and Locomotive Scroll plus CSS, and respects `prefers-reduced-motion`.
- **English only.** No localized version is planned.

## Brand Commitments

- Name: Angga Widiarta. Location: Lombok, Indonesia. Both are part of his identity on the site.
- Custom font files on hand: Open Sauce (regular and medium) in `src/fonts/`. These are an existing asset, not a binding visual choice.

## Evidence on Hand

- **Experience** (`src/components/Certifications.astro`): Fullstack Web Developer at CV Mataram Medika; Software Developer at PT Oxindo Solution; Frontend Developer at Inside Lombok; Fullstack Web Developer at Jalan Digital; Fullstack Web Developer at the Immigration Office of Mataram; Assistant Lecturer at the University of Mataram.
- **Certifications**: Solid Programming Principles; Specialized Google Analytics Data; AI-900; DP-900; PL-900.
- **Projects** (`src/components/templates/ProjectsSection.astro`, `DesignWork.astro`): Inside UMKM (Next.js and Laravel), Absence App (CodeIgniter), SPA booking system (Laravel), Inventory system (Laravel), a machine-learning project, plus UI/design pieces: Toko Sepatu, Trip In Lombok, and a Figma motorcycle concept. Live links are in the source.
- **Case studies:** Angga says real case-study material exists. It is not in the repo yet, so ask for it before writing any case-study content. Never invent metrics, client quotes, testimonials or outcomes.

## Product Principles

1. **Lead with fullstack range.** Backend, architecture and data work should be as visible as front-end polish.
2. **Show real, verifiable work.** Every claim points to a live link, a repo or a named employer.
3. **Make contact effortless.** An open-to-work visitor should always be one step away from getting in touch.
4. **Craft is part of the proof.** For a developer, the site's own quality and performance count as evidence, so motion must never cost load speed or readability.
