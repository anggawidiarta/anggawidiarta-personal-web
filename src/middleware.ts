import { defineMiddleware } from "astro:middleware";
import { createClient } from "./lib/supabase/server";

const STUDIO = "/studio";
const LOGIN = `${STUDIO}/login`;
const API = `${STUDIO}/api/`;

// Everything under /studio is private and must never be cached or indexed.
const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

const withPrivateHeaders = (response: Response) => {
  for (const [name, value] of Object.entries(privateHeaders)) {
    response.headers.set(name, value);
  }
  return response;
};

const redirect = (location: string) =>
  withPrivateHeaders(new Response(null, { status: 302, headers: { Location: location } }));

const reject = (status: number, error: string) =>
  withPrivateHeaders(
    new Response(JSON.stringify({ error }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/+$/, "") || "/";
  if (path !== STUDIO && !path.startsWith(`${STUDIO}/`)) return next();

  const isSafeMethod = context.request.method === "GET" || context.request.method === "HEAD";

  // Astro's checkOrigin covers form posts; JSON and fetch requests get the same rule here.
  if (!isSafeMethod && context.request.headers.get("origin") !== context.url.origin) {
    return reject(403, "Cross-origin request blocked.");
  }

  const supabase = createClient(context);
  context.locals.supabase = supabase;
  context.locals.user = null;

  // getUser() asks the Auth server, so a session revoked by sign-out is rejected at once
  // (getClaims() only checks the JWT signature and would accept a copied cookie until
  // it expires). Never trust getSession() on the server.
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (user) {
    // Being signed in is not enough: the user must be on the admins allowlist (RLS lets
    // a user read only their own row).
    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (admin) context.locals.user = { id: user.id, email: user.email };
  }

  const isAdmin = context.locals.user !== null;
  const isLogin = path === LOGIN;

  if (!isAdmin && path.startsWith(API)) return reject(401, "Sign in again to continue.");
  if (!isAdmin && !isLogin) return redirect(LOGIN);
  if (isAdmin && isLogin && context.request.method === "GET") return redirect(STUDIO);

  return withPrivateHeaders(await next());
});
