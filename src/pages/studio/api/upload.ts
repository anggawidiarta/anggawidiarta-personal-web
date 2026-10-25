import type { APIRoute } from "astro";
import { PUBLIC_SUPABASE_URL } from "astro:env/server";
import { UUID, json } from "../../../lib/studio/posts";
import { sniffImage } from "../../../lib/studio/images";
import { IMAGE_EXTENSIONS, MAX_UPLOAD_BYTES, MEDIA_BUCKET, mediaUrl } from "../../../lib/studio/rules";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid upload." }, 400);
  }

  const file = form.get("file");
  const kind = form.get("kind");
  const postId = String(form.get("postId") ?? "");

  if (!(file instanceof File)) return json({ error: "Choose an image to upload." }, 400);
  if (kind !== "cover" && kind !== "body") return json({ error: "Invalid upload." }, 400);
  if (!UUID.test(postId)) return json({ error: "Article not found." }, 404);
  if (file.size === 0) return json({ error: "That file is empty." }, 422);
  if (file.size > MAX_UPLOAD_BYTES) {
    return json({ error: "Images can be up to 4 MB. Resize it and try again." }, 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return json({ error: "Use a JPEG, PNG, WebP, AVIF or GIF image." }, 415);

  const { supabase } = locals;
  const { data: post } = await supabase.from("posts").select("id").eq("id", postId).maybeSingle();
  if (!post) return json({ error: "Article not found." }, 404);

  const path = `${kind === "cover" ? "covers" : "body"}/${postId}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[type]}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, { contentType: type, upsert: false });
  if (error) return json({ error: "Could not upload the image. Try again." }, 500);

  return json({ ok: true, path, url: mediaUrl(PUBLIC_SUPABASE_URL, path) });
};
