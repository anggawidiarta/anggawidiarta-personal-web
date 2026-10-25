import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "../lib/journal";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: "Angga Widiarta — Journal",
    description:
      "Notes from a fullstack developer in Lombok, Indonesia: Laravel, Astro, front-end craft and system architecture.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/journal/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: "<language>en</language>",
  });
}
