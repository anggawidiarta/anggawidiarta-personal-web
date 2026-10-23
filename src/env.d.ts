/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts for /studio/* requests only. */
    supabase: import("@supabase/supabase-js").SupabaseClient;
    /** The signed-in admin, or null (anonymous or not on the allowlist). */
    user: { id: string; email?: string } | null;
  }
}
