import type { Loader } from "astro/loaders";
import { buildClient } from "./build-client";
import { mediaUrl } from "./studio/rules";

const DAY = 24 * 60 * 60 * 1000;

interface PostRow {
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  cover_path: string | null;
  cover_alt: string | null;
  published_at: string;
  updated_at: string;
  sample: boolean;
}

/**
 * Loads published posts from Supabase at build time (the public site stays static).
 * Row-level security already limits the publishable key to `status = 'published'`.
 */
export function postsLoader(): Loader {
  return {
    name: "supabase-posts",
    async load(context) {
      const { store, logger } = context;
      const client = buildClient(logger, "the Journal");
      if (!client) {
        store.clear();
        return;
      }
      const { supabase, url } = client;

      const { data, error } = await supabase
        .from("posts")
        .select(
          "slug,title,description,body,tags,cover_path,cover_alt,published_at,updated_at,sample",
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .overrideTypes<PostRow[], { merge: false }>();

      // Fail the build instead of deploying a Journal with missing articles.
      if (error) throw new Error(`Could not load posts from Supabase: ${error.message}`);

      store.clear();
      for (const row of data) {
        const published = new Date(row.published_at);
        const updated = new Date(row.updated_at);

        const parsed = await context.parseData({
          id: row.slug,
          data: {
            title: row.title,
            description: row.description,
            pubDate: published,
            // Only worth showing when the article changed after the day it went out.
            updatedDate: updated.valueOf() - published.valueOf() > DAY ? updated : undefined,
            tags: row.tags,
            cover: row.cover_path ? mediaUrl(url, row.cover_path) : undefined,
            coverAlt: row.cover_alt ?? undefined,
            sample: row.sample,
          },
        });

        store.set({
          id: row.slug,
          data: parsed,
          body: row.body,
          rendered: await context.renderMarkdown(row.body),
          digest: context.generateDigest(row as unknown as Record<string, unknown>),
        });
      }
      logger.info(`Loaded ${data.length} published post(s) from Supabase.`);
    },
  };
}
