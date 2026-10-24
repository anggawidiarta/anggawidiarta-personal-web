// The only module that reads the blog collection. Swapping the content source
// happens in src/content.config.ts.
import { getCollection, render, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog"> & { number: number };

const WORDS_PER_MINUTE = 220;

/** Published posts, newest first, each with a stable chronological number (NO.001 = oldest). */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection("blog");
  return entries
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf())
    .map((entry, i) => ({ ...entry, number: i + 1 }))
    .reverse();
}

export async function getTags(): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const { data } of await getPosts()) {
    for (const tag of data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Newer and older neighbours of a post in the newest-first list. */
export function getAdjacent(posts: Post[], id: string) {
  const i = posts.findIndex((post) => post.id === id);
  return {
    newer: i > 0 ? posts[i - 1] : undefined,
    older: i >= 0 && i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

export const renderPost = (post: Post) => render(post);

export function readingTime(body = ""): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export const postNumber = (n: number) => `NO.${String(n).padStart(3, "0")}`;

export const slugifyTag = (tag: string) =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
