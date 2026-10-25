import { VERCEL_DEPLOY_HOOK_URL } from "astro:env/server";

export type Rebuild = "triggered" | "skipped" | "failed";

/**
 * Asks Vercel to rebuild the static site so published changes go live. The Journal is
 * built from Supabase at build time, so nothing reaches visitors until this runs.
 */
export async function triggerRebuild(): Promise<Rebuild> {
  if (!VERCEL_DEPLOY_HOOK_URL) return "skipped";
  try {
    const response = await fetch(VERCEL_DEPLOY_HOOK_URL, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? "triggered" : "failed";
  } catch {
    return "failed";
  }
}
