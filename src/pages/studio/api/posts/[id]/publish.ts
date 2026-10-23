import type { APIRoute } from "astro";
import { triggerRebuild } from "../../../../../lib/studio/deploy";
import { UUID, joinList, json } from "../../../../../lib/studio/posts";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const id = params.id ?? "";
  if (!UUID.test(id)) return json({ error: "Article not found." }, 404);

  const { supabase } = locals;
  const { data: post } = await supabase
    .from("posts")
    .select("id,title,description,body,tags,cover_path,cover_alt,published_at")
    .eq("id", id)
    .maybeSingle();
  if (!post) return json({ error: "Article not found." }, 404);

  // An article should be complete before it goes out.
  const missing: string[] = [];
  if (!post.title.trim() || post.title === "Untitled") missing.push("a title");
  if (!post.description.trim()) missing.push("a description");
  if (!post.body.trim()) missing.push("some content");
  if (!post.tags.length) missing.push("at least one tag");
  if (post.cover_path && !post.cover_alt?.trim()) missing.push("alt text for the cover image");
  if (missing.length) return json({ error: `Add ${joinList(missing)} before publishing.` }, 422);

  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: post.published_at ?? new Date().toISOString() })
    .eq("id", id);
  if (error) return json({ error: "Could not publish. Try again." }, 500);

  return json({ ok: true, rebuild: await triggerRebuild() });
};
