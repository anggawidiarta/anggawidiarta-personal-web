import type { APIRoute } from "astro";
import { triggerRebuild } from "../../../../../lib/studio/deploy";
import { UUID, json } from "../../../../../lib/studio/posts";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const id = params.id ?? "";
  if (!UUID.test(id)) return json({ error: "Article not found." }, 404);

  const { data, error } = await locals.supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return json({ error: "Could not unpublish. Try again." }, 500);
  if (!data) return json({ error: "Article not found." }, 404);

  return json({ ok: true, rebuild: await triggerRebuild() });
};
