import type { APIRoute } from "astro";
import { triggerRebuild } from "../../../../lib/studio/deploy";
import { UUID, firstIssue, json, postPatch, toColumns } from "../../../../lib/studio/posts";
import { MEDIA_BUCKET } from "../../../../lib/studio/rules";

export const prerender = false;

/** Save fields. Drafts save freely (autosave); a published article needs `live: true`. */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const id = params.id ?? "";
  if (!UUID.test(id)) return json({ error: "Article not found." }, 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const parsed = postPatch.safeParse(payload);
  if (!parsed.success) {
    const issue = firstIssue(parsed.error);
    return json({ error: issue?.message ?? "Invalid input.", field: issue?.field }, 422);
  }

  const { supabase } = locals;
  const { data: current, error: readError } = await supabase
    .from("posts")
    .select("id,status")
    .eq("id", id)
    .maybeSingle();
  if (readError) return json({ error: "Could not load the article." }, 500);
  if (!current) return json({ error: "Article not found." }, 404);

  if (current.status === "published" && !parsed.data.live) {
    return json({ error: "This article is live. Use Update live to save changes." }, 409);
  }

  const columns = toColumns(parsed.data);
  if (Object.keys(columns).length === 0) return json({ ok: true });

  const { data, error } = await supabase
    .from("posts")
    .update(columns)
    .eq("id", id)
    .select("updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return json({ error: "That slug is already used by another article.", field: "slug" }, 409);
    }
    return json({ error: "Could not save. Try again." }, 500);
  }

  const rebuild = current.status === "published" ? await triggerRebuild() : undefined;
  return json({ ok: true, updatedAt: data.updated_at, rebuild });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const id = params.id ?? "";
  if (!UUID.test(id)) return json({ error: "Article not found." }, 404);

  const { supabase } = locals;
  const { data: post, error: readError } = await supabase
    .from("posts")
    .select("id,status")
    .eq("id", id)
    .maybeSingle();
  if (readError) return json({ error: "Could not load the article." }, 500);
  if (!post) return json({ error: "Article not found." }, 404);

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return json({ error: "Could not delete the article." }, 500);

  // Best effort: remove the article's uploaded images too.
  const bucket = supabase.storage.from(MEDIA_BUCKET);
  for (const folder of [`covers/${id}`, `body/${id}`]) {
    const { data: files } = await bucket.list(folder);
    if (files?.length) await bucket.remove(files.map((file) => `${folder}/${file.name}`));
  }

  const rebuild = post.status === "published" ? await triggerRebuild() : undefined;
  return json({ ok: true, rebuild });
};
