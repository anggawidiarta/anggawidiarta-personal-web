import { defineCollection } from "astro:content";
import { postsLoader } from "./lib/blog-loader";
import { z } from "astro/zod";

// Articles live in Supabase (written from the Studio) and are loaded at build time
// by postsLoader, so the public site stays static. No page or component reads this
// collection directly; everything goes through src/lib/blog.ts.
const blog = defineCollection({
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

export const collections = { blog };
