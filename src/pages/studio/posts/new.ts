import type { APIRoute } from "astro";
import { draftSlug } from "../../../lib/studio/posts";

export const prerender = false;

/** "New article": create an empty draft and open it in the editor. Works without JS. */
export const POST: APIRoute = async ({ locals, redirect }) => {
  const { data, error } = await locals.supabase
    .from("posts")
    .insert({ slug: draftSlug(), title: "Untitled" })
    .select("id")
    .single();

  if (error || !data) return redirect("/studio?error=create", 303);
  return redirect(`/studio/posts/${data.id}`, 303);
};
