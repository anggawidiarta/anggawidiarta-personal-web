import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import type { APIContext } from "astro";
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "astro:env/server";

/**
 * Supabase client bound to one request. Sessions live in httpOnly cookies:
 * there is no Supabase client in the browser, so the page scripts can never read them.
 * Cache headers Supabase hands to `setAll` are covered by the blanket no-store the
 * middleware puts on every /studio response.
 */
export function createClient({ request, cookies }: Pick<APIContext, "request" | "cookies">) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            ...options,
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
          });
        }
      },
    },
  });
}

/**
 * Cookie-less client used to check a password before any session cookie exists.
 * Login verifies credentials and the admin allowlist with this client, and only
 * then hands the session to the cookie-writing client, so a non-admin never
 * receives a cookie at all.
 */
export const createVerifier = () =>
  createBareClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
