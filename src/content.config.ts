import { defineCollection } from "astro:content";
import { postsLoader } from "./lib/journal-loader";
import { tableLoader } from "./lib/site-loader";
import { z } from "astro/zod";

// Articles live in Supabase (written from the Studio) and are loaded at build time
// by postsLoader, so the public site stays static. No page or component reads this
// collection directly; everything goes through src/lib/journal.ts.
const journal = defineCollection({
  loader: postsLoader(),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().max(200),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).min(1),
      cover: z.string().url().optional(),
      coverAlt: z.string().optional(),
      // Placeholder content written to exercise the layout.
      sample: z.boolean().default(false),
    }),
});

// Homepage content, also edited in the Studio. Read only through src/lib/site.ts.
const ordered = { position: z.number().int() };

const projects = defineCollection({
  loader: tableLoader("projects", "id,position,title,category,technology,url,year"),
  schema: z.object({
    ...ordered,
    title: z.string(),
    category: z.string(),
    technology: z.string(),
    url: z.url(),
    year: z.number().int().nullable(),
  }),
});

const experiences = defineCollection({
  loader: tableLoader("experiences", "id,position,role,organization,period"),
  schema: z.object({
    ...ordered,
    role: z.string(),
    organization: z.string(),
    period: z.string().nullable(),
  }),
});

const certifications = defineCollection({
  loader: tableLoader("certifications", "id,position,name,issuer,credential_url,year"),
  schema: z.object({
    ...ordered,
    name: z.string(),
    issuer: z.string().nullable(),
    credential_url: z.url().nullable(),
    year: z.number().int().nullable(),
  }),
});

const socials = defineCollection({
  loader: tableLoader("social_links", "id,position,label,url"),
  schema: z.object({ ...ordered, label: z.string(), url: z.url() }),
});

const settings = defineCollection({
  loader: tableLoader(
    "site_settings",
    "id,about,availability,interests,contact_email,email_subject,email_body,marquee_text",
  ),
  schema: z.object({
    about: z.string(),
    availability: z.string(),
    interests: z.string(),
    contact_email: z.string(),
    email_subject: z.string(),
    email_body: z.string(),
    marquee_text: z.string(),
  }),
});

export const collections = {
  journal,
  projects,
  experiences,
  certifications,
  socials,
  settings,
};
