import type { APIRoute } from "astro";
import { PUBLIC_SUPABASE_URL } from "astro:env/server";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, UUID, json } from "../../../lib/studio/posts";

export const prerender = false;

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Identifies the real format from the first bytes; the declared type is not trusted. */
function sniff(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

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
  const type = sniff(bytes);
  if (!type || !(IMAGE_TYPES as readonly string[]).includes(type)) {
    return json({ error: "Use a JPEG, PNG, WebP, AVIF or GIF image." }, 415);
  }

  const { supabase } = locals;
  const { data: post } = await supabase.from("posts").select("id").eq("id", postId).maybeSingle();
  if (!post) return json({ error: "Article not found." }, 404);

  const path = `${kind === "cover" ? "covers" : "body"}/${postId}/${crypto.randomUUID()}.${EXTENSION[type]}`;
  const { error } = await supabase.storage
    .from("blog-media")
    .upload(path, bytes, { contentType: type, upsert: false });
  if (error) return json({ error: "Could not upload the image. Try again." }, 500);

  return json({
    ok: true,
    path,
    url: `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-media/${path}`,
  });
};
