import type { APIRoute } from "astro";
import { studioPath, withNotice } from "../../lib/studio/content";
import { triggerRebuild } from "../../lib/studio/deploy";

export const prerender = false;

/** "Publish site": the only way homepage edits trigger a rebuild. Works without JS. */
export const POST: APIRoute = async ({ request, locals, redirect, url }) => {
  const form = await request.formData().catch(() => null);
  const next = studioPath(form?.get("next") ?? null, url.origin);

  const rebuild = await triggerRebuild();
  // Only a build that actually started clears "Unpublished changes".
  if (rebuild === "triggered") {
    await locals.supabase
      .from("site_settings")
      .update({ published_at: new Date().toISOString() })
      .eq("id", 1);
  }

  return redirect(withNotice(next, `site-${rebuild}`), 303);
};
