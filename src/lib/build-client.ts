import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LoaderContext } from "astro/loaders";

/**
 * Supabase client for build-time loaders. Uses the publishable key, so row-level
 * security decides what the public site may contain.
 * Returns null in dev without credentials; a production build without them throws,
 * because it would otherwise silently ship empty pages.
 */
export function buildClient(
  logger: LoaderContext["logger"],
  what: string,
): { supabase: SupabaseClient; url: string } | null {
  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
  const key =
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    if (import.meta.env.PROD) {
      throw new Error(
        `PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY are required to build ${what}.`,
      );
    }
    logger.warn(`Supabase env is missing; ${what} will be empty in dev.`);
    return null;
  }

  return { supabase: createClient(url, key, { auth: { persistSession: false } }), url };
}
